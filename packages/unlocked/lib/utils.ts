import { resolve } from "import-meta-resolve";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import type { PackageJson, QualifiedDependencyName } from "./types";

export const read = async (directory: string, filename: string): Promise<string> => {
	return await readFile(join(directory, filename), "utf8");
};

export const fileExists = async (directory: string, filename: string): Promise<boolean> => {
	try {
		const stats = await stat(join(directory, filename));
		return stats.isFile();
	} catch (_: unknown) {
		return false;
	}
};

export const resolveQualifiedDependencyPackageJson = async (
	name: QualifiedDependencyName,
	path: string,
): Promise<string> => {
	const resolvableName = name.split("/")[1];
	if (!resolvableName) throw new Error(`Invalid package name: ${name}`);
	const url = pathToFileURL(join(path, "index.js"));
	return await resolve(join(resolvableName, "package.json"), url.href);
};

export const findQualifiedDependencyLicenseFile = async (
	name: QualifiedDependencyName,
	path: string,
): Promise<string | undefined> => {
	try {
		const packageJsonPath = await resolveQualifiedDependencyPackageJson(name, path);
		if (!packageJsonPath.endsWith("/package.json")) throw new Error("Invalid package.json path");
		const packageBasePath = packageJsonPath.replace(/\/package\.json$/, "/");

		const files = await readdir(packageBasePath);
		const licenseFiles = files.filter((file) => file.match(/license/i));
		if (licenseFiles.length > 0) return join(packageBasePath, licenseFiles[0] as string);

		return undefined;
	} catch (_) {
		return undefined;
	}
};

export const readQualifiedDependencyPackageJson = async (
	name: QualifiedDependencyName,
	path: string,
): Promise<PackageJson | undefined> => {
	try {
		const packageJsonPath = await resolveQualifiedDependencyPackageJson(name, path);
		return await import(packageJsonPath);
	} catch (_) {
		return undefined;
	}
};

export const readPackageJson = async (
	directory?: string,
	name?: string,
): Promise<PackageJson | undefined> => {
	if (!directory) return undefined;
	if (name && !name.endsWith(".json")) throw new Error("packageJsonName must end with .json");
	try {
		return await import(join(directory, name ?? "package.json"));
	} catch (e) {
		return undefined;
	}
};

export const resolveMetadata = async (moduleName: string): Promise<PackageJson> => {
	// only allow valid npm package names
	if (!moduleName.match(/^[a-z0-9-_.]+$/)) throw new Error(`Invalid module name: ${moduleName}`);
	const packageJson: PackageJson = await import(join(moduleName, "package.json"));
	return packageJson;
};
