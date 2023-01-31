import { detectLockfileType } from "./lockfiles";

import { parse as parseYarnV1 } from "./lockfiles/yarn-v1";
import { parse as parseYarnV2 } from "./lockfiles/yarn-berry";
import { parse as parsePnpm } from "./lockfiles/pnpm";
import { parse as parseNpm } from "./lockfiles/npm";

import { toCommonLockfile as yarnV1ToCommonLockfile } from "./lockfiles/yarn-v1";
import { toCommonLockfile as yarnV2ToCommonLockfile } from "./lockfiles/yarn-berry";
import { toCommonLockfile as pnpmToCommonLockfile } from "./lockfiles/pnpm";
import { toCommonLockfile as npmToCommonLockfile } from "./lockfiles/npm";

export const parse = async (directory: string) => {
	const lockfileType = await detectLockfileType(directory);
	switch (lockfileType) {
		case "yarn-v1":
			return await yarnV1ToCommonLockfile(await parseYarnV1(directory));
		case "yarn-v2":
			return await yarnV2ToCommonLockfile(await parseYarnV2(directory));
		case "pnpm":
			return await pnpmToCommonLockfile(await parsePnpm(directory));
		case "npm":
			return await npmToCommonLockfile(await parseNpm(directory));
		default:
			throw new Error(`Unknown lockfile type: ${lockfileType}`);
	}
};

export { detectLockfileType } from "./lockfiles";
export type { CommonLock, LockDependency } from "./lockfiles";

export {
	parseYarnV1,
	parseYarnV2,
	parsePnpm,
	parseNpm,
	yarnV1ToCommonLockfile,
	yarnV2ToCommonLockfile,
	pnpmToCommonLockfile,
	npmToCommonLockfile,
};
