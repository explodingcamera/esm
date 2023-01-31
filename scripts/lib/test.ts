export const testCommand = {
	name: "test",
	description: "Run vitest",
	run: () => {
		process.argv = process.argv.slice(0, 2).concat(process.argv.slice(3));
		// @ts-ignore - vitest's cli is not typed
		import("vitest/vitest.mjs");
	},
};
