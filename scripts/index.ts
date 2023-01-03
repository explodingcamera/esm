import { argv } from "node:process";
import { parseArgs, ParseArgsConfig } from "node:util";
import type { BuildOptions, DevOptions } from "./lib/build";
import { build } from "./lib/build.js";

export type Options<T extends Record<string, unknown>> = {
	[K in keyof T]: string | boolean | (string | boolean)[] | undefined;
};

const options: {
	[key in keyof (BuildOptions & DevOptions)]: Exclude<ParseArgsConfig["options"], undefined>[key]; // why doesn't typescript export this type :(
} = {
	// Build options
	name: { type: "string", short: "n" }, // required
	fileName: { type: "string", short: "f" }, // optional
	visualize: { type: "boolean", default: false }, // optional
	external: { type: "string", short: "e", multiple: true }, // optional

	// Dev options (includes build options)
	withWebserver: { type: "boolean", default: false },
};

const run = async () => {
	const {
		positionals: [command, ...args],
		values,
	} = parseArgs({
		allowPositionals: true,
		options,
	});

	if (typeof command !== "string") throw new Error("No command specified");

	switch (command) {
		case "build":
			// usage: scripts build --name MyLib --fileName my-lib ./src/entry.ts
			await build(args, values);
			break;

		default:
			console.log("Unknown command");
	}
};

if (argv[2] === "test") {
	// remove the "test" argument
	process.argv = process.argv.slice(0, 2).concat(process.argv.slice(3));
	// @ts-ignore - vitest's cli is not typed
	await import("vitest/vitest.mjs");
} else {
	run().catch((e) => {
		if (e instanceof Error) {
			console.error(e?.message);
		}
	});
}
