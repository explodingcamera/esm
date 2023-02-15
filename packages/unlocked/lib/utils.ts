import type { Maintainer } from "@npm/types";
import { resolve } from "import-meta-resolve";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { DependencyName, Funding, PackageJson, QualifiedDependencyName } from "./types";

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

export const qualifiedToResolvableName = (name: QualifiedDependencyName): DependencyName => {
	return name.replace(/^\//, "").replace(/\/[^/]+$/, "");
};

export const resolveDependency = async (name: QualifiedDependencyName, path: string): Promise<string> => {
	// remove / at the start and /* at the end
	if (!name) throw new Error(`Invalid package name: ${name}`);
	const url = pathToFileURL(join(path, "index.js"));
	// we resolve the package.json file, since it (should) be in the package root
	const packageJsonPath = await resolve(join(qualifiedToResolvableName(name), "package.json"), url.href);
	if (!packageJsonPath.endsWith("/package.json")) throw new Error("Invalid package.json path");
	const packageBasePath = fileURLToPath(packageJsonPath.replace(/\/package\.json$/, "/"));
	return packageBasePath;
};

// find a license file for a qualified dependency
// path should be the path to the project root
// if it exists, return the path relative to provided path
export const findRelativeLicenseFiles = async (
	name: QualifiedDependencyName,
	path: string,
): Promise<string[] | undefined> => {
	try {
		const packageBasePath = await resolveDependency(name, path);

		const files = await readdir(packageBasePath);
		const licenseFiles = files.filter((file) => file.match(/license/i));
		if (licenseFiles.length > 0) return;
		licenseFiles.map((file) => relativeTo(path, join(packageBasePath, file)));
		return undefined;
	} catch (_) {
		return undefined;
	}
};

export const relativeTo = (path: string, file: string): string => `./${relative(path, file)}`;

export const findPackageJson = async (
	name: QualifiedDependencyName,
	path: string,
): Promise<PackageJson | undefined> => {
	try {
		const packageBasePath = await resolveDependency(name, path);
		return readPackageJson(packageBasePath);
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

export const readPackageMetadata = async (
	qualifiedName: QualifiedDependencyName,
	projectDir: string,
): Promise<{
	packageJson: PackageJson | undefined;
	packageJsonPath: string | undefined;
	licensePaths: string[] | undefined;
	authors?: Maintainer[] | undefined;
}> => {
	let packageJson: PackageJson | undefined;
	let packageJsonPath: string | undefined;
	let licensePaths: string[] | undefined;

	try {
		packageJsonPath = await resolveDependency(qualifiedName, projectDir);
		packageJson = await readPackageJson(packageJsonPath);
		licensePaths = await findRelativeLicenseFiles(qualifiedName, projectDir);
	} catch (_) {}

	return {
		packageJson,
		packageJsonPath: relativeTo(projectDir, packageJsonPath ?? ""),
		licensePaths,
		authors: [
			...(packageJson?.author ? [packageJson.author] : []),
			...(packageJson?.contributors ? packageJson.contributors : []),
		],
	};
};

export const unique = <T>(arr: [string, T][]): [string, T][] => [...new Map(arr.map(([a, b]) => [a, b]))];
