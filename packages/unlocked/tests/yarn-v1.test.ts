import { describe, expect, it, vi } from "vitest";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse, toCommonLockfile } from "../lib/lockfiles/yarn-v1";
import { readFile } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe.skip("yarn-v1 parse", () => {
	it("should parse a yarn v1 lockfile", async () => {
		const file = await readFile(join(__dirname, "fixtures", "yarn-v1", "express.yarn.lock"), "utf8");
		const lockfile = await parse(false, file);
		expect(lockfile).toMatchSnapshot();
	});

	it("should parse a yarn v1 lockfile from a directory with a yarn.lock file", async () => {
		const lockfile = await parse(join(__dirname, "fixtures", "yarn-v1"));
		expect(lockfile).toBeTypeOf("object");
	});

	it("should panic if the yarn.lock file is not found", async () => {
		await expect(parse(join(__dirname, "fixtures", "yarn-v1", "not-found"))).rejects.toThrow();
		await expect(parse(join(__dirname, "fixtures", "yarn-v1", "not-found"))).rejects.toThrowError(
			/ENOENT: no such file or directory, open/,
		);
	});

	it("should panic if the yarn.lock file is empty", async () => {
		await expect(parse(false, "")).rejects.toThrow();
		await expect(parse(false, "")).rejects.toThrowError(/Lockfile is empty/);
	});

	it("should panic if the yarn.lock file is not a yarn v1 lockfile", async () => {
		await expect(parse(false, "not a yarn v1 lockfile")).rejects.toThrow();
		await expect(parse(false, "not a yarn v1 lockfile")).rejects.toThrowError(
			/Lockfile is not a yarn v1 lockfile/,
		);
	});

	it("should panic if the yarn.lock file is not provided", async () => {
		await expect(parse(false, undefined as unknown as string)).rejects.toThrow();
		await expect(parse(false, undefined as unknown as string)).rejects.toThrowError(
			/Either directory or file must be provided/,
		);
	});

	it("should panic if the yarn.lock file is not provided and the directory is not provided", async () => {
		await expect(parse(undefined as unknown as false, undefined as unknown as string)).rejects.toThrow();
		await expect(parse(undefined as unknown as false, undefined as unknown as string)).rejects.toThrowError(
			/No lockfile found/,
		);
	});
});

describe.skip("yarn-v1 toCommonLockfile", () => {
	it("should convert a yarn v1 lockfile to a common lockfile", async () => {
		const file = await readFile(join(__dirname, "fixtures", "yarn-v1", "express.yarn.lock"), "utf8");
		const lockfile = await parse(false, file);
		expect(toCommonLockfile(lockfile)).toMatchSnapshot();
	});
});
