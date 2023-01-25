import { ucmd } from "ucmd";
import { buildCommand, buildCommandOptions } from "./build";

const runVitest = () => {
	process.argv = process.argv.slice(0, 2).concat(process.argv.slice(3));
	// @ts-ignore - vitest's cli is not typed
	import("vitest/vitest.mjs");
};

let cmd = ucmd()
	.withName("scripts")
	.withCommand({
		name: "test",
		run: runVitest,
	})
	.withCommand({ ...buildCommandOptions, run: buildCommand });

try {
	cmd.run();
} catch (e) {
	if (e instanceof Error) console.error(e?.message);
}
