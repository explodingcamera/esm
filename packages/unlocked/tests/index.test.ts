import { join } from "node:path";
import { test, expect } from "vitest";

import { parse as parsePnpm, toCommonLockfile } from "../lib/lockfiles/pnpm";

test("resolve-dependencies", async () => {
	let projectDirectory = join(__dirname, "fixtures", "generic");

	const lockfile = await parsePnpm(projectDirectory);
	expect(lockfile).toMatchSnapshot();

	const commonLockfile = await toCommonLockfile(lockfile, {
		packageJsonName: "package.json",
		projectDirectory,
	});

	expect(commonLockfile).toMatchSnapshot();
});
