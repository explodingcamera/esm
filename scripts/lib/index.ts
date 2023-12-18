import { ucmd } from "ucmd";
import { buildCommand, buildCommandOptions } from "./build";
import { mdtableCommand, mdtableCommandOptions } from "./mdtable";

const cmd = ucmd()
	.withName("scripts")
	.withCommand({ ...buildCommandOptions, run: buildCommand })
	.withCommand({ ...mdtableCommandOptions, run: mdtableCommand });

try {
	cmd.run();
} catch (e) {
	if (e instanceof Error) console.error(e?.message);
}
