import { expect, test, describe } from "bun:test"
import { faac_learning, getKey, KeeloqImpl, LearningTypes, magic_xor_type1_learning, normal_learning, secure_learning, simple_learning } from "../src";
import { reverseKey } from "../src/utils";

test("Simple learning", () => {
    let key = 0x123456789ABCDEFn
    let hop = 0xf16c47a6;
    let fix = 0x239b3deb
    
    let hop_dec = simple_learning(hop, key)

    expect(hop_dec.btn).toBe(2)
    expect(hop_dec.serial).toBe(491)
    expect(hop_dec.cnt).toBe(10)
    expect(hop_dec.raw).toBe(0x21eb000a)
    expect(getKey(fix, hop)).toBe(0x65e2368fd7bcd9c4n)
})

test("Normal learning", () => {
    let hop = 0xc2be08b0
    let fix = 0x1ee2b949
    let key = 0x123456789ABCDEFn

    let man = normal_learning(fix, key)
    let hop_dec = simple_learning(hop, man)

    expect(hop_dec.btn).toBe(1)
    expect(hop_dec.serial).toBe(329)
    expect(hop_dec.cnt).toBe(6)
    expect(hop_dec.raw).toBe(0x11490006)
    expect(getKey(fix, hop)).toBe(0xd107d43929d4778n)
})

test("Secure learning", () => {
    let hop = 0xcd831b4f
    let fix = 0x11111111
    let seed = 0x22222222
    let key = 0x123456789ABCDEFn

    let man = secure_learning(fix, seed, key)
    let hop_dec = simple_learning(hop, man)
    
    expect(hop_dec.btn).toBe(1)
    expect(hop_dec.serial).toBe(273)
    expect(hop_dec.cnt).toBe(21)
    expect(hop_dec.raw).toBe(0x11110015)
    expect(getKey(fix, hop)).toBe(0xf2d8c1b388888888n)
})

test("Magic XOR Type-1 learning", () => {
    let hop = 0xbe94c1f2
    let fix = 0x1088b380
    let key = 0x123456789ABCDEFn

    let man = magic_xor_type1_learning(fix & 0x0FFFFFFF, key)
    let hop_dec = simple_learning(hop, man)

    expect(hop_dec.btn).toBe(1)
    expect(hop_dec.serial).toBe(896)
    expect(hop_dec.cnt).toBe(10)
    expect(hop_dec.raw).toBe(0x1380000a)
    expect(getKey(fix, hop)).toBe(0x4f83297d01cd1108n)
})

test("FAAC SLH (SPA) learning", () => {
    let hop = 0xe6ed4ad2
    let fix = 0xa060b2d6
    let key = 0x123456789ABCDEFn
    let seed = 0x2e60b2d2

    let man = faac_learning(seed, key)
    let hop_dec = simple_learning(hop, man)

    expect(hop_dec.raw).toBe(0xd620004c)
    expect(reverseKey(getKey(fix, hop))).toBe(0xa060b2d6e6ed4ad2n)
    
})

describe("KeeloqImpl", () => {
    test("Simple learning", () => {
        let a = new KeeloqImpl(
            0x123456789ABCDEFn,
            LearningTypes.SIMPLE_LEARNING,
            0x39b3deb,
            2,
            10
        )
        expect(a.hop_raw).toBe(0x21eb000a)
        expect(a.hop).toBe(0xf16c47a6)
        expect(a.key).toBe(0x65e2368fd7bcd9c4n)
        a.cnt_incr(2)
        expect(a.key).toBe(0x1532f97fd7bcd9c4n)
        a.cnt_decr()
        expect(a.key).toBe(0x2f1f4f77d7bcd9c4n)
    })

    test("Normal learning", () => {
        let a = new KeeloqImpl(
            0x123456789ABCDEFn,
            LearningTypes.NORMAL_LEARNING,
            0x5999533,
            0x2,
            0x9
        )
        expect(a.hop_raw).toBe(0x21330009)
        expect(a.hop).toBe(0x634c9949)
        expect(a.key).toBe(0x929932c6cca999a4n)
        a.cnt_incr(2)
        expect(a.key).toBe(0xf7198b0fcca999a4n)
        a.cnt_decr()
        expect(a.key).toBe(0xf155635ecca999a4n)
    })

    test("Secure learning", () => {
        let a = new KeeloqImpl(
            0x123456789ABCDEFn,
            LearningTypes.SECURE_LEARNING,
            0x007b310,
            0x2,
            0x5
        )
        a.seed = 0x007b310
        expect(a.hop_raw).toBe(0x23100005)
        expect(a.hop).toBe(0xb0d15118)
        expect(a.key).toBe(0x188a8b0d08cde004n)
        a.cnt_incr(2)
        expect(a.key).toBe(0x5bb1153008cde004n)
        a.cnt_decr()
        expect(a.key).toBe(0xd4ac267e08cde004n)
    })
})