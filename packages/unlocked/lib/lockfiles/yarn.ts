import { readFile } from "node:fs/promises";
import { join } from "node:path";

export interface YarnLock<TType extends "1" | "2"> {
	object: YarnLockDeps;
	dependencies?: YarnLockDeps;
	lockfileType: TType;
}

export interface YarnLockDeps {
	[depName: string]: YarnLockDep;
}

export interface YarnLockDep {
	version: string;
	dependencies?: {
		[depName: string]: string;
	};
	optionalDependencies?: {
		[depName2: string]: string;
	};
}

export const detectYarnVersion = async (directory: string) => {
	const lock = await readFile(join(directory, "yarn.lock"), "utf8");
	const match = lock.match(/^# yarn v(\d+)$/m);
	return match ? match[1] : "1";
};
