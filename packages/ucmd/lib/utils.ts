import type { CommandArgOptions, CommandArgs, ParseArgsOptionConfig } from "./types";

export type NormalizedCommandArg = CommandArgOptions & { name: string };

export const normalizeCommandArgs = (args: CommandArgs | NormalizedCommandArg[]): NormalizedCommandArg[] => {
	if (Array.isArray(args)) return args;

	return Object.entries(args)
		.map(([name, options]) => {
			if (options === false) return undefined;
			if (options === undefined || options === true) return { name };
			if (options === null || typeof options !== "object")
				throw new Error(`Invalid command arg options for ${name}`);
			const opts: CommandArgOptions = options;
			return <NormalizedCommandArg>{
				name,
				...opts,
			};
		})
		.filter((arg) => arg !== undefined) as NormalizedCommandArg[];
};

export const toParseArgOptions = (options: NormalizedCommandArg[]): Record<string, ParseArgsOptionConfig> =>
	Object.assign(
		{},
		...options.map((option) => ({
			[option.name]: toParseArgOption(option),
		})),
	);

const toParseArgOption = (options: CommandArgOptions): ParseArgsOptionConfig => {
	const opt = <ParseArgsOptionConfig>{
		type: "boolean",
	};

	if (options.default !== undefined) opt.default = options.default;
	if (options.type !== undefined) {
		if (options.type === "number") {
			opt.type = "string";
		} else {
			opt.type = options.type;
		}
	}
	if (options.short !== undefined) opt.short = options.short;
	if (options.multiple !== undefined) opt.multiple = options.multiple;

	return opt;
};
