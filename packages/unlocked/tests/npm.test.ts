import { describe, expect, test } from "vitest";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse, toCommonLockfile } from "../lib/lockfiles/npm";
import { readFile } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("npm parse", () => {
	test("should parse a npm lockfile", async () => {
		const file = await readFile(join(__dirname, "fixtures", "npm", "package-lock.json"), "utf8");
		const lockfile = await parse(false, file);
		expect(lockfile).toMatchSnapshot();
	});
});

describe("npm toCommonLockfile", () => {
	test("should convert a npm lockfile to a common lockfile", async () => {
		const file = await readFile(join(__dirname, "fixtures", "npm", "package-lock.json"), "utf8");
		const lockfile = await parse(false, file);

		const commonLock = await toCommonLockfile(lockfile, {
			packageJsonName: "package.json",
			projectDirectory: join(__dirname, "fixtures", "npm"),
			skipResolve: false,
		});

		commonLock.path = undefined;
		expect(commonLock).toMatchSnapshot();
	});

	test("should convert a npm lockfile to a common lockfile with npm modules", async () => {
		const file = await readFile(join(__dirname, "fixtures", "npm-workspace", "package-lock.json"), "utf8");
		const lockfile = await parse(false, file);

		const commonLock = await toCommonLockfile(lockfile, {
			packageJsonName: "package.json",
			projectDirectory: join(__dirname, "fixtures", "npm-workspace"),
			skipResolve: false,
		});

		commonLock.path = undefined;
		expect(commonLock).toMatchSnapshot();
	});
});
