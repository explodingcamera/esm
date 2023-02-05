# unlocked-pnpm

> A fork of @pnpm/lockfile-file without all the dependencies and only the lockfile parsing
> Based on `@pnpm/lockfile-file@7.0.4`

## Notable differences

- only `readWantedLockfile` is supported
- `use-inline-specifiers-lockfile-format` is unsupported
- `autofixMergeConflicts` is unsupported
- `mergeGitBranchLockfiles` is unsupported
- No tests: use at your own risk, however:
  - there are no major changes from the original package which has tests
  - there are unlocked-related tests in the [unlocked](../unlocked) package

## Usage

```js
import { parseWantedLockfile } from 'unlocked-pnpm';

const path = process.cwd();
const opts = {
		overrideFileName?: string; // default: 'pnpm-lock.yaml'
		wantedVersions?: string[]; 
		ignoreIncompatible: boolean;
		useGitBranchLockfile?: boolean;
};

const lockfile = readLockfile(path, opts);
```