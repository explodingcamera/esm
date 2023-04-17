import { join } from "node:path";

import { build as tsbuild, type Format } from "tsup";
import type { Command, CommandContext } from "ucmd";

export const buildCommandOptions = {
	name: "build",
	description: "Builds the project",
	args: {
		external: {
			short: "e",
			multiple: true,
			type: "string",
			description: "External dependencies to exclude from the bundle (dependencies are always external)",
		},
		target: {
			type: "string",
			multiple: true,
			default: ["es2020"],
			description: "The target environment",
		},
		format: {
			type: "string",
			multiple: true,
			default: ["esm", "cjs"],
			description: "The output format",
		},
		minify: {
			type: "boolean",
			default: true,
			description: "Minify the output",
		},
		bundle: {
			type: "boolean",
			default: true,
			description: "Bundle the output",
		},
		name: {
			short: "n",
			type: "string",
			description: "The name of the package",
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
		treeshake: true,
	});
};
