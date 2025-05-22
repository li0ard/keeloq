import { AbstractKeeloqImpl, magic_xor_type1_learning, encrypt } from "../src";

/**
 * Example for custom KeeLoq implementation
 * 
 * For example used Beninca protocol
 * from https://github.com/DarkFlippers/unleashed-firmware/blob/dev/lib/subghz/protocols/keeloq.c#L254
 */
class BenincaImplementation extends AbstractKeeloqImpl {
    constructor(public mfkey: bigint, public serial: number, public btn: number, public counter = 1) {
        super(mfkey, serial, btn, counter)
    }

    public get hop_raw(): number {
        return this.btn << 28 | 0x0 << 16 | this.counter;
    }

    public get hop(): number {
        let key: bigint = magic_xor_type1_learning(this.serial, this.mfkey);
        return encrypt(this.hop_raw, key)
    }
}

let beninca = new BenincaImplementation(
    0x123456789ABCDEFn,
    0x0890f80,
    8,
    10
)
console.log(beninca.key.toString(16))

/**
 * Example for custom KeeLoq implementation
 * 
 * For example used Dea Mio protocol
 * from https://github.com/DarkFlippers/unleashed-firmware/blob/dev/lib/subghz/protocols/keeloq.c#L261
 */
class DeaMioImplementation extends AbstractKeeloqImpl {
    constructor(public mfkey: bigint, public serial: number, public btn: number, public counter = 1) {
        super(mfkey, serial, btn, counter)
    }

    public get hop_raw(): number {
        let first_disc_num = (this.serial >> 8) & 0xF
        let result_disc = (0xC + (first_disc_num % 4));
        let dea_serial = (this.serial & 0xFF) | ((result_disc) << 8);

        return this.btn << 28 | (dea_serial & 0xFFF) << 16 | this.counter;
    }

    public get hop(): number {
        if(this.btn == 0xF) return 0
        return encrypt(this.hop_raw, this.mfkey)
    }
}

let deamio = new DeaMioImplementation(
    0x123456789ABCDEFn,
    0x2a4d869,
    0x8,
    0xD
)
console.log(deamio.key.toString(16).padStart(16, "0"))
deamio.btn = 0xF
console.log(deamio.key.toString(16).padStart(16, "0"))