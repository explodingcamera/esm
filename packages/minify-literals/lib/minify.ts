import { transform, type TransformOptions } from "lightningcss";
import { type MinifierOptions as HTMLOptions, minify as minifyHTMLString } from "html-minifier-next";
import type { TemplatePart } from "./literals.js";

export type { TemplatePart } from "./literals.js";

export type CSSOptions = Omit<TransformOptions<any>, "filename" | "code">;

/** Default Lightning CSS options for CSS template literals and inline CSS. */
export const defaultMinifyCSSOptions: CSSOptions = {
	minify: true,
};

/** Default html-minifier-next options for HTML and SVG template literals. */
export const defaultMinifyOptions: HTMLOptions = {
	caseSensitive: true,
	collapseWhitespace: true,
	decodeEntities: true,
	minifyCSS: defaultMinifyCSSOptions,
	minifyJS: true,
	removeAttributeQuotes: false,
	removeComments: true,
	removeEmptyAttributes: true,
	removeScriptTypeAttributes: true,
	removeStyleLinkTypeAttributes: true,
	useShortDoctype: true,
};

export function getPlaceholder(parts: TemplatePart[], base = "@TEMPLATE_EXPRESSION"): string {
	let placeholder = base;
	while (parts.some((part) => part.text.includes(placeholder))) {
		placeholder += "_";
	}

	return placeholder;
}

export function combineTemplateParts(parts: TemplatePart[], placeholder: string): string {
	return parts.map((part) => part.text).join(placeholder);
}

export async function minifyHTML(html: string, options: HTMLOptions = {}): Promise<string> {
	let minifyCSSOptions: HTMLOptions["minifyCSS"];

	if (html.match(/<!--(.*?)@TEMPLATE_EXPRESSION(.*?)-->/g)) {
		console.warn(
			"minify-literals: HTML minification is not supported for template expressions inside comments. Minification for this file will be skipped.",
		);
		return html;
	}

	html = html.replaceAll(/<@TEMPLATE_EXPRESSION(_*)/g, "<TEMPLATE_EXPRESSION$1___");
	html = html.replaceAll(/<\/@TEMPLATE_EXPRESSION(_*)/g, "</TEMPLATE_EXPRESSION$1___");

	if (options.minifyCSS) {
		if (options.minifyCSS !== true && typeof options.minifyCSS !== "function") {
			minifyCSSOptions = { ...options.minifyCSS };
		} else {
			minifyCSSOptions = { ...defaultMinifyCSSOptions };
		}
	} else {
		minifyCSSOptions = false;
	}

	let result = await minifyHTMLString(html, {
		...options,
		minifyCSS: minifyCSSOptions,
	});

	result = result.replaceAll(/<TEMPLATE_EXPRESSION(_*)___/g, "<@TEMPLATE_EXPRESSION$1");
	result = result.replaceAll(/<\/TEMPLATE_EXPRESSION(_*)___/g, "</@TEMPLATE_EXPRESSION$1");

	if (options.collapseWhitespace) {
		// html-minifier-next preserves SVG attribute newlines, unlike normal
		// HTML whitespace. Remove only inside SVG content.
		const matches = Array.from(result.matchAll(/<svg/g)).reverse();
		for (const match of matches) {
			const startTagIndex = match.index ?? 0;
			const closeTagIndex = result.indexOf("</svg", startTagIndex);
			if (closeTagIndex < 0) continue;

			const start = result.substring(0, startTagIndex);
			let svg = result.substring(startTagIndex, closeTagIndex);
			const end = result.substring(closeTagIndex);
			svg = svg.replace(/\r?\n/g, "");
			result = start + svg + end;
		}
	}

	return result;
}

export async function minifyCSS(css: string, options: CSSOptions = {}): Promise<string> {
	let result: string;
	try {
		result = transformCSS(css, options);
	} catch (stylesheetError) {
		try {
			const selector = ".__MINIFY_LITERALS__";
			const output = transformCSS(`${selector}{${css}}`, options);
			const prefix = `${selector}{`;
			if (!output.startsWith(prefix) || !output.endsWith("}"))
				throw new Error("Could not unwrap CSS declarations");
			result = output.slice(prefix.length, -1);
		} catch {
			console.warn(stylesheetError instanceof Error ? stylesheetError.message : String(stylesheetError));
			console.warn(
				"minify-literals: errors during CSS minification, file was skipped. See above for details.",
			);
			return css.replace(/(\n)|(\r)/g, "");
		}
	}

	return result;
}

export function splitByPlaceholder(html: string, placeholder: string): string[] {
	return html.split(placeholder);
}

function transformCSS(css: string, options: CSSOptions) {
	const output = transform({
		filename: "style.css",
		code: Buffer.from(css),
		minify: true,
		...options,
	});

	return output.code.toString();
}
