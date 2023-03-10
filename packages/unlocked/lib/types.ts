import type { Maintainer, Repository } from "@npm/types";
import type { PackageManifest } from "@pnpm/types";
import type { LockfileResolution } from "@pnpm/lockfile-types";
import type { YarnLock } from "./lockfiles/yarn";
import type { PnpmLockfileFile } from "pnpm-lock";
import type { PackageJson as PackageJsonNpm } from "@npm/types";

export type UnlockedOptions = Partial<CommonLockOptions>;
export type CommonLockOptions = {
	/**
	 * Absolute path to the project root directory
	 */
	projectDirectory: string;

	/**
	 * If true, dependencies will not be resolved to their package.json
	 * This is useful if you only want to get the lockfile structure
	 * and not the package.json metadata
	 */
	skipResolve: boolean;
	packageJsonName: string;
};

export const defaultCommonLockOptions = (opts?: Partial<CommonLockOptions>): CommonLockOptions => ({
	projectDirectory: opts?.projectDirectory ?? process.cwd(),
	skipResolve: opts?.skipResolve ?? false,
	packageJsonName: opts?.packageJsonName ?? "package.json",
});

export type Funding = (string | { url: string; type: string })[] | string | { url: string; type: string };
export type PackageJson = PackageJsonNpm &
	PackageManifest & {
		funding?: Funding;
	};

export type LockfileType =
	| "yarn-v1"
	| "yarn-v2"
	| "pnpm"
	| "npm"
	| "cargo"
	| "poetry"
	| "pip"
	| "pipenv"
	| "ruby"
	| "cocoapods"
	| "unknown";

// https://docs.npmjs.com/cli/v9/configuring-npm/package-lock-json?v=true
export type NPMLockfile = {
	name?: string;
	version?: string;
	lockfileVersion: 2 | 3;
	requires?: boolean;
	packages?: {
		"": NPMLockfilePackage;
		[packageName: string]: NPMLockfilePackage;
	};
};

export type NPMLockfilePackage = {
	version: string;
	resolved?: string;
	integrity?: string;
	link?: boolean;
	dev?: boolean;
	optional?: boolean;
	devOptional?: boolean;
	inBundle?: boolean;
	hasInstallScript?: boolean;
	bin?: Record<string, string> | string;

	// npm sadly only sets this for workspace packages/the root package
	licenses?: string[];

	engines?: Record<string, string>;
	dependencies?: Dependencies;
	optionalDependencies?: Dependencies;

	// npm doesn't actually document these, but they're in the lockfile
	devDependencies?: Dependencies;
	workspaces?: string;
};

export type YarnV1Lockfile = YarnLock<"1">;
export type YarnV2Lockfile = YarnLock<"2">;
export type PnpmLockfile = PnpmLockfileFile;

export type DependencyName = string;

// dependency version, can be any string, but always has a corresponding
// package listed in `packages`
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
	| string; // semver or tag, might also be something like `7.20.2_@babel+core@7.20.12`

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

	lockfileType: LockfileType | string;
	lockfileVersion: number;
	commonLockVersion: 0;

	overrides?: Dependencies;

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
	 * A name of the package - does NOT have to be the same as the key in the lockfile
	 */
	name?: string;
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

	packageJsonPath?: string;
	// extra fields for more convenient access
	authors?: Maintainer[];
	licenseFiles?: string[];
	spdxLicenseId?: string;
	homepage?: string;
	repository?: Repository;
	funding?: Funding;
};
