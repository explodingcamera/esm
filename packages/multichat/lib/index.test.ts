import { test, expect } from "vitest";
import { func } from "./index";

test("test", async () => {
	expect(func()).toMatch("Hello, World!");
});
