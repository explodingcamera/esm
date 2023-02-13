import { exec as _exec } from "node:child_process";
import { readdir } from "node:fs/promises";
import { promisify } from "node:util";

const exec = promisify(_exec);

// strip the UTF-8 BOM from a string
export const stripBom = (string: string): string =>
	string.charCodeAt(0) === 0xfeff ? string.slice(1) : string;

// convert a comver version to a semver version
export const comverToSemver = (version: string): string => version.replace(/(\d+)(\d{2})/, "$1.$2.0");

// get the current branch name with the node standard library
export const getCurrentBranch = async (cwd?: string): Promise<string | undefined> => {
	const { stdout } = await exec("git branch --show-current", { cwd });
	return stdout.trim();
};

export async function getGitBranchLockfileNames(lockfileDir: string) {
	const files = await readdir(lockfileDir);
	const gitBranchLockfileNames: string[] = files.filter((file) => file.match(/^pnpm-lock.(?:.*).yaml$/));
	return gitBranchLockfileNames;
}
