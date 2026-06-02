import { createFilter } from "@rollup/pluginutils";
import { minifyHTMLLiterals, type Options as MinifyOptions } from "minify-literals";
import type { Plugin } from "rollup";

/** Options for {@link minifyTemplateLiterals}. */
export type Options = {
	/** Files to include. Passed to `@rollup/pluginutils#createFilter`. */
	include?: string | RegExp | Array<string | RegExp>;

	/** Files to exclude. Passed to `@rollup/pluginutils#createFilter`. */
	exclude?: string | RegExp | Array<string | RegExp>;

	/** Options passed to `minify-literals`. */
	minify?: MinifyOptions;
};

/** Rollup/Vite plugin that minifies HTML, SVG, and CSS tagged template literals. */
export function minifyTemplateLiterals(options: Options = {}): Plugin {
	const filter = createFilter(options.include, options.exclude);
	const minifyOptions = options.minify ?? {};

	return {
		name: "minify-template-literals",
		async transform(code, id) {
			if (!filter(id)) return null;

			try {
				const result = await minifyHTMLLiterals(code, {
					...minifyOptions,
					fileName: id,
				});

				if (!result) return null;

				return {
					code: result.code,
					map: result.map ?? null,
				};
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				this.warn(message);
				return null;
			}
		},
	};
}

export default minifyTemplateLiterals;
