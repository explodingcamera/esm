import { parse as parseYarn } from "@yarnpkg/lockfile";
import { join } from "node:path";

import type { YarnLock } from "./yarn";
import type { CommonLock, LockDependency, PackageJson } from "../types";
import { readFile } from "node:fs/promises";

// Notes
// - yarn v1 lockfiles are not sorted
// - yarn v1 lockfiles do not have a `dev` field, so for now we will assume that all dependencies are not dev dependencies

const LOCKFILE_PREFIX = `# THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
# yarn lockfile v1`;

type IParse = {
	(directory: false, file: string): Promise<YarnLock<"1">>;
	(directory: string, file?: undefined): Promise<YarnLock<"1">>;
};

export const parse: IParse = async (directory, file): Promise<YarnLock<"1">> => {
	if (directory === false && file === undefined) throw new Error("Either directory or file must be provided");
	const lockfile = directory ? await readFile(join(directory, "yarn.lock"), "utf8") : (file as string);
	if (lockfile === undefined) throw new Error("No lockfile found");
	if (lockfile === "") throw new Error("Lockfile is empty");
	if (!lockfile.startsWith(LOCKFILE_PREFIX)) throw new Error("Lockfile is not a yarn v1 lockfile");
	const res = parseYarn(lockfile);

	return {
		lockfileType: "1",
		object: res.object,
	};
};

export const toCommonLockfile = (lockfile: YarnLock<"1">, pkg?: PackageJson) => {
	const dependencies = Object.entries(lockfile.object).reduce(
		(acc, [name, dep]): { [moduleName: string]: LockDependency } => {
			acc[name] = {
				dependencies: dep.dependencies,
				optionalDependencies: dep.optionalDependencies,
				version: dep.version,
			} as LockDependency;
			return acc;
		},
		{} as { [moduleName: string]: LockDependency },
	);

	return {
		name: pkg?.name ?? "unknown",
		version: pkg?.version ?? "0.0.0",
		lockfileVersion: 1,
		// dependencies,
		lockfileType: "yarn-v1",
		commonLockVersion: 0,
	} satisfies CommonLock;
};
