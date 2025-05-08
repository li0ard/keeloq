export const KEELOQ_NLF = 0x3A5C742E
export const bitNumber = (x: number, n: number): number => {
    return (x >>> n) & 1;
}

export const bitBigInt = (x: bigint, n: number): number => {
    return Number((x >> BigInt(n)) & 1n);
}

export const g5 = (x: number, a: number, b: number, c: number, d: number, e: number): number => {
    return (bitNumber(x, a) + bitNumber(x, b) * 2 + bitNumber(x, c) * 4 + bitNumber(x, d) * 8 + bitNumber(x, e) * 16);
}

export const reverseKey = (key: bigint): bigint => {
    let reverseKey = 0n;
    for (let i = 0; i < 64; i++) {
        reverseKey = (reverseKey << 1n) | ((key >> BigInt(i)) & 1n);
    }
    return reverseKey;
}

export interface Hop {
    /** Button code */
    btn: number,
    /** Serial part (`serial & 0x3ff`) */
    serial: number,
    /** Counter */
    cnt: number,
    /** RAW `hop` */
    raw: number
}

export interface FixAndEncryptedHop {
    fix: number,
    hop: number
}