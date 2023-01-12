import { parseArgs } from "node:util";
import type { AddCommand, Command, CommandArg, CommandFn, Commands, ucmdState } from "./types";
import { generateOptions, toCommandArgs } from "./utils";

const defaultState: ucmdState<{}> = {
	name: "",
	commands: {},
};

class UCMD<TCommands extends Commands, T extends ucmdState<TCommands>> {
	#state: T = defaultState as T;

	constructor() {}

	withName<TName extends string>(name: TName): UCMD<TCommands, T & { name: TName }> {
		this.#state.name = name;
		return this as unknown as UCMD<TCommands, T & { name: TName }>;
	}

	withCommand<
		TCommandName extends string,
		TCommand extends Readonly<Command<TCommandName>>,
		TNewCommands extends AddCommand<TCommands, TCommand>,
	>(command: TCommand | TCommandName, run?: () => void): UCMD<TNewCommands, T & { commands: TNewCommands }> {
		const newCmd = (typeof command === "string" ? { name: command, run } : command) as TNewCommands[TCommandName];
		(this.#state.commands as unknown as TNewCommands)[newCmd.name] = newCmd;
		return this as unknown as UCMD<TNewCommands, T & { commands: TNewCommands }>;
	}

	withNoCommand<TCommand extends Command<string>>(): UCMD<TCommands, T & { noCommand: TCommand }> {
		return this as unknown as UCMD<TCommands, T & { noCommand: TCommand }>;
	}

	parse(args?: string[]) {
		let run: CommandFn = () => console.log("Command not found. Try --help");
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

		// If no command is specified, run the noCommand
		if (!command) {
			if (!this.#state.noCommand) {
				console.log("No command specified");
				return;
			}

			run = this.#state.noCommand.run;
			options = toCommandArgs(this.#state.noCommand.args || []);
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
		run(res.values as Record<string, string>);
	}
}

export const ucmd = <T extends string>(name: T) => {
	return new UCMD().withName(name);
};
