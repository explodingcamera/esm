/**
 * A minimal JSX templating library for rendering safe HTML strings.
 *
 * `simplejsx` is a small JSX-to-HTML renderer for server-side templates,
 * static site generation, emails, and other places where you just want to emit HTML.
 * It is not a React replacement: there are no hooks, DOM rendering, hydration,
 * Suspense, or React compatibility APIs.
 *
 * @remarks
 * ## Getting started
 *
 * ### Configure JSX
 *
 * Use the automatic JSX runtime. In TypeScript projects, put this in `tsconfig.json`:
 *
 * ```json
 * {
 * 	"compilerOptions": {
 * 		"jsx": "react-jsx",
 * 		"jsxImportSource": "simplejsx"
 * 	}
 * }
 * ```
 *
 * In Deno, put the same options in `deno.json`, using `"npm:simplejsx"` unless
 * you have an import map alias:
 *
 * ```json
 * {
 * 	"compilerOptions": {
 * 		"jsx": "react-jsx",
 * 		"jsxImportSource": "npm:simplejsx"
 * 	}
 * }
 * ```
 *
 * ### Render HTML
 *
 * ```tsx
 * import { render, type PropsWithChildren } from "simplejsx";
 *
 * function Layout({ children }: PropsWithChildren) {
 * 	return <main>{children}</main>;
 * }
 *
 * render(<Layout>Hello {"<Henry>"}</Layout>);
 * // "<main>Hello &lt;Henry&gt;</main>"
 * ```
 *
 * ## Rendering model
 *
 * ### Escaping
 *
 * Text and attributes are escaped by default. Use {@link unsafeHTML} only for
 * trusted markup that should be inserted as-is.
 *
 * ### Head hoisting
 *
 * Nested `<head>` elements are merged into the top-level `<head>`. This lets page
 * components set titles and metadata while a layout owns the document shell.
 *
 * ```tsx
 * render(<html><head /><body><head><title>Page</title></head></body></html>);
 * // "<html><head><title>Page</title></head><body></body></html>"
 * ```
 *
 * ### Async rendering
 *
 * JSX can contain async components, Promise children, and Promise attributes.
 * {@link render} stays synchronous and throws when it sees a Promise, so async
 * work is not accidentally omitted. Use {@link renderAsync} to await the whole tree.
 *
 * ```tsx
 * import { renderAsync } from "simplejsx";
 *
 * const title = Promise.resolve("a&b");
 * const name = Promise.resolve("<Henry>");
 *
 * await renderAsync(<p title={title}>Hello {name}</p>);
 * // "<p title=\"a&amp;b\">Hello &lt;Henry&gt;</p>"
 * ```
 *
 * @packageDocumentation
 */
import {
	attributeAliases,
	booleanAttributes,
	invalidAttributeNameCodes,
	invalidStylePropertyNameCodes,
	unitlessStyleProperties,
	voidTags,
} from "./elements.js";
import { HTML, JSXNode } from "./node.js";
import type { Child, ElementType, Props, PropsWithChildren } from "./types.js";

export { HTML, JSXNode } from "./node.js";
export type {
	AttributeValue,
	Child,
	Component,
	CSSProperties,
	ElementType,
	HTMLAttributes,
	JSX,
	MaybePromise,
	Props,
	PropsWithChildren,
} from "./types.js";

const asyncRenderError = "simplejsx: render() encountered async content. Use renderAsync() instead.";

type HeadRoot = {
	head: null | {
		attributes: string;
		children: string;
		marker: string;
	};
	hoisted: string[];
};

type RenderContext = {
	root: HeadRoot;
	parentTag?: string;
};

/** JSX runtime entry used by TypeScript; prefer JSX syntax over calling this directly. */
export function jsx(type: ElementType, props: Props | null, _key?: unknown): JSXNode {
	return new JSXNode(type, props ? { ...props } : {});
}

/** JSX runtime entry used by TypeScript for elements with multiple children. */
export const jsxs: typeof jsx = jsx;

/** Development JSX runtime entry used by TypeScript-compatible compilers. */
export function jsxDEV(
	type: ElementType,
	props: Props | null,
	key?: unknown,
	_isStaticChildren?: boolean,
	_source?: unknown,
	_self?: unknown,
): JSXNode {
	return jsx(type, props, key);
}

/**
 * Groups JSX children without adding a wrapper element.
 *
 * @example
 * ```tsx
 * render(<><p>one</p><p>two</p></>);
 * // "<p>one</p><p>two</p>"
 * ```
 */
export function Fragment({ children }: PropsWithChildren): Child {
	return children;
}

/**
 * Marks trusted markup as already-safe HTML.
 *
 * Use this only for HTML you control; plain strings are escaped by default.
 *
 * @example
 * ```tsx
 * render(<div>{unsafeHTML("<strong>trusted</strong>")}</div>);
 * // "<div><strong>trusted</strong></div>"
 * ```
 */
