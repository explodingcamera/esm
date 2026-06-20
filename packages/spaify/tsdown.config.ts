import { defineConfig, type UserConfig } from "tsdown";

const common = {
	dts: true,
	minify: true,
	target: "node22",
};

const config: UserConfig[] = defineConfig([
	{
		...common,
		entry: {
			index: "lib/index.ts",
		},
	},
	{
		...common,
		clean: false,
		dts: false,
		format: "iife",
		outputOptions: {
			entryFileNames: "[name].js",
		},
		entry: {
			default: "lib/default.ts",
		},
	},
]);

export default config;
