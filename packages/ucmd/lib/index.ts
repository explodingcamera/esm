import { parseArgs } from "node:util";
import type { CommandArg } from "../types/types";
import type { AddCommand, Command, CommandArgs, CommandFn, CommandsLike, LiteralString, ucmdState } from "./types";
import { generateOptions, toCommandArgs } from "./utils";

const defaultState: ucmdState<{}> = {
	name: "",
	commands: {
		help: {
			asdf: "asdf",
		},
	},
};

class UCMD<TCommands extends CommandsLike, TBaseCommand> {
	#state: ucmdState<TCommands, TBaseCommand> = defaultState as ucmdState<TCommands, TBaseCommand>;

	get state() {
		return this.#state;
	}

	constructor() {}

	withName(name: string) {
		this.#state.name = name;
		return this;
	}

	withCommand<
		TNewCommandArgs extends CommandArgs,
		TNewCommandName extends string,
		TNewCommand extends Command<TNewCommandArgs, TNewCommandName>,
		TUpdatedCommands extends AddCommand<TCommands, TNewCommandArgs, TNewCommandName, TNewCommand>,
	>(
		command: LiteralString<TNewCommandName> | Partial<Command<TNewCommandArgs, LiteralString<TNewCommandName>>>,
		run?: CommandFn<TNewCommandArgs extends infer T ? T : never>,
	): UCMD<TUpdatedCommands, TBaseCommand> {
		let newCMD = typeof command === "string" ? <TNewCommand>{ name: command as string } : command;
		let runfn = typeof run === "undefined" ? run : newCMD?.run;

		if (run && newCMD?.run) throw new Error("Only one run function is allowed");
		if (!runfn) throw new Error("Run function is required");
		if (!newCMD.name) throw new Error("Command name is required");
		newCMD.run = runfn;

		Object.assign(this.#state.commands, { [newCMD.name]: newCMD });
		return this as unknown as UCMD<TUpdatedCommands, TBaseCommand>;
	}

	withBaseCommand<TNewBaseCommand extends Command<CommandArgs, string>>(): UCMD<TCommands, TNewBaseCommand> {
		return this as unknown as UCMD<TCommands, TNewBaseCommand>;
	}

	parse(args?: string[]) {
		let run: CommandFn<{}> = () => console.log("Command not found. Try --help");
		let commandArgs = args || process.argv.slice(2);
		let command: string | undefined = undefined;
		let options: CommandArg[] = [];

		// Get the command
		if (commandArgs[0] && !commandArgs[0].startsWith("-")) {
			command = commandArgs[0];
			commandArgs = commandArgs.slice(1);

			if (!this.#state.commands[command]) return console.log("Command not found. Try --help");
			run = this.#state.commands[command]!.run;
			options = toCommandArgs(this.#state.commands?.[command]?.args || []);
		}

		// If no command is specified, run the baseCommand
		if (!command) {
			if (!this.#state.baseCommand) {
				console.log("No command specified");
				return;
			}

			run = this.#state.baseCommand.run;
			options = toCommandArgs(this.#state.baseCommand.args || []);
			return;
		}

		let res = parseArgs({
			args: commandArgs,
			options: generateOptions(options),
		});

		return { res, run };
	}

	run(args?: string[]) {
		let parsedArgs = this.parse(args);
		if (parseArgs === undefined) return;
		const { res, run } = parsedArgs!;
		run({ args: res.values as Record<string, string> });
	}
}

export const ucmd = <T extends string>(name: T) => {
	return new UCMD().withName(name);
};
