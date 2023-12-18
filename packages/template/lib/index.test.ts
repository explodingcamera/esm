import { test, expect } from "bun:test";
import { func } from "./index";

test("test", async () => {
	expect(func()).toMatch("Hello, World!");
});
