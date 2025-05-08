import { expect, test } from "bun:test"
import { getKey, normal_learning, secure_learning, simple_learning } from "../src";

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