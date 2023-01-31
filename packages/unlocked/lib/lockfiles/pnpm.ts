import yaml from "js-yaml";
import {
	findQualifiedDependencyLicenseFile,
	read,
	readPackageJson,
	readQualifiedDependencyPackageJson,
} from "../utils";

import type { PackageJson } from "@npm/types";
import type { Lockfile } from "@pnpm/lockfile-types";
import type { CommonLock, LockDependency, PackageSnapshots, QualifiedDependencyName } from "../types";

type IParse = {
	(directory: false, file: string): Promise<Lockfile>;
	(directory: string, file?: undefined): Promise<Lockfile>;
};

export const parse: IParse = async (directory, file): Promise<Lockfile> => {
	if (directory === false && file === undefined) throw new Error("Either directory or file must be provided");
	const lockfile = directory ? await read(directory, "pnpm-lock.yaml") : (file as string);
	return yaml.load(lockfile) as Lockfile;
};

type ToCommonLockfileOptions = {
	/**
	 * Absolute path to the project root directory
	 */
	projectDirectory?: string;

	/**
	 * If true, dependencies will not be resolved to their package.json
	 * This is useful if you only want to get the lockfile structure
	 * and not the package.json metadata
	 */
	skipResolve?: true;

	packageJsonName?: string;
};

export const toCommonLockfile = async (lockfile: Lockfile, options?: ToCommonLockfileOptions) => {
	let pkg = await readPackageJson(options?.projectDirectory, options?.packageJsonName);

	if (lockfile.packages == null)
		return {
			name: pkg?.name ?? "unknown",
			version: pkg?.version ?? "0.0.0",
			lockfileVersion: 1,
			lockfileType: "pnpm",
		} satisfies CommonLock;

	let packagePromises = Object.entries(lockfile.packages).map(async ([name, dep]) => {
		// resolve the qualified name to a name that can be used to resolve the package
		// e.g. "/is-positive/3.1.0" -> "is-positive"

		let dependencyPkg: PackageJson | undefined;
		let dependencyLicensePath: string | undefined;
		if (!options?.skipResolve && options?.projectDirectory) {
			try {
				dependencyPkg = await readQualifiedDependencyPackageJson(
					name as QualifiedDependencyName,
					options.projectDirectory,
				);
				dependencyLicensePath = await findQualifiedDependencyLicenseFile(
					name as QualifiedDependencyName,
					options.projectDirectory,
				);
			} catch (_) {}
		}

		let dependency = {
			version: dep.version,
			dependencies: dep.dependencies,
			peerDependencies: dep.peerDependencies,
			optionalPeerDependencies: Object.keys(dep.peerDependenciesMeta ?? []),
			optionalDependencies: dep.optionalDependencies,
			optional: dep.optional,
			hasBin: dep.hasBin,
			cpu: dep.cpu,
			os: dep.os,
			engines: dep.engines,
			dev: dep.dev,
			patched: dep.patched,
			requiresBuild: dep.requiresBuild,
			resolution: dep.resolution,

			author: dependencyPkg?.author,
			spdxLicenseId: dependencyPkg?.license,
			licenseFile: dependencyLicensePath,
		} satisfies LockDependency;

		return [name as QualifiedDependencyName, dependency];
	});

	let packages = Object.fromEntries(await Promise.all(packagePromises)) as PackageSnapshots;

	return {
		name: pkg?.name ?? "unknown",
		version: pkg?.version ?? "0.0.0",
		lockfileVersion: 1,
		lockfileType: "pnpm",
		packages,
		importers: lockfile.importers,
	} satisfies CommonLock;
};
