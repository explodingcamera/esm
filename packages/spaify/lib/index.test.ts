import { test, expect } from "vitest";
import { init } from ".";

test("test", async () => {
	expect(init).toMatchInlineSnapshot("[Function]");
});
