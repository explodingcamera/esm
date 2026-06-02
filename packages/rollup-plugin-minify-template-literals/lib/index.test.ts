import path from "node:path";
import { describe, expect, it, mock } from "bun:test";
import type { TransformPluginContext } from "rollup";
import { minifyTemplateLiterals } from "./index.js";

describe("minifyTemplateLiterals", () => {
	const fileName = path.resolve("test.js");

	it("should return a plugin with a transform function", () => {
		const plugin = minifyTemplateLiterals();
		expect(plugin).toBeTypeOf("object");
		expect(plugin.name).toBe("minify-template-literals");
		expect(plugin.transform).toBeTypeOf("function");
	});

	it("should minify matching files", async () => {
		const plugin = minifyTemplateLiterals();
		const result = await (plugin.transform as any).call(
			{ warn: mock(() => {}), error: mock(() => {}) } as unknown as TransformPluginContext,
			"const el = html`<div> test </div>`;",
			fileName,
		);

		expect(result).toEqual({
			code: "const el = html`<div>test</div>`;",
			map: expect.any(Object),
		});
	});

	it("should pass minify options", async () => {
		const plugin = minifyTemplateLiterals({
			minify: {
				css: false,
			},
		});
		const result = await (plugin.transform as any).call(
			{ warn: mock(() => {}), error: mock(() => {}) } as unknown as TransformPluginContext,
			"const styles = css`.foo { color: red; }`;",
			fileName,
		);

		expect(result).toBeNull();
	});

	it("should filter ids", async () => {
		const plugin = minifyTemplateLiterals({ include: "**/*.ts" });
		const result = await (plugin.transform as any).call(
			{ warn: mock(() => {}), error: mock(() => {}) } as unknown as TransformPluginContext,
			"const el = html`<div> test </div>`;",
			fileName,
		);

		expect(result).toBeNull();
	});

	it("should warn errors", async () => {
		const warn = mock(() => {});
		const error = mock(() => {});
		const plugin = minifyTemplateLiterals({
			minify: {
				html: () => {
					throw new Error("failed");
				},
			},
		});

		await (plugin.transform as any).call(
			{ warn, error } as unknown as TransformPluginContext,
			"const el = html`<div></div>`;",
			fileName,
		);

		expect(warn).toHaveBeenCalled();
		expect(error).not.toHaveBeenCalled();
	});
});
