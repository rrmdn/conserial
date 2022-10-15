# Conserial

Run promises concurrently in a serial manner. Dependencies are resolved automatically.

## Installation

```bash
npm install conserial
```

## Usage

```js
const Conserial = require("conserial");

const run = new Conserial();

const one = run.async(async () => 1);
const two = run.async(async () => 2);
// 1 and 2 are run concurrently
// 3 is run after 1 and 2 are resolved
const three = run.async(
  async (one, two) => one.result + two.result,
  [one, two] // register dependencies
);

// don't forget to resolve these promises
await run.batch();

console.log(three.result); // 3
```

## Disclaimer

This is a proof of concept. API may change in the future. Use at your own risk.
