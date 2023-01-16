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

export type BaseCommand<TCommandArguments extends CommandArgs> = {
	description?: string | undefined;
	run?: CommandFn<TCommandArguments>;
	args?: TCommandArguments | undefined;
};

export type CommandLike = Command<CommandArgs, string>;
export type Command<
	TCommandArguments extends CommandArgs = CommandArgs,
	TCommandName extends string = string,
> = BaseCommand<TCommandArguments> & {
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

type CommandContextBody<TCommandArguments extends CommandArgs> = {
	args: TCommandArguments;
};
export type CommandFn<TCommandArguments extends CommandArgs> = (ctx: CommandContextBody<TCommandArguments>) => void;
export type CommandContext<T> = T extends Command<infer TArgs, string> ? CommandContextBody<TArgs> : never;

export type ValueOf<T> = T[keyof T];
export type ParseArgsOptionConfig = ValueOf<Exclude<ParseArgsConfig["options"], undefined>>;

type UnUnion<T, S> = T extends S ? ([S] extends [T] ? T : never) : never;
type NotUnion<T> = UnUnion<T, T>;
export type LiteralString<T extends string> = string extends T ? never : NotUnion<T>;
