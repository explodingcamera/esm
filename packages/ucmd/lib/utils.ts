import type { CommandArgOptions, ParseArgsOptionConfig } from "./types";

export type CommandArg = string | [string, CommandArgOptions] | (CommandArgOptions & { name: string });

export const toCommandArgs = (args: Record<string, CommandArgOptions | true> | CommandArg[]): CommandArg[] => {
	if (Array.isArray(args)) return args;

	return Object.entries(args).map(([name, options]) => {
		if (typeof options === "boolean") return name;
		return {
			name,
			...options,
		};
	});
};

export const generateOptions = (options: CommandArg[]): Record<string, ParseArgsOptionConfig> => {
	let opts = options.map((option) => {
		if (typeof option === "string")
			return {
				[option]: toParseArgOptions({}),
			};

		if (Array.isArray(option))
			return {
				[option[0]]: toParseArgOptions(option[1]),
			};

		return {
			[option.name]: toParseArgOptions(option),
		};
	});

	return Object.assign({}, ...opts);
};

const toParseArgOptions = (options: CommandArgOptions): ParseArgsOptionConfig => {
	return {
		type: "string",
		default: options.default,
		short: options.short,
	};
};
