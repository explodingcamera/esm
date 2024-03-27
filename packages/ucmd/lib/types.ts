import type { ParseArgsConfig } from "node:util";

export type CommandArgOptions = {
	description?: string | undefined;
	required?: boolean | undefined;
	default?: string | undefined;
	short?: string | undefined;
	type?: "string" | "number" | "boolean" | undefined;
	multiple?: boolean | undefined;
};

export type CommandArgs<TCommandArgs extends Record<string, CommandArgOptions | boolean> = {}> = {
	[key in keyof TCommandArgs]: CommandArgOptions | boolean;
};

export type BaseCommand<TCommandArguments extends CommandArgs> = {
	description?: string | undefined;
	run?: CommandFn<TCommandArguments>;
	args?: TCommandArguments | Record<string, CommandArgOptions | boolean>;
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
	positionals: string[];
	args: CommandArgValues<TCommandArguments>;
};

type GetCommandArgType<TCommandArgOptions extends CommandArgOptions> =
	TCommandArgOptions["required"] extends true
		? _GetCommandArgType<TCommandArgOptions>
		: _GetCommandArgType<TCommandArgOptions> | undefined;

type _GetCommandArgType<TCommandArgOptions extends CommandArgOptions> =
	TCommandArgOptions["multiple"] extends true
		? __GetCommandArgType<TCommandArgOptions>[]
		: __GetCommandArgType<TCommandArgOptions>;

type __GetCommandArgType<TCommandArgOptions extends CommandArgOptions> = TCommandArgOptions["type"] extends
	| "string"
	| undefined
	? string
	: TCommandArgOptions["type"] extends "number"
		? number
		: TCommandArgOptions["type"] extends "boolean"
			? boolean
			: string;

export type CommandArgValues<TCommandArguments extends CommandArgs> = {
	[key in keyof TCommandArguments]: TCommandArguments[key] extends Record<string, unknown>
		? GetCommandArgType<TCommandArguments[key]>
		: TCommandArguments[key] extends boolean
			? boolean
			: never;
};

export type CommandFn<TCommandArguments extends CommandArgs> = (
	ctx: CommandContextBody<TCommandArguments>,
) => void;

export type CommandContext<T> = T extends Command<infer TArgs, string> ? CommandContextBody<TArgs> : never;

export type ValueOf<T> = T[keyof T];
export type ParseArgsOptionConfig = ValueOf<Exclude<ParseArgsConfig["options"], undefined>>;

type UnUnion<T, S> = T extends S ? ([S] extends [T] ? T : never) : never;
type NotUnion<T> = UnUnion<T, T>;
export type LiteralString<T extends string> = string extends T ? never : NotUnion<T>;
