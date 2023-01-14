import type { ParseArgsConfig } from "node:util";

export type CommandArgOptions = {
	description?: string | undefined;
	optional?: boolean | undefined;
	default?: string | undefined;
	short?: string | undefined;
	type?: "string" | "number" | "boolean" | undefined;
	multiple?: boolean | undefined;
};

export type CommandArgs<TCommandArgs extends Record<string, CommandArgOptions | true> = {}> = {
	[key in keyof TCommandArgs]: CommandArgOptions | true;
};

export type BaseCommand<TCommandArguments> = {
	run: CommandFn<TCommandArguments>;
	description?: string | undefined;
	args?: TCommandArguments | undefined;
};

export type CommandLike = Command<CommandArgs, string>;
export type Command<TCommandArguments, TCommandName extends string> = BaseCommand<TCommandArguments> & {
	name: TCommandName;
};

export type CommandsLike = Commands<Record<string, CommandLike>>;
export type Commands<TCommands extends Record<string, Command<CommandArgs, string>>> = {
	[key in keyof TCommands]: TCommands[key];
};

export type ucmdState<TCommands extends CommandsLike, TNoCommandCommand = undefined> = {
	name: string;
	commands: TCommands;
	baseCommand?: TNoCommandCommand extends BaseCommand<CommandArgs> ? TNoCommandCommand : undefined;
};

export type AddCommand<
	TCommands extends CommandsLike,
	TCommandArgs extends CommandArgs,
	TCommandName extends string,
	TCommand extends Command<TCommandArgs, TCommandName>,
> = {
	[key in keyof TCommands]: TCommands[key];
} & {
	[key in TCommand["name"]]: TCommand;
};

export type CommandFn<TCommandArguments> = (ctx: {
	args: TCommandArguments;
}) => void;

export type ValueOf<T> = T[keyof T];
export type ParseArgsOptionConfig = ValueOf<Exclude<ParseArgsConfig["options"], undefined>>;

type UnUnion<T, S> = T extends S ? ([S] extends [T] ? T : never) : never;
type NotUnion<T> = UnUnion<T, T>;
export type LiteralString<T extends string> = string extends T ? never : NotUnion<T>;
