import { fileExists } from "../utils";
import { detectYarnVersion } from "./yarn";

export type LockfileType = "yarn-v1" | "yarn-v2" | "pnpm" | "npm";

export type CommonLock = {
	name: string;
	version: string;
	lockfileType: LockfileType;
	lockfileVersion: number;
	packageIntegrity?: string;
	preserveSymlinks?: boolean;
	requires?: boolean;
	dependencies?: { [moduleName: string]: LockDependency };
};

export type LockDependency = {
	version: string;
	integrity?: string;
	resolved?: string;
	bundled?: boolean;
	dev?: boolean;
	optional?: boolean;
	requires?: { [moduleName: string]: string };
	dependencies?: { [moduleName: string]: LockDependency };
};

export const detectLockfileType = async (directory: string): Promise<LockfileType | undefined> => {
	if (await fileExists(directory, "pnpm-lock.yaml")) {
		return "pnpm";
	} else if (await fileExists(directory, "yarn.lock")) {
		const yarnVersion = await detectYarnVersion(directory);
		if (yarnVersion === "1") return "yarn-v1";
		return "yarn-v2";
	} else if (await fileExists(directory, "package-lock.json")) {
		// last priority because it might still exist in a project that uses a different lockfile
		return "npm";
	} else {
		return undefined;
	}
};
