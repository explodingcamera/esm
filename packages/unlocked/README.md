# Unlocked

> Parse lockfiles from npm, yarn, and pnpm into a common format for use in other tools.

## Install

```bash
$ npm install unlocked
```

## Usage

```ts
import { parse } from "unlocked";

const lockfile = await parse(process.cwd());
```
