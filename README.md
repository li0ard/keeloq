<p align="center">
    <a href="https://github.com/li0ard/keeloq/">
        <img src="https://raw.githubusercontent.com/li0ard/keeloq/main/.github/logo.png" alt="@li0ard/keeloq logo" title="@li0ard/keeloq" width="120" /><br>
    </a><br>
    <b>@li0ard/keeloq</b><br>
    <b>Playground for KeeLoq cipher</b>
    <br>
    <a href="https://li0ard.is-cool.dev/keeloq">docs</a>
    <br><br>
    <a href="https://github.com/li0ard/keeloq/actions/workflows/test.yml"><img src="https://github.com/li0ard/keeloq/actions/workflows/test.yml/badge.svg" /></a>
    <a href="https://github.com/li0ard/keeloq/blob/main/LICENSE"><img src="https://img.shields.io/github/license/li0ard/keeloq" /></a>
    <br>
    <a href="https://npmjs.com/package/@li0ard/keeloq"><img src="https://img.shields.io/npm/v/@li0ard/keeloq" /></a>
    <a href="https://jsr.io/@li0ard/keeloq"><img src="https://jsr.io/badges/@li0ard/keeloq" /></a>
    <br>
    <hr>
</p>

> [!WARNING]
> The library has been created for educational purposes only. The author negatively refers to any unauthorized and/or criminal actions with systems using KeeLoq.
> Also the author is not responsible for your actions.

## Installation

```bash
# from NPM
npm i @li0ard/keeloq

# from JSR
bunx jsr i @li0ard/keeloq
```

## Examples

The library contains both primitive low-level functions and a high-level API class

### Decrypt "Simple learning"
```ts
import { simple_learning } from "@li0ard/keeloq"

let key = 0x123456789ABCDEFn; // Manufacturer key
let hop = 0xf16c47a6; // Encrypted hop
let decrypted = simple_learning(hop, key);
console.log(decrypted) // -> { btn: 2, serial: 491, cnt: 10, raw: 569049098 }
```

### Usage of high-level API class
```ts
import { KeeloqImpl, LearningTypes } from "@li0ard/keeloq"

let impl = new KeeloqImpl(
    0x123456789ABCDEFn, // Manufacturer key
    LearningTypes.SIMPLE_LEARNING, // Learning type
    0x39b3deb, // Serial number
    2, // Button number
    10 // Counter value
)

console.log(impl.key) // -> 0x65e2368fd7bcd9c4n
impl.cnt_incr(2) // Increasing counter by 2
console.log(impl.key) // -> 0x1532f97fd7bcd9c4n
```

## Acknowledgements

Some parts were based on or greatly inspired by these projects:

- [unleashed-firmware](https://github.com/DarkFlippers/unleashed-firmware) - Original implementation of low-level primitives in C and library logo