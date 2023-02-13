import { detectLockfileType } from "./lockfiles";

import { parse as parseYarnV1 } from "./lockfiles/yarn-v1";
import { parse as parseYarnV2 } from "./lockfiles/yarn-berry";
import { parse as parsePnpm } from "./lockfiles/pnpm";
import { parse as parseNpm } from "./lockfiles/npm";

import { toCommonLockfile as yarnV1ToCommonLockfile } from "./lockfiles/yarn-v1";
import { toCommonLockfile as yarnV2ToCommonLockfile } from "./lockfiles/yarn-berry";
import { toCommonLockfile as pnpmToCommonLockfile } from "./lockfiles/pnpm";
import { toCommonLockfile as npmToCommonLockfile } from "./lockfiles/npm";
import { CommonLock, defaultCommonLockOptions, UnlockedOptions } from "./types";

export const unlock = async (directory?: string, _options?: UnlockedOptions): Promise<CommonLock> => {
	const dir = directory ?? process.cwd();
	const lockfileType = await detectLockfileType(dir);
	if (lockfileType === undefined) throw new Error("No lockfile found");
	const options = defaultCommonLockOptions(_options);

	switch (lockfileType) {
		case "pnpm":
			return await pnpmToCommonLockfile(await parsePnpm(dir), options);
		case "npm":
			return await npmToCommonLockfile(await parseNpm(dir), options);
		// case "yarn-v1":
		// 	return await yarnV1ToCommonLockfile(await parseYarnV1(directory));
		// case "yarn-v2":
		// 	return await yarnV2ToCommonLockfile(await parseYarnV2(directory));
		default:
			throw new Error("Currently, only npm & pnpm lockfiles are supported");
	}
};

export { detectLockfileType } from "./lockfiles";
export * from "./types";

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
