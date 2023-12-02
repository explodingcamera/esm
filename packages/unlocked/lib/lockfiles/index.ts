import type { LockfileType } from "../types";
import { fileExists } from "../utils";
import { detectYarnVersion } from "./yarn";

export const detectLockfileType = async (directory: string): Promise<LockfileType | undefined> => {
	if (await fileExists(directory, "pnpm-lock.yaml")) {
		return "pnpm";
	}
	if (await fileExists(directory, "yarn.lock")) {
		const yarnVersion = await detectYarnVersion(directory);
		if (yarnVersion === "1") return "yarn-v1";
		return "yarn-v2";
	}
	if (await fileExists(directory, "package-lock.json")) {
		// last priority because it might still exist in a project that uses a different lockfile
		return "npm";
	}
	return undefined;
};
