import { defineConfig } from "tsdown";

export default defineConfig({
	target: "node22",
	dts: true,
	workspace: {
		include: "packages/*",
		exclude: ["packages/css"],
	},
});
