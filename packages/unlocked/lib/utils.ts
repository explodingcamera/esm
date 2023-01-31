import type { PackageJson } from "@npm/types";
import { stat } from "node:fs/promises";
import { join } from "node:path";

export const fileExists = async (directory: string, filename: string): Promise<boolean> => {
	try {
		const stats = await stat(join(directory, filename));
		return stats.isFile();
	} catch (_: unknown) {
		return false;
	}
};

export const loadPackageJson = async (directory: string): Promise<PackageJson> => {
	const packageJson: PackageJson = await import(join(directory, "package.json"));
	return packageJson;
};

export const resolveMetadata = async (moduleName: string): Promise<PackageJson> => {
	// only allow valid npm package names
	if (!moduleName.match(/^[a-z0-9-_.]+$/)) throw new Error(`Invalid module name: ${moduleName}`);
	const packageJson: PackageJson = await import(join(moduleName, "package.json"));
	return packageJson;
};
