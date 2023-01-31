import { ucmd } from "ucmd";
import { buildCommand, buildCommandOptions } from "./build";
import { mdtableCommand, mdtableCommandOptions } from "./mdtable";
import { testCommand } from "./test";

let cmd = ucmd()
	.withName("scripts")
	.withCommand(testCommand)
	.withCommand({ ...buildCommandOptions, run: buildCommand })
	.withCommand({ ...mdtableCommandOptions, run: mdtableCommand });

try {
	cmd.run();
} catch (e) {
	if (e instanceof Error) console.error(e?.message);
}
