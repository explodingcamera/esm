# pnpm-lock

Parses `pnpm-lock.yaml` files for use in other tools.

## Usage

```js
import { parseWantedLockfile } from 'pnpm-lock';

const path = process.cwd();
const opts = {
		overrideFileName?: string; // default: 'pnpm-lock.yaml'
		wantedVersions?: string[]; 
		ignoreIncompatible: boolean;
		useGitBranchLockfile?: boolean;
};

const lockfile = readLockfile(path, opts);
```

## Notable differences from `@pnpm/lockfile-file`

- only `readWantedLockfile` is supported
- `use-inline-specifiers-lockfile-format` is unsupported
- `autofixMergeConflicts` is unsupported
- `mergeGitBranchLockfiles` is unsupported
- No tests: use at your own risk, however:
  - there are no major changes from the original package which has tests
  - there are unlocked-related tests in the [unlocked](../unlocked) package
