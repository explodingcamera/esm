import { describe, expect, test } from "vitest";

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse, toCommonLockfile } from "../lib/lockfiles/pnpm";
import { readFile } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("pnpm parse", () => {
	test("should parse a pnpm lockfile", async () => {
		const file = await readFile(join(__dirname, "fixtures", "pnpm", "pnpm-lock.yaml"), "utf8");
		const lockfile = await parse(false, file);
		expect(lockfile).toMatchSnapshot();
	});
});

describe("pnpm toCommonLockfile", () => {
	test("should convert a pnpm lockfile to a common lockfile", async () => {
		const file = await readFile(join(__dirname, "fixtures", "pnpm", "pnpm-lock.yaml"), "utf8");
		const lockfile = await parse(false, file);

		expect(
			await toCommonLockfile(lockfile, {
				packageJsonName: "package.json",
				projectDirectory: join(__dirname, "fixtures", "pnpm"),
				skipResolve: true,
			}),
		).toMatchSnapshot();
	});
});
