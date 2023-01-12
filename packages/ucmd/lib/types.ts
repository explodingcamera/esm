import type { ParseArgsConfig } from "node:util";

// TODO: pass typed args to run
export type CommandFn = (args: Record<string, string>) => void;

export type Command<TCommandName> = {
	name: TCommandName;
	run: CommandFn;

	description?: string | undefined;
	args?: CommandArg[] | Record<string, CommandArgOptions | true> | undefined;
};

export type ValueOf<T> = T[keyof T];
export type ParseArgsOptionConfig = ValueOf<Exclude<ParseArgsConfig["options"], undefined>>;

export type CommandArgOptions = {
	description?: string | undefined;
	optional?: boolean | undefined;
	default?: string | undefined;
	short?: string | undefined;
};

export type CommandArg =
	| string
	| [string, CommandArgOptions]
	| ({
			name: string;
	  } & CommandArgOptions);

export type Commands<TCommands extends Record<string, Command<string>> = Record<string, Command<string>>,> = {
	[key in keyof TCommands]: TCommands[key];
};

export type AddCommand<TCommands extends Commands, TCommand extends Command<string>> = {
	[key in keyof TCommands]: TCommands[key];
} & {
	[key in TCommand["name"]]: TCommand;
};

export type ucmdState<TCommands extends Commands> = {
	name: string;
	commands: TCommands;
	noCommand?: Command<string>;
};
