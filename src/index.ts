import { LearningTypes, type FixAndEncryptedHop, type Hop } from "./types.js";
import { reverseKey, bit, KEELOQ_NLF, g5 } from "./utils.js";

/**
 * Get key from `fix` and `hop`
 */
export const getKey = (fix: number, hop: number): bigint => reverseKey((BigInt(fix) << 32n) | BigInt(hop));

/**
 * Get `fix` and `hop` from key
 */
export const fromKey = (key: bigint): FixAndEncryptedHop => {
    const yek = reverseKey(key);

    return { fix: Number(yek >> 32n), hop: Number(yek & 0xFFFFFFFFn) }
}

/**
 * Encryption
 * @param data Data to be encrypted
 * @param key Manufacturer key
 */
export const encrypt = (data: number, key: bigint): number => {
    let x = data >>> 0;
    for (let r = 0; r < 528; r++) {
        const a = bit(x, 0) ^ bit(x, 16) ^ bit(key, r & 63) ^ bit(KEELOQ_NLF, g5(x, 1, 9, 20, 26, 31));
        x = ((x >>> 1) ^ (a << 31)) >>> 0;
    }
    return x >>> 0;
}

/**
 * Decryption
 * @param data Data to be decrypted
 * @param key Manufacturer key
 */
export const decrypt = (data: number, key: bigint): number => {
    let x = data >>> 0;
    for (let r = 0; r < 528; r++) {
        const a = bit(x, 31) ^ bit(x, 15) ^ bit(key, (15 - r) & 63) ^ bit(KEELOQ_NLF, g5(x, 0, 8, 19, 25, 30));
        x = ((x << 1) ^ a) >>> 0;
    }
    return x >>> 0;
}

/**
 * Simple Learning Decrypt
 * @param data Encrypted data
 * @param key Manufacturer key
 * @returns {Hop} Decrypted `hop` object
 */
export const simple_learning = (data: number, key: bigint): Hop => {
    const hop = decrypt(data, key);

    return { btn: (hop >> 28) & 0xF, serial: (hop >> 16) & 0xFFF, cnt: hop & 0xFFFF, raw: hop }
}

/**
 * Normal learning
 * @param serial Serial number
 * @param key Manufacturer key
 * @returns {bigint} Key for this serial number
 */
export const normal_learning = (serial: number, key: bigint): bigint => {
    let d = serial >>> 0;
    d &= 0x0FFFFFFF;

    const data1 = (d | 0x20000000) >>> 0;
    const k1 = decrypt(data1, key) >>> 0;

    const data2 = (d | 0x60000000) >>> 0;
    const k2 = decrypt(data2, key) >>> 0;

    return (BigInt(k2) << 32n) | BigInt(k1);
}

/**
 * Secure learning
 * @param serial Serial number
 * @param seed Seed
 * @param key Manufacturer key
 * @returns {bigint} Key for this serial number and seed
 */
export const secure_learning = (serial: number, seed: number, key: bigint): bigint => {
    serial = serial >>> 0;
    seed = seed >>> 0;
    serial &= 0x0FFFFFFF;

    const k1 = decrypt(serial, key) >>> 0;
    const k2 = decrypt(seed, key) >>> 0;

    return (BigInt(k1) << 32n) | BigInt(k2);
}

/**
 * Magic XOR Type-1 learning
 * @param serial Serial number
 * @param key Manufacturer key
 * @returns {bigint} Key for this serial number
 */
export const magic_xor_type1_learning = (serial: number, key: bigint): bigint => {
    serial = serial >>> 0;
    serial &= 0x0FFFFFFF;

    return ((BigInt(serial) << 32n) | BigInt(serial)) ^ key;
}

/**
 * FAAC SLH (SPA) learning
 * @param seed Seed
 * @param key Manufacturer key
 * @returns {bigint} Key for this seed
 */
export const faac_learning = (seed: number, key: bigint): bigint => {
    seed = seed >>> 0;

    const hs = (seed >>> 16) & 0xFFFF;
    const lsb = ((hs << 16) | 0x544D) >>> 0;

    const encryptedSeed = encrypt(seed, key) >>> 0;
    const encryptedLsb = encrypt(lsb, key) >>> 0;
    return (BigInt(encryptedSeed) << 32n) | BigInt(encryptedLsb);
}

/**
 * Prototype for KeeLoq implementation
 * @abstract
 */
export abstract class AbstractKeeloqImpl {
    /**
     * Prototype for KeeLoq implementation
     * @param mfkey Manufacturer key
     * @param serial Serial number
     * @param btn Button number
     * @param counter Counter value (default 1)
     * @abstract
     */
    constructor(public mfkey: bigint, public serial: number, public btn: number, public counter = 1) {}
    /** Fixed part (aka `fix`) */
    public get fix(): number { return this.btn << 28 | this.serial; }
    /** Unencrypted dynamic part (aka `hop`) */
    abstract get hop_raw(): number;
    /** Encrypted dynamic part (aka `hop`) */
    abstract get hop(): number;
    /** Combined `fix` and `hop` */
    public get key(): bigint { return getKey(this.fix, this.hop); }

    /**
     * Increment counter
     * @param incr_value Increment value
     */
    public cnt_incr(incr_value: number = 1): void { this.counter += incr_value; }

    /**
     * Decrement counter
     * @param decr_value Decrement value
     */
    public cnt_decr(decr_value: number = 1): void { this.counter -= decr_value; }
}

/** Simple high-level API for KeeLoq */
export class KeeloqImpl extends AbstractKeeloqImpl {
    /** Seed for Secure learning */
    public seed: number = 0;

    /**
     * Simple high-level API for KeeLoq
     * @param mfkey Manufacturer key
     * @param learning Learning type
     * @param serial Serial number
     * @param btn Button number
     * @param counter Counter value (default 1)
     */
    constructor(public mfkey: bigint, public learning: LearningTypes, public serial: number, public btn: number, public counter = 1) { super(mfkey, serial, btn, counter); }

    public get hop_raw(): number { return this.btn << 28 | (this.fix & 0x3FF) << 16 | this.counter; }

    public get hop(): number {
        let key: bigint;
        switch(this.learning) {
            case LearningTypes.SIMPLE_LEARNING:
                key = this.mfkey;
            break;
            case LearningTypes.NORMAL_LEARNING:
                key = normal_learning(this.fix, this.mfkey);
            break;
            case LearningTypes.SECURE_LEARNING:
                key = secure_learning(this.fix, this.seed, this.mfkey);
            break;
        }

        return encrypt(this.hop_raw, key);
    }
}

export * from "./types.js";