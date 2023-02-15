import { join } from "node:path";
import { test, expect } from "vitest";
import { defaultCommonLockOptions } from "../lib";

import { parse as parsePnpm, toCommonLockfile } from "../lib/lockfiles/pnpm";

test("resolve-dependencies", async () => {
	let projectDirectory = join(__dirname, "fixtures", "generic");

	const lockfile = await parsePnpm(projectDirectory);
	expect(lockfile).toMatchSnapshot();

	const commonLockfile = await toCommonLockfile(lockfile, defaultCommonLockOptions({ projectDirectory }));
	commonLockfile.path = undefined;

	expect(commonLockfile).toMatchSnapshot();
});
