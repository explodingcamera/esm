import { describe, expect, test } from "bun:test";
import { createCommand, ucmd } from ".";
import type { CommandContext, Command } from ".";

describe("parse commands", () => {
	test("ucmd", () => {
		const x = ucmd("example")
			.withBaseCommand({
				args: {
					foo: true,
					bar: false,
				},
			})
			.withCommand({
				name: "build",
				args: {
					test: {
						type: "string",
						default: "test",
					},
					foo: true,
					bar: false,
				},
			});

		expect(x.parse(["build", "test1", "--foo", "--test", "test", "test2"])).toMatchSnapshot();
		expect(x.parse(["test1", "--foo", "test", "test2"])).toMatchSnapshot();
	});
});

describe("basic api", () => {
	test("ucmd", () => {
		const x = ucmd("example");
		expect(x).toBeDefined();
		expect(x.state.name).toBe("example");
	});

	test("withName", () => {
		const x = ucmd("example").withName("overwritten");
		expect(x.state.name).toBe("overwritten");
	});

	test("withCommand", () => {
		const res = ucmd("example").withCommand({
			name: "build",
			args: {
				foo: true,
				bar: false,
			},
		});

		expect(res.state.commands.build).toBeDefined();
	});

	test("withImportedCommand", () => {
		const one = ucmd("example").withCommand({
			name: "build",
			args: {
				foo: true,
				bar: false,
			},
		});

		const twoCmd = createCommand({
			name: "build",
			args: {
				foo: true,
				bar: {},
				baz: false,
			},
		});

		const twoCmdDirect = {
			name: "build",
			args: {
				foo: true,
				bar: {},
				baz: false,
			},
		} as const satisfies Command;

		expect(twoCmd).toEqual(twoCmdDirect);

		const twoFn = (ctx: CommandContext<typeof twoCmd>) => {
			ctx.args.foo;
			ctx.args.bar;
		};

		const two = ucmd("example").withCommand(twoCmd, twoFn);
		expect(one).toEqual(two as typeof one);
	});
});
