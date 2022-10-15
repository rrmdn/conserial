# Async Batcher

Run promises concurrently without using Promise.all(). Dependencies are resolved automatically.

## Installation

```bash
npm install async-batcher
```

## Usage

```js
const AsyncBatcher = require("async-batcher");

const batcher = new AsyncBatcher();

const one = batcher.async(async () => 1);
const two = batcher.async(async () => 2);
// 1 and 2 are run concurrently
// 3 is run after 1 and 2 are resolved
const three = batcher.async(
  async (one, two) => one.result + two.result,
  [one, two]
);

// don't forget to run the batcher
await batcher.run();

console.log(three.result); // 3
```

## Disclaimer

This is a proof of concept. API may change in the future. Use at your own risk.
