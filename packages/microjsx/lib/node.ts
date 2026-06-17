import type { ElementType, Props } from "./types.js";

/** Branded wrapper so raw HTML has to be opted into with `unsafeHTML()`. */
export class HTML {
	readonly #value: string;

	private constructor(value: string) {
		this.#value = value;
	}

	static from(value: string): HTML {
		return new HTML(value);
	}

	toString(): string {
		return this.#value;
	}
}

/** Keeps JSX lazy so components and promises resolve during rendering. */
export class JSXNode {
	readonly type: ElementType;
	readonly props: Props;

	constructor(type: ElementType, props: Props) {
		this.type = type;
		this.props = props;
	}
}
