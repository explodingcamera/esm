/**
 * Minimal JSX templating for safe HTML strings.
 *
 * `microjsx` renders JSX to escaped HTML strings. It works well for
 * server-side templates, static sites, emails, and other places where a string
 * is the whole output. This is not a React replacement and does not handle
 * browser interactivity.
 *
 * @remarks
 * ## Setup
 *
 * Use the automatic JSX runtime. In TypeScript projects, put this in `tsconfig.json`:
 *
 * ```json
 * {
 * 	"compilerOptions": {
 * 		"jsx": "react-jsx",
 * 		"jsxImportSource": "microjsx"
 * 	}
 * }
 * ```
 *
 * In Deno, use `"jsxImportSource": "npm:microjsx"` unless an import map points
 * `microjsx` at the package.
 *
 * ## Render HTML
 *
 * ```tsx
 * import { render, type PropsWithChildren } from "microjsx";
 *
 * function Layout({ children }: PropsWithChildren) {
 * 	return <main>{children}</main>;
 * }
 *
 * render(<Layout>Hello {"<Henry>"}</Layout>);
 * // "<main>Hello &lt;Henry&gt;</main>"
 * ```
 *
 * ## Rendering Rules
 *
 * ### Escaping
 *
 * Text and attributes are escaped by default. `null`, `undefined`, and booleans
 * render nothing. Arrays and other iterables render their children in order.
 * Use {@link unsafeHTML} only for trusted markup that should be inserted as-is.
 *
 * ### Styles
 *
 * `style` accepts a CSS string or an object. Object styles accept camelCase,
 * hyphenated names, and custom properties. Finite numeric values get `px`.
 * The exceptions are `0`, custom properties, and known unitless properties.
 *
 * ### Element middleware
 *
 * Pass `element` to {@link render} or {@link renderAsync} to inspect or change
 * intrinsic element props before they are written. Mutate `props` or return a
 * replacement props object. Async middleware is supported by {@link renderAsync}.
 *
 * ```tsx
 * render(<a href="/docs">Docs</a>, {
 * 	element({ tag, props }) {
 * 		if (tag === "a") props["rel"] = "noreferrer";
 * 	},
 * });
 * ```
 *
 * ### Head hoisting
 *
 * All `<head>` elements are merged into one top-level `<head>`. Page components
 * can set titles and metadata. A layout can still own the document shell.
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
 * import { renderAsync } from "microjsx";
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
import type { Child, ElementType, MaybePromise, Props, PropsWithChildren } from "./types.js";

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

const asyncRenderError = "microjsx: render() encountered async content. Use renderAsync() instead.";

export type ElementMiddlewareArgs = {
	tag: string;
	props: Props;
};

type ElementMiddlewareReplacement = (
	element: ElementMiddlewareArgs,
) => MaybePromise<Props | null | undefined>;
type ElementMiddlewareMutation = (element: ElementMiddlewareArgs) => MaybePromise<void>;

/** Runs before an intrinsic element is serialized. */
export type ElementMiddleware = ElementMiddlewareReplacement | ElementMiddlewareMutation;

export type RenderOptions = {
	/** Runs before each intrinsic element is serialized. */
	element?: ElementMiddleware | readonly (ElementMiddleware | readonly ElementMiddleware[])[];
};

type HeadRoot = {
	headAttributes?: string;
	headChildren: string[];
};

type RenderContext = {
	root: HeadRoot;
	elementMiddleware: readonly ElementMiddleware[];
	parentTag?: string;
};

/** JSX runtime entry used by TypeScript. Prefer JSX syntax over calling this directly. */
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
 * Use this only for HTML you control. Plain strings are escaped by default.
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
export function render(value: Child, options?: RenderOptions): string {
	const root: HeadRoot = { headChildren: [] };
	const elementMiddleware: readonly ElementMiddleware[] = options?.element
		? Array.isArray(options.element)
			? options.element.flat()
			: [options.element]
		: [];
	return renderHead(root, renderChildSync(value, { root, elementMiddleware }));
}

/**
 * Renders JSX to an HTML string and awaits async content.
 *
 * Use this for async components, promise children, promise attributes, or async
 * element middleware.
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
export async function renderAsync(value: Child, options?: RenderOptions): Promise<string> {
	const root: HeadRoot = { headChildren: [] };
	const elementMiddleware: readonly ElementMiddleware[] = options?.element
		? Array.isArray(options.element)
			? options.element.flat()
			: [options.element]
		: [];
	return renderHead(root, await renderChildAsync(value, { root, elementMiddleware }));
}

/** Escapes HTML-sensitive characters: `&`, `<`, `>`, `"`, and `'`. */
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

	throw new TypeError(`microjsx: cannot render ${typeof value} as a child.`);
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

	throw new TypeError(`microjsx: cannot render ${typeof value} as a child.`);
}