export function unsafeHTML(value: string): HTML {
	return HTML.from(value);
}

/**
 * Renders JSX to an HTML string synchronously.
 *
 * Throws if it encounters async content so Promises are never silently skipped.
 *
 * @example
 * ```tsx
 * render(<p>Hello {"<Henry>"}</p>);
 * // "<p>Hello &lt;Henry&gt;</p>"
 * ```
 */
export function render(value: Child): string {
	const root: HeadRoot = { head: null, hoisted: [] };
	return renderHead(root, renderChildSync(value, { root }));
}

/**
 * Renders JSX to an HTML string and awaits async content.
 *
 * Use this for async components, promise children, or promise attributes.
 *
 * @example
 * ```tsx
 * const title = Promise.resolve("a&b");
 * const message = Promise.resolve("Hello <Henry>");
 *
 * await renderAsync(<p title={title}>{message}</p>);
 * // "<p title=\"a&amp;b\">Hello &lt;Henry&gt;</p>"
 * ```
 */
export async function renderAsync(value: Child): Promise<string> {
	const root: HeadRoot = { head: null, hoisted: [] };
	return renderHead(root, await renderChildAsync(value, { root }));
}

export function escapeHTML(value: string): string {
	return value.replace(/[&<>"']/g, (character) => {
		switch (character) {
			case "&":
				return "&amp;";
			case "<":
				return "&lt;";
			case ">":
				return "&gt;";
			case '"':
				return "&quot;";
			case "'":
				return "&#39;";
			default:
				return character;
		}
	});
}

function renderChildSync(value: Child, context: RenderContext): string {
	if (value === null || value === undefined || typeof value === "boolean") return "";
	if (typeof value === "string") return escapeHTML(value);
	if (typeof value === "number" || typeof value === "bigint") return String(value);
	if (value instanceof HTML) return value.toString();
	if (isPromiseLike(value)) throw new Error(asyncRenderError);

	if (value instanceof JSXNode) {
		if (typeof value.type === "function") {
			const result = value.type(value.props);
			if (isPromiseLike(result)) throw new Error(asyncRenderError);
			return renderChildSync(result, context);
		}
		return renderElementSync(value.type, value.props, context);
	}

	if (isIterable(value)) {
		let html = "";
		for (const child of value) html += renderChildSync(child, context);
		return html;
	}

	throw new TypeError(`simplejsx: cannot render ${typeof value} as a child.`);
}

async function renderChildAsync(value: Child, context: RenderContext): Promise<string> {
	if (isPromiseLike(value)) return renderChildAsync((await value) as Child, context);
	if (value === null || value === undefined || typeof value === "boolean") return "";
	if (typeof value === "string") return escapeHTML(value);
	if (typeof value === "number" || typeof value === "bigint") return String(value);
	if (value instanceof HTML) return value.toString();

	if (value instanceof JSXNode) {
		if (typeof value.type === "function") return renderChildAsync(value.type(value.props), context);
		return renderElementAsync(value.type, value.props, context);
	}

	if (isIterable(value)) {
		let html = "";
		for (const child of value) html += await renderChildAsync(child, context);
		return html;
	}

	throw new TypeError(`simplejsx: cannot render ${typeof value} as a child.`);
}

function renderElementSync(tag: string, props: Props, context: RenderContext): string {
	if (!tag || tag.startsWith("!") || tag.startsWith("?") || hasInvalidAttributeNameCharacter(tag)) {
		throw new Error(`simplejsx: invalid JSX tag name \`${tag}\`.`);
	}

	const lowerTag = tag.toLowerCase();
	let attributes = "";
	for (const [key, value] of Object.entries(props)) {
		const name = normalizeAttributeName(key);
		if (!name || value === null || value === undefined) continue;
		if (isPromiseLike(value)) throw new Error(asyncRenderError);
		attributes += renderAttribute(name, value);
	}

	const children = props.children;
	const nextContext = { ...context, parentTag: lowerTag };
	if (lowerTag === "head") {
		const childHTML = renderChildSync(children, nextContext);
		if (!context.root.head && (!context.parentTag || context.parentTag === "html")) {
			context.root.head = { attributes, children: childHTML, marker: "<!--simplejsx-head-->" };
			return context.root.head.marker;
		}
		context.root.hoisted.push(childHTML);
		return "";
	}

	const html = `<${tag}${attributes}`;
	if (!voidTags.has(lowerTag)) return `${html}>${renderChildSync(children, nextContext)}</${tag}>`;

	if (renderChildSync(children, nextContext))
		throw new Error(`simplejsx: void element <${tag}> cannot have children.`);
	return `${html}>`;
}

