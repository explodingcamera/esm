type Command<TCommandName> = {
	name: TCommandName;
	description?: string | undefined;
	args?: CommandArg[] | Record<string, CommandArgOptions | true> | undefined;
	run?: (args: string[]) => void | undefined;
};

type CommandArgOptions = {
	description?: string | undefined;
	optional?: boolean | undefined;
};

type CommandArg =
	| string
	| [string, CommandArgOptions]
	| ({
			name: string;
	  } & CommandArgOptions);

type Commands<TCommands extends Record<string, Command<string>> = Record<string, Command<string>>,> = {
	[key in keyof TCommands]: TCommands[key];
};

type AddCommand<TCommands extends Commands, TCommand extends Command<string>> = {
	[key in keyof TCommands]: TCommands[key];
} & {
	[key in TCommand["name"]]: TCommand;
};

type ucmdState<TCommands extends Commands> = {
	name: string;
	commands: TCommands;
};

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

	parse(args?: string[]) {
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
