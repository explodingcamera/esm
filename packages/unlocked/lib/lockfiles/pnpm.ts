import { join } from "node:path";

import { load } from "js-yaml";

import type { Lockfile } from "@pnpm/lockfile-types";
import type { CommonLock, LockDependency } from ".";
import { readFile } from "node:fs/promises";
import type { PackageJson } from "@npm/types";

type IParse = {
	(directory: false, file: string): Promise<Lockfile>;
	(directory: string, file?: undefined): Promise<Lockfile>;
};

export const parse: IParse = async (directory, file): Promise<Lockfile> => {
	if (directory === false && file === undefined) throw new Error("Either directory or file must be provided");
	const lockfile = directory ? await readFile(join(directory, "pnpm-lock.yaml"), "utf8") : (file as string);
	return load(lockfile) as Lockfile;
};

export const toCommonLockfile = (lockfile: Lockfile, pkg?: PackageJson) => {
	if (lockfile.packages == null)
		return {
			name: pkg?.name ?? "unknown",
			version: pkg?.version ?? "0.0.0",
			lockfileVersion: 1,
			dependencies: {},
			lockfileType: "pnpm",
		} satisfies CommonLock;

	const dependencies = Object.entries(lockfile.packages).reduce(
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
		lockfileType: "pnpm",
	} satisfies CommonLock;
};
