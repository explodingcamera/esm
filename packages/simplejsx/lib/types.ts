import type { Properties, PropertiesHyphen } from "csstype";
import type { HTML, JSXNode } from "./node.js";

export type MaybePromise<T> = T | Promise<T>;

export type CSSProperties = Properties<string | number> &
	PropertiesHyphen<string | number> & {
		[property: `--${string}`]: string | number | null | undefined;
	};

type ChildValue = HTML | JSXNode | string | number | bigint | boolean | null | undefined | Iterable<Child>;

export type Child = ChildValue | Promise<ChildValue>;
export type Props = Record<string, unknown> & {
	children?: Child;
};
export type Component<ComponentProps = Record<string, unknown>> = (props: ComponentProps) => Child;
export type PropsWithChildren<ComponentProps = Record<string, unknown>> = ComponentProps & {
	children?: Child;
};
export type ElementType<ComponentProps = Record<string, unknown>> = string | Component<ComponentProps>;
export type AttributeValue = string | number | bigint | boolean | null | undefined;

/**
 * Global attributes available on all elements.
 *
 * Common camelCase aliases (className, htmlFor, etc.) are included for
 * React/Preact familiarity. The renderer maps them to their HTML equivalents.
 */
export type HTMLAttributes = {
	children?: Child;
	class?: MaybePromise<string | null | undefined>;
	id?: MaybePromise<string | null | undefined>;
	style?: string | CSSProperties | null | undefined;
	[attribute: `aria-${string}`]: MaybePromise<AttributeValue>;
	[attribute: `data-${string}`]: MaybePromise<AttributeValue>;
	[attribute: string]: unknown;
};

/**
 * Derives element-specific attributes from a DOM element interface.
 *
 * Filters out inherited base properties and methods, keeping DOM property
 * names as-is (camelCase). The renderer handles conversion to HTML attributes.
 */
type ElementSpecific<T, Base> = {
	[K in keyof T as K extends keyof Base
		? never
		: T[K] extends (...args: any[]) => any
			? never
			: K extends string
				? K
				: never]?: MaybePromise<AttributeValue>;
};

export namespace JSX {
	export type Element = JSXNode;
	export type ElementType = keyof IntrinsicElements | Component<any>;

	export interface ElementChildrenAttribute {
		children: Child;
	}

	export type IntrinsicAttributes = {};

	type HTMLIntrinsicElements = {
		[Tag in keyof HTMLElementTagNameMap]: HTMLAttributes &
			ElementSpecific<HTMLElementTagNameMap[Tag], HTMLElement>;
	};

	type SVGIntrinsicElements = {
		[Tag in keyof SVGElementTagNameMap as Tag extends keyof HTMLElementTagNameMap
			? never
			: Tag]: HTMLAttributes & ElementSpecific<SVGElementTagNameMap[Tag], SVGElement>;
	};

	export interface IntrinsicElements extends HTMLIntrinsicElements, SVGIntrinsicElements {
		[tagName: string]: HTMLAttributes;
	}
}
