import type { PackageJson, PackageLock } from "@npm/types";
import { join } from "node:path";
import type { CommonLock } from "../types";

type IParse = {
	(directory: false, file: string): Promise<PackageLock>;
	(directory: string, file?: undefined): Promise<PackageLock>;
};

export const parse: IParse = async (directory, file): Promise<PackageLock> => {
	if (directory === false && file === undefined) throw new Error("Either directory or file must be provided");

	return directory ? await import(join(directory, "package-lock.json")) : JSON.parse(file as string);
};

export const toCommonLockfile = (lockfile: PackageLock, pkg?: PackageJson) => {
	return {
		name: lockfile.name ?? pkg?.name ?? "unknown",
		version: lockfile.version ?? pkg?.version ?? "0.0.0",
		lockfileVersion: 1,
		// dependencies: lockfile.dependencies,
		lockfileType: "npm",
	} satisfies CommonLock;
};
