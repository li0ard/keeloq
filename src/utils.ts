/** KeeLoq NLFSR constant */
export const KEELOQ_NLF = 0x3A5C742E

/**
 * Returns value of specified bit in number
 * @param x Number
 * @param n Position
 */
export const bitNumber = (x: number, n: number): number => {
    return (x >>> n) & 1;
}

/**
 * Returns value of specified bit in number
 * @param x Number
 * @param n Position
 */
export const bitBigInt = (x: bigint, n: number): number => {
    return Number((x >> BigInt(n)) & 1n);
}

/**
 * KeeLoq NLFSR function
 * 
 * Extracts five specified bits from number and combines them into new number
 * @param x Number
 * @param a Position of first bit (low-order, weight 1)
 * @param b Position of second bit (weight 2)
 * @param c Position of third bit (weight 4)
 * @param d Position of fourth bit (weight 8)
 * @param e Position of fifth bit (high-order, weight 16)
 */
export const g5 = (x: number, a: number, b: number, c: number, d: number, e: number): number => {
    return (bitNumber(x, a) + bitNumber(x, b) * 2 + bitNumber(x, c) * 4 + bitNumber(x, d) * 8 + bitNumber(x, e) * 16);
}

/**
 * Reverses bit order in a 64-bit number
 * @param key Number
 */
export const reverseKey = (key: bigint): bigint => {
    let reverseKey = 0n;
    for (let i = 0; i < 64; i++) {
        reverseKey = (reverseKey << 1n) | ((key >> BigInt(i)) & 1n);
    }
    return reverseKey;
}