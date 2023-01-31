# Unlocked [![API Docs](https://img.shields.io/badge/API%20Docs-blue.svg)](https://paka.dev/npm/unlocked)

> Parse lockfiles from npm, yarn, and pnpm into a common format for use in other tools.
> The common format includes additional information about the lockfile, such as the
> license of the package, the version of the package manager, and the type of lockfile and is based on the
> pnpm lockfile format.

## Install

```bash
$ npm install unlocked
```

## Usage

```ts
import { parse } from "unlocked";

// currently only supports pnpm-lock.yaml files
const lockfile = await parse(process.cwd());
```
