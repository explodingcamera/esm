import { parseArgs } from "node:util";
import type { AddCommand, Command, CommandFn, Commands, ucmdState } from "./types";
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
		let [command, ...rest] = (args || process.argv).slice(2);

		let run: CommandFn = () => console.log("Command not found. Try --help");
		if (!command) {
			if (!this.#state.noCommand) {
				console.log("No command specified");
				return;
			}

			run = this.#state.noCommand.run;
			return;
		}

		let options = this.#state.commands[command]?.args;
		if (this.#state.commands[command]) {
			run = this.#state.commands[command]!.run;
		}

		let res = parseArgs({
			args: rest,
			options: generateOptions(toCommandArgs(options || [])),
		});

		return this.#state.commands;
	}

	run(args?: string[]) {}
}

export const ucmd = <T extends string>(name: T) => {
	return new UCMD().withName(name);
};

const build = () => {};

const foo = ucmd("asdf")
	.withCommand("build", build)
	.withCommand({
		name: "build",
		description: "Builds the project",
		args: { run: {} },
		run: console.log,
	})
	.parse();
