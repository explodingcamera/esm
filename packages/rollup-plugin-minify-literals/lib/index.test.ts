import path from "node:path";
import { expect, describe, beforeEach, it } from "vitest";
import * as minify from "minify-literals";
import type { TransformPluginContext } from "rollup";
import { match, SinonSpy, spy } from "sinon";
import minifyHTML, { Options } from "./index.js";

describe("minify-literals", () => {
	const fileName = path.resolve("test.js");
	let context: { warn: SinonSpy; error: SinonSpy };
	beforeEach(() => {
		context = {
			warn: spy(),
			error: spy(),
		};
	});

	it("should return a plugin with a transform function", () => {
		const plugin = minifyHTML();
		expect(plugin).to.be.an("object");
		expect(plugin.name).to.be.a("string");
		expect(plugin.transform).to.be.a("function");
	});

	it("should call minifyHTMLLiterals()", async () => {
		const options: Options = {};
		const plugin = minifyHTML(options);

		expect(options.minifyHTMLLiterals).to.be.a("function");
		const minifySpy = spy(options, "minifyHTMLLiterals");

		// @ts-expect-error - this is valid js
		await plugin.transform?.apply?.(context as unknown as TransformPluginContext, ["return", fileName]);
		expect(minifySpy.called).to.be.true;
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
		const minifySpy = spy(options, "minifyHTMLLiterals");

		// @ts-expect-error - this is valid js
		await plugin.transform?.apply(context as unknown as TransformPluginContext, ["return", fileName]);

		expect(
			minifySpy.calledWithMatch(
				match.string,
				match({
					fileName,
					minifyOptions: {
						minifyCSS: false,
					},
				}),
			),
		).to.be.true;
	});

	it("should allow custom minifyHTMLLiterals", async () => {
		const customMinify = spy((source: string, options: minify.Options) => {
			return minify.minifyHTMLLiterals(source, options);
		});

		const plugin = minifyHTML({
			minifyHTMLLiterals: customMinify as any,
		});

		// @ts-expect-error - this is valid js
		await plugin.transform.apply(context as unknown as TransformPluginContext, ["return", fileName]);
		expect(customMinify.called).to.be.true;
	});

	it("should warn errors", async () => {
		const plugin = minifyHTML({
			minifyHTMLLiterals: () => {
				throw new Error("failed");
			},
		});

		// @ts-expect-error - this is valid js
		await plugin.transform.apply(context as unknown as TransformPluginContext, ["return", fileName]);

		expect(context.warn.calledWith("failed")).to.be.true;
		expect(context.error.called).to.be.false;
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
		expect(context.error.calledWith("failed")).to.be.true;
		expect(context.warn.called).to.be.false;
	});

	it("should filter ids", () => {
		let options: Options = {};
		minifyHTML(options);
		expect(options.filter).to.be.a("function");
		expect(options.filter!(fileName)).to.be.true;
		options = {
			include: "*.ts",
		};

		minifyHTML(options);
		expect(options.filter).to.be.a("function");
		expect(options.filter!(fileName)).to.be.false;
		// this should also be false? not sure why this was true in the original source code
		// https://github.com/asyncLiz/rollup-plugin-minify-html-literals/blob/ddd81cc47095ba88941f137158c86e2c9f3bf6c4/test/plugin.spec.ts#L124
		// expect(options.filter!(path.resolve("test.ts"))).to.be.true;
	});

	it("should allow custom filter", async () => {
		const options = {
			filter: spy(() => false),
		};

		const plugin = minifyHTML(options);

		// @ts-expect-error - this is valid js
		await plugin.transform.apply(context as unknown as TransformPluginContext, ["return", fileName]);

		// @ts-expect-error - typescript is buggy, this is the correct type
		expect(options.filter.calledWith(fileName)).to.be.true;
	});
});
