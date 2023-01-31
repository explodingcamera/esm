import { parse as parseYarn } from "@yarnpkg/lockfile";
import { join } from "node:path";

import type { YarnLock } from "./yarn";
import type { CommonLock, LockDependency } from ".";
import type { PackageJson } from "@npm/types";
import { readFile } from "node:fs/promises";

type IParse = {
	(directory: false, file: string): Promise<YarnLock<"1">>;
	(directory: string, file?: undefined): Promise<YarnLock<"1">>;
};

export const parse: IParse = async (directory, file): Promise<YarnLock<"1">> => {
	if (directory === false && file === undefined) throw new Error("Either directory or file must be provided");
	const lockfile = directory ? await readFile(join(directory, "yarn.lock"), "utf8") : (file as string);
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
		dependencies,
		lockfileType: "yarn-v1",
	} satisfies CommonLock;
};
