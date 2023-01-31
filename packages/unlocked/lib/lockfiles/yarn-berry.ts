import type { PackageJson } from "@npm/types";
import { parseSyml } from "@yarnpkg/parsers";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { CommonLock, LockDependency } from "../types";
import type { YarnLock } from "./yarn";

type IParse = {
	(directory: false, file: string): Promise<YarnLock<"2">>;
	(directory: string, file?: undefined): Promise<YarnLock<"2">>;
};

export const parse: IParse = async (directory, file): Promise<YarnLock<"2">> => {
	if (directory === false && file === undefined) throw new Error("Either directory or file must be provided");
	const lockfile = directory ? await readFile(join(directory, "yarn.lock"), "utf8") : (file as string);
	const res = parseSyml(lockfile);

	return {
		object: res,
		lockfileType: "2",
	};
};

export const toCommonLockfile = (lockfile: YarnLock<"2">, pkg?: PackageJson) => {
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
		lockfileVersion: 2,
		// dependencies,
		lockfileType: "yarn-v2",
	} satisfies CommonLock;
};
