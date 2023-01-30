import { test, expect } from "vitest";
import { func } from ".";

test("test", async () => {
	expect(func()).toMatchInlineSnapshot('"Hello, World!"');
});
