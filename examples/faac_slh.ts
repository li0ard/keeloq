import { AbstractKeeloqImpl, encrypt, faac_learning } from "../src";

class FAACSLHImplementation extends AbstractKeeloqImpl {
    constructor(public mfkey: bigint, public serial: number, public seed: number, public btn: number, public counter = 1) {
        super(mfkey, serial, btn, counter)
    }

    public get fix(): number {
        return (this.serial << 4 | this.btn) >>> 0;
    }

    public get hop_raw(): number {
        const fix = this.fix;
        if (this.counter % 2 === 0) {
            return (
                ((fix >> 4) & 0xF) << 28 |
                (fix & 0xF) << 24 |
                ((fix >> 8) & 0xF) << 20 |
                (this.counter & 0xFFFFF)
            ) >>> 0;
        } else {
            return (
                ((fix >> 20) & 0xF) << 28 |
                ((fix >> 16) & 0xF) << 24 |
                ((fix >> 12) & 0xF) << 20 |
                (this.counter & 0xFFFFF)
            ) >>> 0;
        }
    }

    public get hop(): number {
        return encrypt(this.hop_raw, faac_learning(this.seed, this.mfkey))
    }

    public get key(): bigint {
        return (BigInt(this.fix) << 32n) | BigInt(this.hop)
    }

    /** Prog. mode key (aka `Ke`) */
    public get prog(): bigint {
        let data_prg = new Array<number>(8)
        let data_tmp = 0
        data_prg[0] = 0
        data_prg[1] = this.counter & 0xFF
        data_prg[2] = (this.seed & 0xFF);
        data_prg[3] = (this.seed >> 8 & 0xFF);
        data_prg[4] = (this.seed >> 16 & 0xFF);
        data_prg[5] = (this.seed >> 24);
        data_prg[2] ^= data_prg[1];
        data_prg[3] ^= data_prg[1];
        data_prg[4] ^= data_prg[1];
        data_prg[5] ^= data_prg[1];

        for(let i = data_prg[1] & 0x0F; i != 0; i--) {
            data_tmp = data_prg[5];

            data_prg[5] = ((data_prg[5] << 1) & 0xFF) | (data_prg[4] & 0x80) >> 7;
            data_prg[4] = ((data_prg[4] << 1) & 0xFF) | (data_prg[3] & 0x80) >> 7;
            data_prg[3] = ((data_prg[3] << 1) & 0xFF) | (data_prg[2] & 0x80) >> 7;
            data_prg[2] = ((data_prg[2] << 1) & 0xFF) | (data_tmp & 0x80) >> 7;
        }

        data_prg[6] = 0x0F;
        data_prg[7] = 0x52;

        let enc_prg_1 = (data_prg[7] << 24 | data_prg[6] << 16 | data_prg[5] << 8 | data_prg[4]) >>> 0;
        let enc_prg_2 = (data_prg[3] << 24 | data_prg[2] << 16 | data_prg[1] << 8 | data_prg[0]) >>> 0;

        return (BigInt(enc_prg_1) << 32n) | BigInt(enc_prg_2)
    }

    /** Prog. mode key #2 (aka `Kd`) */
    public get prog_dec(): bigint {
        let data_prg = new Array<number>(8)
        let data_tmp = 0

        let prog_hi = Number(this.prog >> 32n)
        let prog_lo = Number(this.prog & 0xFFFFFFFFn)
        
        data_prg[0] = (prog_lo & 0xFF);
        data_prg[1] = ((prog_lo >> 8) & 0xFF);
        data_prg[2] = ((prog_lo >> 16) & 0xFF);
        data_prg[3] = (prog_lo >> 24);
        data_prg[4] = (prog_hi & 0xFF);
        data_prg[5] = ((prog_hi >> 8) & 0xFF);
        data_prg[6] = ((prog_hi >> 16) & 0xFF);
        data_prg[7] = (prog_hi >> 24);

        for(let i = data_prg[1] & 0xF; i != 0; i--) {
            data_tmp = data_prg[2];

            data_prg[2] = data_prg[2] >> 1 | (data_prg[3] & 1) << 7;
            data_prg[3] = data_prg[3] >> 1 | (data_prg[4] & 1) << 7;
            data_prg[4] = data_prg[4] >> 1 | (data_prg[5] & 1) << 7;
            data_prg[5] = data_prg[5] >> 1 | (data_tmp & 1) << 7;
        }

        data_prg[2] ^= data_prg[1];
        data_prg[3] ^= data_prg[1];
        data_prg[4] ^= data_prg[1];
        data_prg[5] ^= data_prg[1];

        let dec_prg_1 = (data_prg[7] << 24 | data_prg[6] << 16 | data_prg[5] << 8 | data_prg[4]) >>> 0;
        let dec_prg_2 = (data_prg[3] << 24 | data_prg[2] << 16 | data_prg[1] << 8 | data_prg[0]) >>> 0;

        return (BigInt(dec_prg_1) << 32n) | BigInt(dec_prg_2)
    }
}

let a = new FAACSLHImplementation(
    0x123456789ABCDEFn,
    0xa060b2d,
    0x2e60b2d2,
    6,
    0x4B
)

console.log(a.prog.toString(16))
console.log(a.prog_dec.toString(16))
a.cnt_incr()
console.log(a.key.toString(16))