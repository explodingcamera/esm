import { describe, expect, test } from "vitest";
import { createCommand, ucmd } from ".";
import type { CommandContext, Command } from ".";

describe("parse commands", () => {
	test("ucmd", () => {
		let x = ucmd("example")
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

		expect(x.parse(["build", "test1", "--foo", "--test", "test", "test2"])).toMatchInlineSnapshot(`
			{
			  "res": {
			    "positionals": [
			      "test1",
			      "test2",
			    ],
			    "values": {
			      "foo": true,
			      "test": "test",
			    },
			  },
			  "run": [Function],
			}
		`);

		expect(x.parse(["test1", "--foo", "test", "test2"])).toMatchInlineSnapshot(`
			{
			  "res": {
			    "positionals": [
			      "test1",
			      "test",
			      "test2",
			    ],
			    "values": {
			      "foo": true,
			    },
			  },
			  "run": [Function],
			}
		`);
	});
});

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
				bar: {},
				baz: false,
			},
		});

		let twoCmdDirect = {
			name: "build",
			args: {
				foo: true,
				bar: {},
				baz: false,
			},
		} satisfies Command;

		expect(twoCmd).toEqual(twoCmdDirect);

		let twoFn = (ctx: CommandContext<typeof twoCmd>) => {
			ctx.args.foo;
		};

		let two = ucmd("example").withCommand(twoCmd, twoFn);

		expect(one).toEqual(two);
	});
});
