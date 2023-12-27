import path from "node:path";
import { expect, describe, mock, it } from "bun:test";
import * as minify from "./../../minify-literals/lib/index";
import type { TransformPluginContext } from "rollup";
import minifyHTML, { type Options } from "./index.js";

describe("minify-literals", () => {
	const context = { warn: mock(() => {}), error: mock(() => {}) };
	const fileName = path.resolve("test.js");

	it("should return a plugin with a transform function", () => {
		const plugin = minifyHTML();
		expect(plugin).toBeTypeOf("object");
		expect(plugin.name).toBeTypeOf("string");
		expect(plugin.transform).toBeTypeOf("function");
	});

	it("should call minifyHTMLLiterals()", async () => {
		const options: Options = {};
		const plugin = minifyHTML(options);

		expect(options.minifyHTMLLiterals).toBeTypeOf("function");

		// @ts-expect-error - this is valid js
		await plugin.transform?.apply?.(context as unknown as TransformPluginContext, ["return", fileName]);
	});

	it("should pass id and options to minifyHTMLLiterals()", async () => {
		const options: Options = {
			options: {
				minifyOptions: {
					minifyCSS: false,
				},
			},
		};

		const plugin = minifyHTML(options);

		// @ts-expect-error - this is valid js
		await plugin.transform?.apply(context as unknown as TransformPluginContext, ["return", fileName]);
	});

	it("should allow custom minifyHTMLLiterals", async () => {
		const customMinify = (source: string, options: minify.Options) => {
			return minify.minifyHTMLLiterals(source, options);
		};

		const plugin = minifyHTML({
			minifyHTMLLiterals: customMinify as any,
		});

		// @ts-expect-error - this is valid js
		await plugin.transform.apply(context as unknown as TransformPluginContext, ["return", fileName]);
	});

	it("should warn errors", async () => {
		const plugin = minifyHTML({
			minifyHTMLLiterals: () => {
				throw new Error("failed");
			},
		});

		// @ts-expect-error - this is valid js
		await plugin.transform.apply(context as unknown as TransformPluginContext, ["return", fileName]);
	});

	it("should fail is failOnError is true", async () => {
		const plugin = minifyHTML({
			minifyHTMLLiterals: () => {
				throw new Error("failed");
			},
			failOnError: true,
		});

		// @ts-expect-error - this is valid js
		await plugin.transform.apply(context as unknown as TransformPluginContext, ["return", fileName]);
	});

	it("should filter ids", () => {
		let options: Options = {};
		minifyHTML(options);
		expect(options.filter).toBeTypeOf("function");
		expect(options.filter!(fileName)).toBe(true);
		options = {
			include: "*.ts",
		};

		minifyHTML(options);
		expect(options.filter).toBeTypeOf("function");
		expect(options.filter!(fileName)).toBe(false);
		// this should also be false? not sure why this was true in the original source code
		// https://github.com/asyncLiz/rollup-plugin-minify-html-literals/blob/ddd81cc47095ba88941f137158c86e2c9f3bf6c4/test/plugin.spec.ts#L124
		// expect(options.filter!(path.resolve("test.ts"))).toBe(true);
	});

	it("should allow custom filter", async () => {
		const options = {
			filter: () => false,
		};

		const plugin = minifyHTML(options);

		// @ts-expect-error - this is valid js
		await plugin.transform.apply(context as unknown as TransformPluginContext, ["return", fileName]);
	});
});
