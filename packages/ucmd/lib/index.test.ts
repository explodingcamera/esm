import { describe, expect, test } from "vitest";
import { createCommand, ucmd } from ".";
import type { CommandContext, Command } from ".";

describe("basic api", () => {
	test("ucmd", () => {
		let x = ucmd("example");
		expect(x).toBeDefined();
		expect(x.state.name).toBe("example");
	});

	test("withName", () => {
		let x = ucmd("example").withName("overwritten");
		expect(x.state.name).toBe("overwritten");
	});

	test("withCommand", () => {
		let res = ucmd("example").withCommand({
			name: "build",
			args: {
				foo: true,
				bar: false,
			},
		});

		expect(res.state.commands.build).toBeDefined();
	});

	test("withImportedCommand", () => {
		let one = ucmd("example").withCommand({
			name: "build",
			args: {
				foo: true,
				bar: false,
			},
		});

		let twoCmd = createCommand({
			name: "build",
			args: {
				foo: true,
				bar: false,
			},
		});

		// NOTE: this won't give us type inference for the args, createCommand is the preferred way to create commands due to the infere keyword only supporting function arguments
		let twoCmdDirect: Command = {
			name: "build",
			args: {
				foo: true,
				bar: false,
			},
		};

		expect(twoCmd).toEqual(twoCmdDirect);

		let twoFn = (ctx: CommandContext<typeof twoCmd>) => {
			ctx.args.foo;
		};

		let two = ucmd("example").withCommand(twoCmd, twoFn);

		expect(one).toEqual(two);
	});
});
