import { test } from "vitest";
import { ucmd } from ".";

test("test", async () => {
	ucmd("asdf").withCommand({
		name: "build",
		description: "Builds the project",
		run: console.log,
	});

	ucmd("asdf")
		.withCommand("build", () => {})
		.parse([...process.argv, "build"]);
});
