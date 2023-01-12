import type { CommandArg, CommandArgOptions, ParseArgsOptionConfig } from "./types";

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
				[option]: { type: "string" },
			};

		if (Array.isArray(option))
			return {
				[option[0]]: { type: "string" },
			};

		return {
			[option.name]: { type: "string" },
		};
	});

	return Object.assign({}, ...opts);
};
