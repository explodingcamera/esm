import { join } from "node:path";
import type {
	CommonLock,
	Importer,
	ImporterSnapshots,
	NPMLockfile,
	PackageSnapshots,
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
	let pkg = await utils.readPackageJson(options?.projectDirectory, options?.packageJsonName);

	if (lockfile.version !== "3" && lockfile.version !== "2")
		throw new Error(`Unsupported package-lock.json version: ${lockfile.version}`);

	let importers: ImporterSnapshots = {};
	let packages: PackageSnapshots = {};

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
				Object.entries(data.dependencies ?? {}).map(([specifier, version]) => [specifier, version]),
			),
			devDependencies: Object.fromEntries(
				Object.entries(data.devDependencies ?? {}).map(([specifier, version]) => [specifier, version]),
			),
			optionalDependencies: Object.fromEntries(
				Object.entries(data.optionalDependencies ?? {}).map(([specifier, version]) => [specifier, version]),
			),
		};

		if (name === "") {
			importers["."] = newData;
		} else {
			importers[name] = newData;
		}
	}

	return {
		name: lockfile.name ?? pkg?.name ?? "unknown",
		version: lockfile.version ?? pkg?.version ?? "0.0.0",
		lockfileVersion: lockfile.version === "3" ? 3 : 2,
		lockfileType: "npm",
		path: options?.projectDirectory,
		importers,

		// TODO: this needs to be filled in
		packages,
	} satisfies CommonLock;
};
