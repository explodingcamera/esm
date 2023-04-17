import { parseArgs } from "node:util";

import type {
	AddCommand,
	BaseCommand,
	Command,
	CommandArgs,
	CommandContext,
	CommandFn,
	CommandsLike,
	ucmdState,
} from "./types";
import { normalizeCommandArgs, type NormalizedCommandArg, toParseArgOptions } from "./utils";

const defaultState: ucmdState<{}> = {
	name: "",
	commands: {},
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
			| TNewCommandName
			| Command<TNewCommandArgs, TNewCommandName>
			| Partial<Command<TNewCommandArgs, TNewCommandName>>,
		run?: CommandFn<TNewCommandArgs extends infer T ? T : never>,
	): UCMD<TUpdatedCommands, TBaseCommand> {
		const newCMD = createCommand(command, run);

		Object.assign(this.#state.commands, { [newCMD.name]: newCMD });
		return this as unknown as UCMD<TUpdatedCommands, TBaseCommand>;
	}

	withBaseCommand<TNewBaseCommand extends BaseCommand<CommandArgs>>(
		baseCommand: TNewBaseCommand,
	): UCMD<TCommands, TNewBaseCommand> {
		(this.#state as unknown as { baseCommand: TNewBaseCommand }).baseCommand = baseCommand;
		return this as unknown as UCMD<TCommands, TNewBaseCommand>;
	}

	#renderCommandOptions<T extends CommandArgs>(args: T) {
		let helpString = "\n\nOPTIONS:\n";

		const maxArgLength = Object.entries(args).reduce((max, [arg, argOptions]) => {
			const opts = argOptions as NormalizedCommandArg;
			if (opts.type === "boolean") return Math.max(max, arg.length);
			return Math.max(max, `${arg} <${arg}>`.length) + (opts.multiple ? 3 : 0); // +3 for "..."
		}, 2);

		const commandArgs = normalizeCommandArgs(args);
		for (const [arg, argOptions] of Object.entries(commandArgs)) {
			const opts = argOptions as NormalizedCommandArg;
			const argName = opts.name ?? arg;
			const argDescription = opts.description ?? "";
			const argRequired = opts.required ?? false;
			const short = opts.short ? `-${opts.short}, ` : "    ";
			helpString += `    ${short}--${(opts.type === "boolean"
				? argName
				: `${argName} <${argName}>${opts.multiple ? "..." : ""}`
			).padEnd(maxArgLength)}${argDescription}${argRequired ? " [required]" : ""}${
				opts.default ? ` [default: ${opts.default}]` : ""
			}\n`;
		}

		return helpString;
	}

	help(command?: string) {
		let selectedCommand: Command | undefined;

		if (command) {
			selectedCommand = this.#state.commands[command];
			if (!selectedCommand) return console.log(`Command "${command}" not found.`);
		}

		const { name, commands, baseCommand } = this.#state;
		let helpString = `USAGE:\n    ${name}`;
		if (!(baseCommand || selectedCommand)) helpString += " [command]";
		if (selectedCommand) helpString += ` ${selectedCommand.name}`;
		helpString += " [options] [params...]";

		if (baseCommand && !selectedCommand) {
			helpString += this.#renderCommandOptions(baseCommand?.args || {});
		}

		if (selectedCommand) {
			if (selectedCommand.description) {
				helpString += `\n\nDESCRIPTION:\n    ${selectedCommand.description}`;
			}

			helpString += this.#renderCommandOptions(selectedCommand?.args || {});
		}

		if (!selectedCommand && Object.keys(commands).length > 0) {
			helpString += "\n\nCOMMANDS:\n";

			const maxCommandNameLength = Object.keys(commands).reduce(
				(max, commandName) => Math.max(max, commandName.length),
				0,
			);

			for (const commandName in commands) {
				const command = commands[commandName];
				if (!command) continue;
				helpString += `    ${commandName.padEnd(maxCommandNameLength + 1, " ")} ${
					command.description ?? ""
				}\n`;
			}

			helpString += `\n    Use ${name} help [command] for more information about a specific command.`;
		}

		console.log(helpString);
	}

	parse(args?: string[]) {
		const defaultCommand: CommandFn<{}> = () => console.log("Command not found. Try --help");

		let run: CommandFn<{}> = defaultCommand;
		let commandArgs = args || process.argv.slice(2);
		const command: string | undefined = commandArgs[0];
		let options: NormalizedCommandArg[] = [];

		if (command === "help") {
			this.help(commandArgs[1]);
			return;
		}

		// Get the command
		if (command && !command.startsWith("-") && this.#state.commands[command]) {
			commandArgs = commandArgs.slice(1);

			run = this.#state.commands[command]?.run ?? defaultCommand;
			options = normalizeCommandArgs(this.#state.commands?.[command]?.args || []);
		}

		// If no command is specified, run the baseCommand
		else {
			if (!this.#state.baseCommand) {
				if (!command) console.log("No command specified\n");
				this.help(command);
				return;
			}

			run = this.#state.baseCommand.run ?? defaultCommand;
			options = normalizeCommandArgs(this.#state.baseCommand.args || []);
		}

		const res = parseArgs({
			args: commandArgs,
			allowPositionals: true,
			options: toParseArgOptions(options),
		});

		return { res, run };
	}

	run(args?: string[]) {
		const parsedArgs = this.parse(args);
		if (parseArgs === undefined || !parsedArgs?.res) return;
		const { res, run } = parsedArgs;
		run({ args: res.values, positionals: res.positionals });
	}
}

export const ucmd = <T extends string>(name?: T) => {
	if (name) return new UCMD().withName(name);
	return new UCMD();
};

export const createCommand = <TCommandArgs extends CommandArgs, TCommandName extends string>(
	command: TCommandName | Partial<Command<TCommandArgs, TCommandName>>,
	run?: CommandFn<TCommandArgs extends infer T ? T : never>,
): Command<TCommandArgs, TCommandName> => {
	const newCMD =
		typeof command === "string" ? <Command<TCommandArgs, TCommandName>>{ name: command as string } : command;
	const runfn = typeof run === "undefined" ? newCMD?.run : run;

	if (run && newCMD?.run) throw new Error("Only one run function is allowed");
	if (!newCMD.name) throw new Error("Command name is required");
	if (runfn) newCMD.run = runfn as typeof newCMD.run;
	return newCMD as Command<TCommandArgs, TCommandName>;
};

export type { Command, CommandContext };
