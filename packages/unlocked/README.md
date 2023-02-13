# Unlocked [![API Docs](https://img.shields.io/badge/API%20Docs-blue.svg)](https://paka.dev/npm/unlocked)

> Parse lockfiles from various package managers into a common format
## Differences from other tools

- **Monorepo support** - CommonLock is build around the idea of `importers` which are the projects in your monorepo.
- **More Metadata** - CommonLock includes additional metadata about the lockfile, such as license information and authors.
- **Interoperability** - CommonLock can be converted into other formats, such as CycloneDX SBOMs.

My primary use case for this is building [legalizer](../legalizer) which is a tool for generating legal information about your dependencies.

## Supported Lockfiles/Package Managers

- [x] `pnpm-lock.yaml`
- [x] `package-lock.json` (partial)
- [ ] `yarn.lock` v1
- [ ] `yarn.lock` v2

## Unlocked Ecosystem

- [unlocked](../unlocked) - Common lockfile format
- [unlocked-cyclonedx](../unlocked-cyclonedx) - Generate CycloneDX SBOMs from the CommonLock format

## Related Packages

- [pnpm-lock](../pnpm-lock) - Parse pnpm-lock.yaml files

## Install

```bash
$ npm install unlocked
```

## Usage

```ts
import { unlock } from "unlocked";
import type { CommonLock } from "unlocked";

const directory = process.cwd();
const lockfile: CommonLock = await unlock(directory);
```
