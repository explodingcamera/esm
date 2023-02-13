import { join } from "node:path";
import { cwd } from "node:process";
import type {
	CommonLock,
	Importer,
	ImporterSnapshots,
	NPMLockfile,
	PackageJson,
	PackageSnapshots,
	QualifiedDependencyName,
	ToCommonLockfileOptions,
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

export const toCommonLockfile = async (lockfile: NPMLockfile, options?: ToCommonLockfileOptions) => {
	let rootPkg = await utils.readPackageJson(options?.projectDirectory || cwd(), options?.packageJsonName);

	if (lockfile.lockfileVersion !== 3 && lockfile.lockfileVersion !== 2)
		throw new Error(`Unsupported package-lock.json version: ${lockfile.version}`);

	let packagesToVersions: Record<string, string> = {};

	let importers: ImporterSnapshots = {};
	let packages: PackageSnapshots = {};

	for (let [name, dep] of Object.entries(lockfile.packages ?? {})) {
		if (!name.startsWith("node_modules/")) continue;
		if (dep.link && !dep.resolved?.endsWith(".tgz")) continue;
		let actualName = name.slice("node_modules/".length);
		let qualifiedName: QualifiedDependencyName = `/${actualName}/${dep.version}`;

		let dependencyPkg: PackageJson | undefined;
		let dependencyLicensePath: string | undefined;

		if (!options?.skipResolve && options?.projectDirectory) {
			try {
				dependencyPkg = await utils.readQualifiedDependencyPackageJson(
					qualifiedName,
					options.projectDirectory,
				);

				dependencyLicensePath = await utils.findQualifiedDependencyLicenseFile(
					qualifiedName,
					options.projectDirectory,
				);
			} catch (_) {}
		}

		let dependencies = Object.fromEntries(
			Object.entries(dep.dependencies ?? {}).map(([specifier, version]) => [specifier, version]),
		);

		let optionalDependencies = Object.fromEntries(
			Object.entries(dep.optionalDependencies ?? {}).map(([specifier, version]) => [specifier, version]),
		);

		packagesToVersions[name] = dep.version;
		packages[qualifiedName] = {
			dependencies,
			// TODO: npm handles peerDependencies differently
			// peerDependencies,
			// optionalPeerDependencies: Object.keys(dep.peerDependenciesMeta ?? []),

			optionalDependencies,

			version: dep.version,
			optional: dep.optional || undefined,
			hasBin: dep.bin !== undefined || undefined,
			engines: dep.engines,
			dev: dep.dev,

			author: dependencyPkg?.author,
			spdxLicenseId: dependencyPkg?.license,
			licenseFile: dependencyLicensePath,
		};
	}

	for (let [name, data] of Object.entries(lockfile.packages ?? {})) {
		if (!data) continue;

		let uniquePackages = utils.unique([
			...Object.entries(data.dependencies ?? {}),
			...Object.entries(data.devDependencies ?? {}),
			...Object.entries(data.optionalDependencies ?? {}),
		]);

		let newData: Importer = {
			specifiers: Object.fromEntries(uniquePackages),

			dependencies: Object.fromEntries(
				Object.entries(data.dependencies ?? {}).map(([specifier, version]) => [
					specifier,
					packagesToVersions[`node_modules/${specifier}`] ?? version,
				]),
			),

			devDependencies: Object.fromEntries(
				Object.entries(data.devDependencies ?? {}).map(([specifier, version]) => [
					specifier,
					packagesToVersions[`node_modules/${specifier}`] ?? version,
				]),
			),

			optionalDependencies: Object.fromEntries(
				Object.entries(data.optionalDependencies ?? {}).map(([specifier, version]) => [
					specifier,
					packagesToVersions[`node_modules/${specifier}`] ?? version,
				]),
			),
		};

		if (name === "") {
			importers["."] = newData;
			continue;
		}

		if (name.startsWith("node_modules/")) {
			// TODO
			continue;
		}

		// this is probably a workspace package / importer
		if (name.includes("/")) {
			importers[name] = newData;
			// continue;
		}
	}

	return {
		name: lockfile.name ?? rootPkg?.name ?? "unknown",
		version: lockfile.version ?? rootPkg?.version ?? "0.0.0",
		lockfileVersion: lockfile.version === "3" ? 3 : 2,
		lockfileType: "npm",
		path: options?.projectDirectory,
		importers,

		// TODO: this needs to be filled in
		packages,
	} satisfies CommonLock;
};
