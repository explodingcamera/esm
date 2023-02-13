import * as utils from "../utils";
import { parseLockfileContents, readWantedLockfile } from "unlocked-pnpm";

import type {
	CommonLock,
	LockDependency,
	PackageSnapshots,
	PnpmLockfile,
	QualifiedDependencyName,
	CommonLockOptions,
} from "../types";

type IParse = {
	(directory: false, file: string): Promise<PnpmLockfile>;
	(directory: string, file?: undefined): Promise<PnpmLockfile>;
};

export const parse: IParse = async (directory, file): Promise<PnpmLockfile> => {
	if (directory === false && file === undefined) throw new Error("Either directory or file must be provided");

	if (file !== undefined)
		return (await parseLockfileContents({
			lockfileRawContent: file,
			lockfilePath: file,
			opts: { ignoreIncompatible: false },
		})) as PnpmLockfile;

	// pkgPath will always be a string
	return (await readWantedLockfile(directory as string, {
		ignoreIncompatible: false,
	})) as PnpmLockfile;
};

export const toCommonLockfile = async (
	lockfile: PnpmLockfile,
	options: CommonLockOptions,
): Promise<CommonLock> => {
	let rootPkg = await utils.readPackageJson(options.projectDirectory, options.packageJsonName);

	if (lockfile.packages == null)
		return {
			name: rootPkg?.name ?? "unknown",
			version: rootPkg?.version ?? "0.0.0",
			lockfileVersion: 1,
			lockfileType: "pnpm",
			commonLockVersion: 0,
		} satisfies CommonLock;

	let packagePromises = Object.entries(lockfile.packages).map(async ([qualifiedName, dep]) => {
		// resolve the qualified name to a name that can be used to resolve the package
		// e.g. "/is-positive/3.1.0" -> "is-positive"
		const meta = await utils.readPackageMetadata(
			qualifiedName as QualifiedDependencyName,
			options.projectDirectory,
		);

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

			author: meta.packageJson?.author,
			spdxLicenseId: meta.packageJson?.license,
			packageJsonPath: meta.packageJsonPath,
			licenseFile: meta.licensePath,
		} satisfies LockDependency;

		return [qualifiedName, dependency];
	});

	let packages = Object.fromEntries(await Promise.all(packagePromises)) as PackageSnapshots;

	let importers = {
		...lockfile.importers,
	};

	// if the lockfile doesn't have an importer for the root directory, add it, commonlockfile doesn't support lockfiles without an importer for the root directory
	if (!importers["."] && lockfile.specifiers) {
		importers["."] = {
			specifiers: lockfile.specifiers,
			dependencies: lockfile.dependencies,
			devDependencies: lockfile.devDependencies,
			optionalDependencies: lockfile.optionalDependencies,
		};
	}

	return {
		name: rootPkg?.name ?? "unknown",
		version: rootPkg?.version ?? "0.0.0",
		lockfileVersion: lockfile.lockfileVersion,
		lockfileType: "pnpm",
		packages,
		importers,
		overrides: lockfile.overrides,
		path: options?.projectDirectory,
		commonLockVersion: 0,
	} satisfies CommonLock;
};
