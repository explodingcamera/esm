import { test } from "vitest";
import { ucmd } from ".";

test.skip("test", async () => {
	let x = ucmd("asdf").withCommand({
		name: "build",
		args: {
			foo: true,
			bar: false,
		},
		run: (ctx) => {},
	});

	let args = x.state.commands.build;
});
