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

const {
	positionals: [command, ...args],
	values,
} = parseArgs({
	allowPositionals: true,
	options,
});

const run = async () => {
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

run().catch((e) => {
	if (e instanceof Error) {
		console.error(e?.message);
	}
});
