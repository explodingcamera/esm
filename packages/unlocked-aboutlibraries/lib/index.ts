import { resolve } from "path";
import type { CommonLock, ImporterSnapshots, PackageSnapshots } from "unlocked";
import type { AboutLibraries } from "./types";

export type { AboutLibraries };

export const readAboutLibrararies = (aboutLibrariesFile: `${string}.json`): Promise<AboutLibraries> => {
	return import(resolve(process.cwd(), aboutLibrariesFile));
};

export const aboutLibrariesToCommonLock = (aboutLibraries: AboutLibraries): CommonLock => {
	const importers: ImporterSnapshots = {};
	const packages: PackageSnapshots = {};

	for (const library of aboutLibraries.libraries) {
		const { uniqueId, artifactVersion, licenses, name, description, developers, website, scm, funding } =
			library;
	}

	return {
		name: "unknown",
		version: "0.0.0",
		lockfileVersion: 0,
		commonLockVersion: 0,
		lockfileType: "aboutlibraries",
	};
};
