/**
 * Implementations of various protocols from [unleashed-firmware](https://github.com/DarkFlippers/unleashed-firmware) for Flipper Zero
 * 
 * Manufacturer keys will never be published
 */

import { AbstractKeeloqImpl, encrypt, normal_learning } from "../src";

export class ANMotors extends AbstractKeeloqImpl {
    constructor(public serial: number, public btn: number, public counter: number = 0x2121) {
        super(0n, serial, btn, counter)
    }

    public get hop_raw(): number {
        return (this.counter & 0xFF) << 24 | (this.counter & 0xFF) << 16 | (this.btn & 0xF) << 12 | 0x404;
    }

    public get hop(): number {
        return this.hop_raw
    }

    public cnt_incr(incr_value?: number): void {
        this.counter += 0x101 * (incr_value ?? 1)
    }

    public cnt_decr(decr_value?: number): void {
        this.counter -= 0x101 * (decr_value ?? 1)
    }
}

export class HCS101 extends AbstractKeeloqImpl {
    constructor(public serial: number, public btn: number, public counter: number = 0x2121) {
        super(0n, serial, btn, counter)
    }

    public get hop_raw(): number {
        return this.counter << 16 | (this.btn & 0xF) << 12 | 0x000;
    }

    public get hop(): number {
        return this.hop_raw
    }
}

export class Aprimatic extends AbstractKeeloqImpl {
    constructor(public mfkey: bigint, public serial: number, public btn: number, public counter = 1) {
        super(mfkey, serial, btn, counter)
    }

    public get hop_raw(): number {
        let apri_serial = this.serial;
        let apr1 = 0;
        for (let i = 1; i !== 0b10000000000; i <<= 1) {
            if (apri_serial & i) apr1++;
        }

        apri_serial &= 0b00001111111111;

        if (apr1 % 2 === 0) {
            apri_serial |= 0b110000000000;
        }

        return ((this.btn << 28) | ((apri_serial & 0xFFF) << 16) | this.counter) >>> 0;
    }

    public get hop(): number {
        return encrypt(this.hop_raw, this.mfkey)
    }
}


/**
 * DTM Neo, Came_Space - simple learning (useNormal = false)
 * 
 * FAAC_RC,XT , Mutanco_Mutancode, Genius_Bravo, GSN - normal learning (useNormal = true)
 */
export class Universal1 extends AbstractKeeloqImpl {
    constructor(public mfkey: bigint, public useNormal: boolean, public serial: number, public btn: number, public counter = 1) {
        super(mfkey, serial, btn, counter)
    }

    public get hop_raw(): number {
        return this.btn << 28 | (this.serial & 0xFFF) << 16 | this.counter;
    }

    public get hop(): number {
        if(this.useNormal) {
            let man = normal_learning(this.serial, this.mfkey)
            return encrypt(this.hop_raw, man)
        }
        return encrypt(this.hop_raw, this.mfkey)
    }
}

/**
 * NICE Smilo, NICE MHOUSE, JCM Tech - simple learning
 */
export class Universal2 extends AbstractKeeloqImpl {
    constructor(public mfkey: bigint, public serial: number, public btn: number, public counter = 1) {
        super(mfkey, serial, btn, counter)
    }

    public get hop_raw(): number {
        return this.btn << 28 | (this.serial & 0xFF) << 16 | this.counter;
    }

    public get hop(): number {
        return encrypt(this.hop_raw, this.mfkey)
    }
}

// Beninca and Dea Mio skipped, check custom_implementations.ts

/**
 * Centurion - normal learning, discriminator = `0x1CE`
 * 
 * Monarch - normal learning, discriminator = `0x100`
 */
export class Universal3 extends AbstractKeeloqImpl {
    constructor(public mfkey: bigint, public discriminator: number, public serial: number, public btn: number, public counter = 1) {
        super(mfkey, serial, btn, counter)
    }

    public get hop_raw(): number {
        return this.btn << 28 | (this.discriminator) << 16 | this.counter;
    }

    public get hop(): number {
        return encrypt(this.hop_raw, normal_learning(this.serial, this.mfkey))
    }
}

let anmotors = new ANMotors(
    0x472b573,
    2,
    0x2424
)
console.log(`AN-Motors: ${anmotors.key.toString(16)}`)

let hcs101 = new HCS101(
    0x004eb5c,
    2,
    4
)
console.log(`HCS101: ${hcs101.key.toString(16).padStart(16, "0")}`)

let aprimatic = new Aprimatic(
    BigInt(process.env.APRIMATIC_KEY as string),
    0x0659546,
    8,
    0x1A
)
console.log(`Aprimatic: ${aprimatic.key.toString(16)}`)

let camespace =  new Universal1(
    BigInt(process.env.CAME_SPACE_KEY as string),
    false,
    0x033b689,
    4,
    6
)
console.log(`CAME Space: ${camespace.key.toString(16)}`)

let faac_rc_xt =  new Universal1(
    BigInt(process.env.FAAC_RC_XT_KEY as string),
    true,
    0x01027c5,
    2,
    4
)
console.log(`FAAC RC,XT: ${faac_rc_xt.key.toString(16)}`)

let nice_smilo = new Universal2(
    BigInt(process.env.NICE_SMILO_KEY as string),
    0x06960e9,
    2,
    4
)
console.log(`NICE Smilo: ${nice_smilo.key.toString(16)}`)

let centurion = new Universal3(
    BigInt(process.env.CENTURION_KEY as string),
    0x1CE,
    0x0001C97,
    2,
    4
)
console.log(`Centurion: ${centurion.key.toString(16)}`)

let monarch = new Universal3(
    BigInt(process.env.MONARCH_KEY as string),
    0x100,
    0x000F2ED,
    0xA,
    4
)
console.log(`Monarch: ${monarch.key.toString(16)}`)