function renderElementSync(tag: string, props: Props, context: RenderContext): string {
	if (!tag || tag.startsWith("!") || tag.startsWith("?") || hasInvalidAttributeNameCharacter(tag)) {
		throw new Error(`microjsx: invalid JSX tag name \`${tag}\`.`);
	}

	props = applyElementMiddlewareSync(tag, props, context);
	const lowerTag = tag.toLowerCase();
	const attributes = renderAttributesSync(props);

	const children = props.children;
	const nextContext = { ...context, parentTag: lowerTag };
	if (lowerTag === "head") {
		return collectHead(context, attributes, renderChildSync(children, nextContext));
	}

	const html = `<${tag}${attributes}`;
	if (!voidTags.has(lowerTag)) return `${html}>${renderChildSync(children, nextContext)}</${tag}>`;

	if (renderChildSync(children, nextContext))
		throw new Error(`microjsx: void element <${tag}> cannot have children.`);
	return `${html}>`;
}

async function renderElementAsync(tag: string, props: Props, context: RenderContext): Promise<string> {
	if (!tag || tag.startsWith("!") || tag.startsWith("?") || hasInvalidAttributeNameCharacter(tag)) {
		throw new Error(`microjsx: invalid JSX tag name \`${tag}\`.`);
	}

	props = await applyElementMiddlewareAsync(tag, props, context);
	const lowerTag = tag.toLowerCase();
	const attributes = await renderAttributesAsync(props);

	const children = props.children;
	const nextContext = { ...context, parentTag: lowerTag };
	if (lowerTag === "head") {
		return collectHead(context, attributes, await renderChildAsync(children, nextContext));
	}

	const html = `<${tag}${attributes}`;
	if (!voidTags.has(lowerTag)) return `${html}>${await renderChildAsync(children, nextContext)}</${tag}>`;

	if (await renderChildAsync(children, nextContext))
		throw new Error(`microjsx: void element <${tag}> cannot have children.`);
	return `${html}>`;
}

function applyElementMiddlewareSync(tag: string, props: Props, context: RenderContext): Props {
	if (!context.elementMiddleware.length) return props;

	let nextProps = { ...props };
	for (const middleware of context.elementMiddleware) {
		const result = middleware({ tag, props: nextProps });
		if (isPromiseLike(result)) throw new Error(asyncRenderError);
		if (result !== null && result !== undefined) nextProps = result;
	}
	return nextProps;
}

async function applyElementMiddlewareAsync(
	tag: string,
	props: Props,
	context: RenderContext,
): Promise<Props> {
	if (!context.elementMiddleware.length) return props;

	let nextProps = { ...props };
	for (const middleware of context.elementMiddleware) {
		const result = middleware({ tag, props: nextProps });
		const resolved = isPromiseLike(result) ? await result : result;
		if (resolved !== null && resolved !== undefined) nextProps = resolved;
	}
	return nextProps;
}

function renderAttributesSync(props: Props): string {
	let attributes = "";
	for (const [key, value] of Object.entries(props)) {
		const name = normalizeAttributeName(key);
		if (!name || value === null || value === undefined) continue;
		if (isPromiseLike(value)) throw new Error(asyncRenderError);
		attributes += renderAttribute(name, value);
	}
	return attributes;
}

async function renderAttributesAsync(props: Props): Promise<string> {
	let attributes = "";
	for (const [key, value] of Object.entries(props)) {
		const name = normalizeAttributeName(key);
		if (!name || value === null || value === undefined) continue;
		const attributeValue = isPromiseLike(value) ? await value : value;
		if (attributeValue === null || attributeValue === undefined) continue;
		attributes += renderAttribute(name, attributeValue);
	}
	return attributes;
}

function collectHead(context: RenderContext, attributes: string, children: string): string {
	if (context.root.headAttributes === undefined && (!context.parentTag || context.parentTag === "html")) {
		context.root.headAttributes = attributes;
	}
	context.root.headChildren.push(children);
	return "";
}

function renderHead(root: HeadRoot, html: string): string {
	if (!root.headChildren.length) return html;

	// Head elements render out-of-band so page components can add metadata from anywhere in the tree.
	const head = `<head${root.headAttributes ?? ""}>${root.headChildren.join("")}</head>`;
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
		throw new TypeError(`microjsx: cannot render function prop \`${name}\`.`);
	}

	throw new TypeError(`microjsx: cannot render ${typeof value} prop \`${name}\`.`);
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
