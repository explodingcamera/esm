import { join } from "node:path";

import { build as tsbuild, Format } from "tsup";
import type { Command, CommandContext } from "ucmd";

export const buildCommandOptions = {
	name: "build",
	description: "Builds the project",
	args: {
		external: {
			short: "e",
			multiple: true,
			type: "string",
		},
		target: {
			type: "string",
			multiple: true,
		},
		format: {
			type: "string",
			multiple: true,
		},
		minify: {
			type: "boolean",
		},
		bundle: {
			type: "boolean",
		},
		name: {
			type: "string",
		},
	},
} satisfies Command;

export const buildCommand = async ({ args, positionals }: CommandContext<typeof buildCommandOptions>) => {
	let entryPoints = positionals?.length ? positionals : ["lib/index.ts"];
	entryPoints = entryPoints.map((p) => join(process.cwd(), p));

	tsbuild({
		config: false,
		name: "tsup",
		external: args.external,
		entryPoints,
		format: (args.format as Format[]) ?? ["esm", "cjs"],
		dts: true,
		sourcemap: true,
		target: args.target ?? "es2020",
		minify: args.minify ?? true,
		bundle: args.bundle ?? true,
		outDir: "dist",
	});
};
