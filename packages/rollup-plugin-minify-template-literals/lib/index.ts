import * as minify from "minify-literals";

import type { Plugin, SourceMapInput } from "rollup";
import { createFilter } from "@rollup/pluginutils";

/**
 * Plugin options.
 */
export interface Options {
	/**
	 * Pattern or array of patterns of files to minify.
	 */
	include?: string | string[];
	/**
	 * Pattern or array of patterns of files not to minify.
	 */
	exclude?: string | string[];
	/**
	 * Minify options, see
	 * https://github.com/explodingcamera/esm/tree/main/packages/minify-literals#options.
	 */
	options?: Partial<minify.Options>;
	/**
	 * If true, any errors while parsing or minifying will abort the bundle
	 * process. Defaults to false, which will only show a warning.
	 */
	failOnError?: boolean;
	/**
	 * Override minify-html-literals function.
	 */
	minifyHTMLLiterals?: typeof minify.minifyHTMLLiterals;
	/**
	 * Override include/exclude filter.
	 */
	filter?: (id: string) => boolean;
}

export const RollupPluginMinifyHTMLLiterals = function RollupPluginMinifyHTMLLiterals(options: Options = {}): Plugin {
	options.minifyHTMLLiterals = options.minifyHTMLLiterals || minify.minifyHTMLLiterals;
	options.filter = options.filter || createFilter(options.include, options.exclude);
	const minifyOptions = options.options || {};

	return {
		name: "minify-literals",
		async transform(code, id) {
			if (!options.filter!(id)) return;

			try {
				// <SourceDescription>
				let res = await options.minifyHTMLLiterals!(code, {
					...minifyOptions,
					fileName: id,
				});

				if (res === null || res?.code === code) return {};

				return {
					code: res.code,
					map: res.map as SourceMapInput,
				};
			} catch (error: unknown) {
				if (!(error instanceof Error)) return;
				(options.failOnError ? this.error : this.warn)(error.message);
			}

			return {};
		},
	};
};

export default RollupPluginMinifyHTMLLiterals;
export const minifyHTMLLiterals = RollupPluginMinifyHTMLLiterals;
