import { describe, expect, it } from "bun:test";
import type { TemplatePart } from "parse-literals";
import {
	combineTemplateParts,
	defaultMinifyOptions,
	getPlaceholder,
	minifyHTML,
	splitByPlaceholder,
} from "./minify";

describe("minify helpers", () => {
	const parts: TemplatePart[] = [
		{
			text: "<h1>",
			start: 0,
			end: 4,
		},
		{
			text: "</h1>",
			start: 4,
			end: 5,
		},
	];

	describe("getPlaceholder()", () => {
		it("should return a string starting with @ with no spaces", () => {
			const placeholder = getPlaceholder(parts);
			expect(placeholder.indexOf("@")).toEqual(0);
			expect(placeholder.includes(" ")).toEqual(false);
		});

		it('should append "_" if placeholder exists in templates', () => {
			const regularPlaceholder = getPlaceholder(parts);
			const oneUnderscore = getPlaceholder([
				{ text: regularPlaceholder, start: 0, end: regularPlaceholder.length },
			]);

			expect(oneUnderscore).not.toEqual(regularPlaceholder);
			expect(oneUnderscore.includes("_")).toEqual(true);

			const twoUnderscores = getPlaceholder([
				{
					text: regularPlaceholder,
					start: 0,
					end: regularPlaceholder.length,
				},
				{
					text: oneUnderscore,
					start: regularPlaceholder.length,
					end: regularPlaceholder.length + oneUnderscore.length,
				},
			]);

			expect(twoUnderscores).not.toEqual(regularPlaceholder);
			expect(twoUnderscores).not.toEqual(oneUnderscore);
			expect(twoUnderscores.includes("_")).toEqual(true);
		});

		it("should return a value that is preserved by html-minifier-next when splitting", async () => {
			const placeholder = getPlaceholder(parts);
			const minHtml = await minifyHTML(
				`
          <style>
            ${placeholder}
            p {
              ${placeholder}
              color: ${placeholder}
            }
            div {
              width: ${placeholder}
            }
          </style>
          <p style="color: ${placeholder}">
            ${placeholder}
          </p>
          <div id="${placeholder}" class="with ${placeholder}"></div>
        `,
				defaultMinifyOptions,
			);

			// 8 placeholders, 9 parts
			expect(splitByPlaceholder(minHtml, placeholder).length).toBe(9);
		});
	});

	describe("combineTemplateParts()", () => {
		it("should join part texts by the placeholder", () => {
			const expected = "<h1>EXP</h1>";
			expect(combineTemplateParts(parts, "EXP")).toEqual(expected);
		});
	});

	describe("minifyHTML()", () => {
		it("should call minify() with html and options", async () => {
			const placeholder = getPlaceholder(parts);
			const html = `
          <style>${placeholder}</style>
          <h1 class="heading">${placeholder}</h1>
          <ul>
            <li>${placeholder}</li>
          </ul>
        `;

			expect(await minifyHTML(html, defaultMinifyOptions)).toEqual(
				`<style>${placeholder};</style><h1 class="heading">${placeholder}</h1><ul><li>${placeholder}</li></ul>`,
			);
		});
	});

	describe("splitByPlaceholder()", () => {
		it("should split string by the placeholder", () => {
			const expected = ["<h1>", "</h1>"];
			expect(splitByPlaceholder("<h1>EXP</h1>", "EXP")).toEqual(expected);
		});

		it("should split correctly", () => {
			const expected = ["<h1>", '</h1><button onclick="', '"></button>'];
			const html = `<h1>EXP</h1><button onclick="EXP"></button>`;
			expect(splitByPlaceholder(html, "EXP")).toEqual(expected);
		});
	});
});
