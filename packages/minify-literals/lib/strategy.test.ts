import { minify } from "html-minifier-terser";
import { defaultMinifyOptions, defaultStrategy } from "./strategy";
import type { TemplatePart } from "parse-literals";
import { describe, expect, it } from "bun:test";

describe("strategy", () => {
	describe("default", () => {
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
			it("should return a string with @ and () in it with no spaces", () => {
				const placeholder = defaultStrategy.getPlaceholder(parts);
				expect(placeholder.indexOf("@")).toEqual(0);
				expect(placeholder.includes("()")).toEqual(true);
			});

			it('should append "_" if placeholder exists in templates', () => {
				const regularPlaceholder = defaultStrategy.getPlaceholder(parts);
				const oneUnderscore = defaultStrategy.getPlaceholder([
					{ text: regularPlaceholder, start: 0, end: regularPlaceholder.length },
				]);

				expect(oneUnderscore).not.toEqual(regularPlaceholder);
				expect(oneUnderscore.includes("_")).toEqual(true);

				const twoUnderscores = defaultStrategy.getPlaceholder([
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

			it("should return a value that is preserved by html-minifier when splitting", async () => {
				const placeholder = defaultStrategy.getPlaceholder(parts);
				const minHtml = await defaultStrategy.minifyHTML(
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
				expect(defaultStrategy.splitHTMLByPlaceholder(minHtml, placeholder).length).toBe(9);
			});
		});

		describe("combineHTMLStrings()", () => {
			it("should join part texts by the placeholder", () => {
				const expected = "<h1>EXP</h1>";
				expect(defaultStrategy.combineHTMLStrings(parts, "EXP")).toEqual(expected);
			});
		});

		describe("minifyHTML()", () => {
			it("should call minify() with html and options", async () => {
				const placeholder = defaultStrategy.getPlaceholder(parts);
				const html = `
          <style>${placeholder}</style>
          <h1 class="heading">${placeholder}</h1>
          <ul>
            <li>${placeholder}</li>
          </ul>
        `;

				expect(await defaultStrategy.minifyHTML(html, defaultMinifyOptions)).toEqual(
					await minify(html, defaultMinifyOptions),
				);
			});
		});

		describe("splitHTMLByPlaceholder()", () => {
			it("should split string by the placeholder", () => {
				const expected = ["<h1>", "</h1>"];
				expect(defaultStrategy.splitHTMLByPlaceholder("<h1>EXP</h1>", "EXP")).toEqual(expected);
			});

			it("should handle if a placeholder is missing its semicolon", () => {
				const expected = ["<h1>", '</h1><button onclick="', '"></button>'];
				const html = `<h1>EXP;</h1><button onclick="EXP"></button>`;
				expect(defaultStrategy.splitHTMLByPlaceholder(html, "EXP;")).toEqual(expected);
			});
		});
	});
});
