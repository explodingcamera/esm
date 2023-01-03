import type { Options } from "..";
import { build as viteBuild } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import { resolve } from "node:path";
import dts from "vite-plugin-dts";

export type BuildOptions = {
	name: string;
	fileName: string;
	visualize: boolean;
	external: string[];
};

export type DevOptions = BuildOptions & {
	withWebserver: boolean;
};

export const build = async (args: string[], opts: Options<BuildOptions | DevOptions>) => {
	let { external, name, fileName, visualize } = opts;

	if (typeof name !== "string") throw new Error("name is required (--name MyLib)");
	if (fileName && typeof fileName !== "string") throw new Error("fileName is required");
	if (args.length === 0 || !args[0]) throw new Error("No entry file specified");
	if (!visualize || typeof visualize !== "boolean") visualize = false;

	if (external && !Array.isArray(external)) throw new Error("external must be an array of strings");

	await viteBuild({
		root: process.cwd(),
		plugins: [
			visualize && visualizer(),
			dts({
				exclude: ["node_modules", "../../node_modules"],
				outputDir: "types",
			}),
		],
		configFile: false,
		build: {
			lib: {
				entry: resolve(process.cwd(), args[0]),
				name,
				fileName: fileName || name.replace(/([a-z0–9])([A-Z])/g, "$1-$2").toLowerCase(),
				formats: ["es", "cjs"],
			},
			rollupOptions: {
				external: (opts.external as string[]) || [],
				output: {
					globals: {
						lit: "Lit",
					},
				},
			},
		},
	});
};
