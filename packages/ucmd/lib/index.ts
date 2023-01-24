import { parseArgs } from "node:util";

import type {
	AddCommand,
	BaseCommand,
	Command,
	CommandArgs,
	CommandContext,
	CommandFn,
	CommandsLike,
	LiteralString,
	ucmdState,
} from "./types";
import { normalizeCommandArgs, NormalizedCommandArg, toParseArgOptions } from "./utils";

const defaultState: ucmdState<{}> = {
	name: "",
	commands: {
		help: true,
	},
};

class UCMD<TCommands extends CommandsLike, TBaseCommand> {
	#state: ucmdState<TCommands, TBaseCommand>;

	get state() {
		return this.#state;
	}

	constructor() {
		this.#state = Object.assign({}, defaultState) as ucmdState<TCommands, TBaseCommand>;
	}

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
		command:
			| LiteralString<TNewCommandName>
			| Command<TNewCommandArgs, LiteralString<TNewCommandName>>
			| Partial<Command<TNewCommandArgs, LiteralString<TNewCommandName>>>,
		run?: CommandFn<TNewCommandArgs extends infer T ? T : never>,
	): UCMD<TUpdatedCommands, TBaseCommand> {
		let newCMD = createCommand(command, run);
		Object.assign(this.#state.commands, { [newCMD.name]: newCMD });
		return this as unknown as UCMD<TUpdatedCommands, TBaseCommand>;
	}

	withBaseCommand<TNewBaseCommand extends BaseCommand<CommandArgs>>(
		baseCommand: TNewBaseCommand,
	): UCMD<TCommands, TNewBaseCommand> {
		(this.#state as unknown as { baseCommand: TNewBaseCommand }).baseCommand = baseCommand;
		return this as unknown as UCMD<TCommands, TNewBaseCommand>;
	}

	parse(args?: string[]) {
		const defaultCommand: CommandFn<{}> = () => console.log("Command not found. Try --help");

		let run: CommandFn<{}> = defaultCommand;
		let commandArgs = args || process.argv.slice(2);
		let command: string | undefined = commandArgs[0];
		let options: NormalizedCommandArg[] = [];

		// Get the command
		if (command && !command.startsWith("-") && this.#state.commands[command]) {
			commandArgs = commandArgs.slice(1);

			run = this.#state.commands[command]?.run ?? defaultCommand;
			options = normalizeCommandArgs(this.#state.commands?.[command]?.args || []);
		}

		// If no command is specified, run the baseCommand
		else {
			if (!this.#state.baseCommand) {
				console.log("No command specified");
				return;
			}

			run = this.#state.baseCommand.run ?? defaultCommand;
			options = normalizeCommandArgs(this.#state.baseCommand.args || []);
		}

		let res = parseArgs({
			args: commandArgs,
			allowPositionals: true,
			options: toParseArgOptions(options),
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

export const createCommand = <TCommandArgs extends CommandArgs, TCommandName extends string>(
	command: LiteralString<TCommandName> | Partial<Command<TCommandArgs, LiteralString<TCommandName>>>,
	run?: CommandFn<TCommandArgs extends infer T ? T : never>,
): Command<TCommandArgs, TCommandName> => {
	let newCMD = typeof command === "string" ? <Command<TCommandArgs, TCommandName>>{ name: command as string } : command;
	let runfn = typeof run === "undefined" ? run : newCMD?.run;

	if (run && newCMD?.run) throw new Error("Only one run function is allowed");
	if (!newCMD.name) throw new Error("Command name is required");
	if (runfn) newCMD.run;

	return newCMD as Command<TCommandArgs, TCommandName>;
};

export type { Command, CommandContext };
