import type { Maintainer } from "@npm/types";
import type { LockfileResolution } from "@pnpm/lockfile-types";
export type LockfileType = "yarn-v1" | "yarn-v2" | "pnpm" | "npm";

export type DependencyName = string;
export type DependencyVersion =
	| `link:${string}` // Creates a link to the folder
	| `portal:${string}` // Creates a link to the folder, but also installs its dependencies
	| `npm:${string}` // Resolves from the npm registry
	| `git@${string}` // Downloads a public package from a Git repository
	| `git+ssh@${string}` // Downloads a public package from a Git repository
	| `git+https@${string}` // Downloads a public package from a Git repository
	| `git+http@${string}` // Downloads a public package from a Git repository
	| `git+file@${string}` // Downloads a public package from a Git repository
	| `workspace:${string}` // Resolves to a workspace
	| `file:${string}` // Copies the target location into the cache
	| `exec:${string}` // Executes a command and uses its output as the package
	| `patch:${string}` // Creates a patched version of the package
	| string; // semver or tag

export type Dependencies = Record<DependencyName, DependencyVersion>;
export type QualifiedDependencyName = `/${DependencyName}/${DependencyVersion}`;

export type ImporterSnapshots = {
	[dependency: DependencyName]: Importer;
};

export type PackageSnapshots = {
	[dependency: QualifiedDependencyName]: LockDependency;
};

export type CommonLock = {
	name: string;
	version: string;
	path?: string;

	lockfileType: LockfileType;
	lockfileVersion: number;

	/**
	 * all importers across all workspaces
	 */
	importers?: ImporterSnapshots;

	/**
	 * all packages across all importers
	 */
	packages?: PackageSnapshots;
};

export type Importer = {
	/**
	 * all dependencies across dependencies, devDependencies, optionalDependencies
	 */
	specifiers?: Dependencies;

	/**
	 * direct dependencies
	 */
	dependencies?: Dependencies;

	/**
	 * direct optionalDependencies
	 */
	optionalDependencies?: Dependencies;

	/**
	 * direct devDependencies
	 */
	devDependencies?: Dependencies;
};

export type Resolution = LockfileResolution;

export type LockDependency = {
	/**
	 * version of the package specified in its package.json
	 */
	version?: string;

	/**
	 * is the package a dev dependency?
	 */
	dev?: true | false;

	/**
	 * os the package is compatible with
	 */
	os?: string[];

	/**
	 * cpu the package is compatible with
	 */
	cpu?: string[];

	/**
	 * engines the package is compatible with
	 */
	engines?: {
		node?: string;
		npm?: string;
		yarn?: string;
	};

	requiresBuild?: true;
	optional?: true;
	patched?: true;

	/**
	 * the package has a bin field
	 */
	hasBin?: true;

	resolution?: Resolution;

	dependencies?: Dependencies;
	optionalDependencies?: Dependencies;
	peerDependencies?: Dependencies;

	/**
	 * peerDependencies that are declared as optional in peerDependenciesMeta
	 */
	optionalPeerDependencies?: DependencyName[];

	author?: Maintainer;
	licenseFile?: string;
	spdxLicenseId?: string;
};
