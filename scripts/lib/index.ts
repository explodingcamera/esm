import { ucmd } from "ucmd";
import { mdtableCommand, mdtableCommandOptions } from "./mdtable.js";

const cmd = ucmd()
	.withName("scripts")
	.withCommand({ ...mdtableCommandOptions, run: mdtableCommand });

try {
	cmd.run();
} catch (e) {
	if (e instanceof Error) console.error(e?.message);
}
