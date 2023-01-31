import { join } from "node:path";
import { test, expect } from "vitest";

import { parsePnpm } from "../lib";
import { toCommonLockfile } from "../lib/lockfiles/pnpm";

test("resolve-dependencies", async () => {
	const lockfile = await parsePnpm(join(__dirname, "fixtures", "generic"));
	expect(lockfile).toMatchSnapshot();

	expect(
		await toCommonLockfile(lockfile, {
			projectDirectory: join(__dirname, "fixtures", "generic"),
		}),
	).toMatchSnapshot();
});
