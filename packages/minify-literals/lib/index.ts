import MagicString from "magic-string";
import {
	combineTemplateParts,
	type CSSOptions,
	defaultMinifyCSSOptions,
	defaultMinifyOptions,
	getPlaceholder,
	minifyCSS,
	minifyHTML,
	splitByPlaceholder,
} from "./minify.js";
import { type Template, parseTemplates } from "./literals.js";

type MaybePromise<T> = T | Promise<T>;

/** Options passed to `html-minifier-next` for HTML and SVG template literals. */
export type HTMLMinifyOptions = typeof defaultMinifyOptions & Record<string, unknown>;

/** Custom HTML minifier used for HTML and SVG template literals. */
export type HTMLMinifier = (html: string) => MaybePromise<string>;

/** Options passed to Lightning CSS for CSS template literals and inline CSS. */
export type CSSMinifyOptions = CSSOptions & Record<string, unknown>;

/** Custom CSS minifier used for CSS template literals and inline CSS. */
export type CSSMinifier = (css: string) => MaybePromise<string>;

/** Options for {@link minifyHTMLLiterals}. */
export type Options = {
	/**
	 * Source filename used by literal parsing and source map generation.
	 */
	fileName?: string;

	/**
	 * HTML minification options or a custom HTML minifier. Set to `false` to skip
	 * HTML and SVG templates.
	 *
	 * @defaultValue {@link defaultMinifyOptions}
	 */
	html?: false | Partial<HTMLMinifyOptions> | HTMLMinifier;

	/**
	 * CSS minification options or a custom CSS minifier. Set to `false` to skip
	 * CSS templates and inline CSS inside HTML.
	 *
	 * @defaultValue {@link defaultMinifyCSSOptions}
	 */
	css?: false | CSSMinifyOptions | CSSMinifier;

	/**
	 * Template tag substrings treated as HTML-like templates.
	 * Matching is case-insensitive.
	 *
	 * @defaultValue `["html", "svg"]`
	 */
	htmlTags?: readonly string[];

	/**
	 * Template tag substrings treated as CSS-like templates.
	 * Matching is case-insensitive.
	 *
	 * @defaultValue `["css", "style", "styles", "styled"]`
	 */
	cssTags?: readonly string[];

	/**
	 * Generate a source map for changed code.
	 *
	 * @defaultValue `true`
	 */
	sourceMap?: boolean;
};

/** Result returned by {@link minifyHTMLLiterals} when code changed. */
export type Result = {
	/** Minified source code. */
	code: string;
	/** Source map for `code`, unless `sourceMap` was disabled. */
	map?: ReturnType<MagicString["generateMap"]>;
};

const defaultHTMLTags = ["html", "svg"] as const;
const defaultCSSTags = ["css", "style", "styles", "styled"] as const;

/**
 * Minifies HTML, SVG, and CSS tagged template literals in a JavaScript or
 * TypeScript source string.
 *
 * Returns `null` when no code changed.
 */
export async function minifyHTMLLiterals(source: string, options: Options = {}): Promise<Result | null> {
	let htmlMinifier: false | HTMLMinifyOptions | HTMLMinifier = false;
	if (options.html !== false) {
		if (typeof options.html === "function") {
			htmlMinifier = options.html;
		} else {
			htmlMinifier = {
				...defaultMinifyOptions,
				...options.html,
			};

			if (options.css === false) {
				htmlMinifier.minifyCSS = false;
			} else if (!options.html || !("minifyCSS" in options.html)) {
				htmlMinifier.minifyCSS = options.css ?? defaultMinifyCSSOptions;
			}
		}
	}

	const cssOptions = options.css ?? defaultMinifyCSSOptions;
	const htmlTags = options.htmlTags ?? defaultHTMLTags;
	const cssTags = options.cssTags ?? defaultCSSTags;
	const templates = parseTemplates(source, options.fileName);
	const ms = new MagicString(source);
	const skipCSS = cssOptions !== false && source.includes("unsafeCSS");
	const skipHTML = htmlMinifier !== false && source.includes("unsafeHTML");

	if (skipCSS) {
		console.warn(
			"minify-literals: unsafeCSS() detected in source. CSS minification will not be performed for this file.",
		);
	}

	if (skipHTML) {
		console.warn(
			"minify-literals: unsafeHTML() detected in source. HTML minification will not be performed for this file.",
		);
	}

	await Promise.all(
		templates.map(async (template) => {
			const shouldMinifyHTML = !skipHTML && htmlMinifier !== false && matchesTag(template, htmlTags);
			const shouldMinifyCSS = !skipCSS && cssOptions !== false && matchesTag(template, cssTags);

			if (!(shouldMinifyHTML || shouldMinifyCSS)) return;

			const placeholder = getPlaceholder(template.parts);
			const combined = combineTemplateParts(template.parts, placeholder);
			let min: string;
			if (shouldMinifyCSS) {
				min =
					typeof cssOptions === "function"
						? await cssOptions(combined)
						: await minifyCSS(combined, cssOptions);
				min = min
					.replaceAll(new RegExp(`(${placeholder})\\s+:\\s*`, "g"), "$1:")
					.replaceAll(new RegExp(`(${placeholder})\\s*;(?=})`, "g"), "$1");
			} else if (shouldMinifyHTML && htmlMinifier !== false) {
				min =
					typeof htmlMinifier === "function"
						? await htmlMinifier(combined)
						: await minifyHTML(combined, htmlMinifier);
			} else {
				return;
			}
			const minParts = splitByPlaceholder(min, placeholder);

			if (template.parts.length !== minParts.length) {
				throw new Error(
					"minify-literals: minified template did not preserve template expression placeholders",
				);
			}

			for (const [index, part] of template.parts.entries()) {
				if (part.start < part.end) ms.overwrite(part.start, part.end, minParts[index] ?? "");
			}
		}),
	);

	const code = ms.toString();
	if (source === code) return null;

	const map =
		options.sourceMap === false
			? undefined
			: ms.generateMap({
					file: `${options.fileName ?? ""}.map`,
					source: options.fileName ?? "",
					hires: true,
				});
	return { code, map };
}

function matchesTag(template: Template, tags: readonly string[]) {
	const tag = template.tag?.toLowerCase();
	return !!tag && tags.some((match) => tag.includes(match.toLowerCase()));
}