async function renderElementAsync(tag: string, props: Props, context: RenderContext): Promise<string> {
	if (!tag || tag.startsWith("!") || tag.startsWith("?") || hasInvalidAttributeNameCharacter(tag)) {
		throw new Error(`simplejsx: invalid JSX tag name \`${tag}\`.`);
	}

	const lowerTag = tag.toLowerCase();
	let attributes = "";
	for (const [key, value] of Object.entries(props)) {
		const name = normalizeAttributeName(key);
		if (!name || value === null || value === undefined) continue;
		attributes += renderAttribute(name, isPromiseLike(value) ? await value : value);
	}

	const children = props.children;
	const nextContext = { ...context, parentTag: lowerTag };
	if (lowerTag === "head") {
		const childHTML = await renderChildAsync(children, nextContext);
		if (!context.root.head && (!context.parentTag || context.parentTag === "html")) {
			context.root.head = { attributes, children: childHTML, marker: "<!--simplejsx-head-->" };
			return context.root.head.marker;
		}
		context.root.hoisted.push(childHTML);
		return "";
	}

	const html = `<${tag}${attributes}`;
	if (!voidTags.has(lowerTag)) return `${html}>${await renderChildAsync(children, nextContext)}</${tag}>`;

	if (await renderChildAsync(children, nextContext))
		throw new Error(`simplejsx: void element <${tag}> cannot have children.`);
	return `${html}>`;
}

function renderHead(root: HeadRoot, html: string): string {
	if (root.head) {
		return html.replace(
			root.head.marker,
			`<head${root.head.attributes}>${root.head.children}${root.hoisted.join("")}</head>`,
		);
	}

	if (!root.hoisted.length) return html;

	const head = `<head>${root.hoisted.join("")}</head>`;
	const bodyIndex = html.search(/<body(?:\s|>)/i);
	if (bodyIndex !== -1) return `${html.slice(0, bodyIndex)}${head}${html.slice(bodyIndex)}`;

	const htmlTag = html.match(/^<html(?:\s[^>]*)?>/i)?.[0];
	return htmlTag ? `${htmlTag}${head}${html.slice(htmlTag.length)}` : `${head}${html}`;
}

function renderAttribute(name: string, value: unknown): string {
	if (name === "style" && typeof value === "object" && value !== null && !(value instanceof HTML)) {
		return ` style="${escapeHTML(serializeStyle(value as Record<string, unknown>))}"`;
	}

	if (typeof value === "boolean") {
		if (booleanAttributes.has(name)) return value ? ` ${name}` : "";
		return ` ${name}="${value}"`;
	}

	if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") {
		return ` ${name}="${escapeHTML(String(value))}"`;
	}

	if (value instanceof HTML) return ` ${name}="${escapeHTML(value.toString())}"`;

	if (typeof value === "function") {
		if (name.startsWith("on") || name === "ref") return "";
		throw new TypeError(`simplejsx: cannot render function prop \`${name}\`.`);
	}

	throw new TypeError(`simplejsx: cannot render ${typeof value} prop \`${name}\`.`);
}

function normalizeAttributeName(key: string): string | null {
	if (key === "children" || key === "key") return null;
	const name = attributeAliases.get(key) ?? key;
	return name && !hasInvalidAttributeNameCharacter(name) ? name : null;
}

function serializeStyle(style: Record<string, unknown>): string {
	let css = "";
	for (const [rawName, rawValue] of Object.entries(style)) {
		if (rawValue === null || rawValue === undefined) continue;

		const name = rawName.startsWith("--")
			? rawName
			: rawName.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
		let validName = !!name;
		for (let index = 0; index < name.length; index++) {
			const code = name.charCodeAt(index);
			if (code <= 0x1f || (code >= 0x7f && code <= 0x9f) || invalidStylePropertyNameCodes.has(code)) {
				validName = false;
				break;
			}
		}
		if (!validName) continue;

		let value: string | null = null;
		if (typeof rawValue === "string") value = rawValue;
		if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
			value =
				rawValue === 0 || name.startsWith("--") || unitlessStyleProperties.has(name)
					? `${rawValue}`
					: `${rawValue}px`;
		}
		if (value !== null) css += `${name}:${value};`;
	}
	return css;
}

function hasInvalidAttributeNameCharacter(name: string): boolean {
	for (let index = 0; index < name.length; index++) {
		const code = name.charCodeAt(index);
		if (code <= 0x1f || (code >= 0x7f && code <= 0x9f) || invalidAttributeNameCodes.has(code)) return true;
	}
	return false;
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
	return (
		(typeof value === "object" || typeof value === "function") &&
		value !== null &&
		"then" in value &&
		typeof value.then === "function"
	);
}

function isIterable(value: unknown): value is Iterable<Child> {
	return typeof value === "object" && value !== null && Symbol.iterator in value;
}
