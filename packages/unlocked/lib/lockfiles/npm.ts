import { join } from "node:path";
import type {
	CommonLock,
	Importer,
	ImporterSnapshots,
	NPMLockfile,
	PackageSnapshots,
	QualifiedDependencyName,
	CommonLockOptions,
	Dependencies,
} from "../types";
import * as utils from "../utils";

type IParse = {
	(directory: false, file: string): Promise<NPMLockfile>;
	(directory: string, file?: undefined): Promise<NPMLockfile>;
};

export const parse: IParse = async (directory, file): Promise<NPMLockfile> => {
	if (directory === false && file === undefined) throw new Error("Either directory or file must be provided");

	return directory ? await import(join(directory, "package-lock.json")) : JSON.parse(file as string);
};

export const toCommonLockfile = async (lockfile: NPMLockfile, options: CommonLockOptions) => {
	let rootPkg = await utils.readPackageJson(options.projectDirectory, options.packageJsonName);

	if (lockfile.lockfileVersion !== 3 && lockfile.lockfileVersion !== 2)
		throw new Error(`Unsupported package-lock.json version: ${lockfile.version}`);

	let packagesToVersions: Record<string, string> = {};
	let importers: ImporterSnapshots = {};
	let packages: PackageSnapshots = {};

	const resolveConcreteVersion = (deps?: Dependencies) =>
		Object.fromEntries(
			Object.entries(deps ?? {}).map(([specifier, version]) => [
				specifier,
				packagesToVersions[`node_modules/${specifier}`] ?? version,
			]),
		);

	// process packages
	for (let [name, dep] of Object.entries(lockfile.packages ?? {})) {
		if (!name.startsWith("node_modules/")) continue;
		if (dep.link && !dep.resolved?.endsWith(".tgz")) continue;
		let actualName = name.slice("node_modules/".length);
		let qualifiedName: QualifiedDependencyName = `/${actualName}/${dep.version}`;

		const meta = await utils.readPackageMetadata(qualifiedName, options.projectDirectory);

		let dependencies = Object.fromEntries(
			Object.entries(dep.dependencies ?? {}).map(([specifier, version]) => [specifier, version]),
		);

		let optionalDependencies = Object.fromEntries(
			Object.entries(dep.optionalDependencies ?? {}).map(([specifier, version]) => [specifier, version]),
		);

		packagesToVersions[name] = dep.version;
		packages[qualifiedName] = {
			dependencies,
			// TODO: npm handles peerDependencies differently, for now we'll just ignore them
			// peerDependencies,
			// optionalPeerDependencies: Object.keys(dep.peerDependenciesMeta ?? []),

			optionalDependencies,

			version: dep.version,
			optional: dep.optional || undefined,
			hasBin: dep.bin !== undefined || undefined,
			engines: dep.engines,
			dev: dep.dev,

			funding: meta.packageJson?.funding,
			authors: meta.authors,
			spdxLicenseId: meta.packageJson?.license,
			packageJsonPath: meta.packageJsonPath,
			licenseFiles: meta.licensePaths,
		};
	}

	// process specifiers
	for (let [name, data] of Object.entries(lockfile.packages ?? {})) {
		if (!data) continue;

		// these have already been handled by the previous loop
		if (name.startsWith("node_modules/")) continue;

		let uniquePackages = utils.unique([
			...Object.entries(data.dependencies ?? {}),
			...Object.entries(data.devDependencies ?? {}),
			...Object.entries(data.optionalDependencies ?? {}),
		]);

		const newData: Importer = {
			specifiers: Object.fromEntries(uniquePackages),
			dependencies: resolveConcreteVersion(data.dependencies),
			devDependencies: resolveConcreteVersion(data.devDependencies),
			optionalDependencies: resolveConcreteVersion(data.optionalDependencies),
		};

		if (name === "") {
			importers["."] = newData;
			continue;
		}

		// this is probably a workspace package / importer
		if (name.includes("/")) {
			importers[name] = newData;
		}
	}

	return <CommonLock>{
		name: lockfile.name ?? rootPkg?.name ?? "unknown",
		version: lockfile.version ?? rootPkg?.version ?? "0.0.0",
		commonLockVersion: 0,
		lockfileVersion: lockfile.lockfileVersion,
		lockfileType: "npm",
		path: options?.projectDirectory ?? undefined,
		importers,
		packages,
	};
};
