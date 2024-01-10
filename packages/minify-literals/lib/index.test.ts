import { afterEach, beforeEach, describe, expect, it, test } from "bun:test";

import MagicString, { type SourceMapOptions } from "magic-string";
import { type ParseLiteralsOptions, type Template, type TemplatePart, parseLiterals } from "parse-literals";
import {
	type SourceMap,
	defaultGenerateSourceMap,
	defaultShouldMinify,
	defaultShouldMinifyCSS,
	defaultValidation,
	minifyHTMLLiterals,
} from "./";
import { defaultMinifyOptions, defaultStrategy } from "./strategy";

// https://github.com/explodingcamera/esm/issues/1
describe("handle key value pairs correctly", () => {
	it("should minify html", async () => {
		const source = `const css = css\`:host{\${"color"}: \${"red"}}\``;
		expect((await minifyHTMLLiterals(source))?.code).toMatch('const css = css`:host{${"color"}:${"red"}}`');
	});
});

// Comments https://github.com/asyncLiz/minify-html-literals/issues/49
describe("handle comments correctly", () => {
	it("should remove comments", async () => {
		const source = `const el = html\`<div><!-- comment --></div>\``;
		const expected = `const el = html\`<div></div>\``;
		expect((await minifyHTMLLiterals(source))?.code).toBe(expected);
	});

	it("templates inside of html comments are not minified", async () => {
		const source = `const el = html\`<div><!-- \${console.log(1)} --></div>\``;
		expect(await minifyHTMLLiterals(source)).toBe(null);
	});

	it("comments inside of literals are not removed", async () => {
		const source = `const el = html\`<div>\${/*console.log(1)*/}</div>\``;
		expect(await minifyHTMLLiterals(source)).toBe(null);
	});
});

// https://github.com/asyncLiz/minify-html-literals/issues/46
// currently, we skip the entire file if we find a template literal that uses unsafeCSS / unsafeHTML.
// instead, we should ideally just skip the template literal (but we need to update parse-literals for that)
describe("don't minify code with unsafeCSS / unsafeHTML", () => {
	it("should not remove styles from dynamically inserted selectors", async () => {
		const source = `
			css\`
				foo {
					bar: baz;
				}

				\${unsafeCSS('#foo-id')} {
					bar: baz;
				}
			\`
		`.trim();

		expect(await minifyHTMLLiterals(source)).toBe(null);
	});
});

// https://github.com/asyncLiz/minify-html-literals/issues/37
describe("minify templates with static tag literals", () => {
	it("should minify html", async () => {
		const STATIC_LITERAL_IN_TAG_NAME = `
			html\`<\${Component.litTagName} id="container">
					<span>Some content here</span>
				</\${Component.litTagName}>
				\`
		`.trim();

		const expected = `html\`<\${Component.litTagName} id="container"><span>Some content here</span></\${Component.litTagName}>\``;

		expect((await minifyHTMLLiterals(STATIC_LITERAL_IN_TAG_NAME))?.code).toBe(expected);
	});
});

test("example", async () => {
	const source = `
		const el = html\`<div > <h1>  Hello World  </h1 > </div>\`;
		const css = css\` .foo { color: red; }  \`;
	`;

	expect(await minifyHTMLLiterals(source)).toMatchSnapshot();
});

class MagicStringLike {
	generateMap(options?: Partial<SourceMapOptions>): SourceMap {
		return {
			version: 3,
			file: options?.file || null,
			sources: [options?.source || null],
			sourcesContent: [],
			names: [],
			mappings: "",
			toString() {
				return "";
			},
			toUrl() {
				return "";
			},
		};
	}

	overwrite(_start: number, _end: number, _content: string): any {
		// noop
	}

	toString(): string {
		return "";
	}
}

describe("minifyHTMLLiterals()", () => {
	const SOURCE = `
    function render(title, items, styles) {
      return html\`
        <style>
          \${styles}
        </style>
        <h1 class="heading">\${title}</h1>
        <button onclick="\${() => eventHandler()}"></button>
        <ul>
          \${items.map(item => {
            return getHTML()\`
              <li>\${item}</li>
            \`;
          })}
        </ul>
      \`;
    }

    function noMinify() {
      return \`
        <div>Not tagged html</div>
      \`;
    }

    function taggednoMinify(extra) {
      return other\`
        <style>
          .heading {
            font-size: 24px;
          }

          \${extra}
        </style>
      \`;
    }

    function taggedCSSMinify(extra) {
      return css\`
        .heading {
          font-size: 24px;
        }

        \${extra}
      \`;
    }

    function cssProperty(property) {
      const width = '20px';
      return css\`
        .foo {
          font-size: 1rem;
          width: \${width};
          color: \${property};
        }
      \`;
    }
  `;

	const SOURCE_MIN = `
    function render(title, items, styles) {
      return html\`<style>\${styles}</style><h1 class="heading">\${title}</h1><button onclick="\${() => eventHandler()}"></button><ul>\${items.map(item => {
            return getHTML()\`<li>\${item}</li>\`;
          })}</ul>\`;
    }

    function noMinify() {
      return \`
        <div>Not tagged html</div>
      \`;
    }

    function taggednoMinify(extra) {
      return other\`
        <style>
          .heading {
            font-size: 24px;
          }

          \${extra}
        </style>
      \`;
    }

    function taggedCSSMinify(extra) {
      return css\`.heading{font-size:24px}\${extra}\`;
    }

    function cssProperty(property) {
      const width = '20px';
      return css\`.foo{font-size:1rem;width:\${width};color:\${property}}\`;
    }
  `;

	const SVG_SOURCE = `
    function taggedSVGMinify() {
      return svg\`
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
          <path d="M6 19h12v2H6z" />
          <path d="M0 0h24v24H0V0z" fill="none" />
        </svg>
      \`;
    }
  `;

	const SVG_SOURCE_MIN = `
    function taggedSVGMinify() {
      return svg\`<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M6 19h12v2H6z"/><path d="M0 0h24v24H0V0z" fill="none"/></svg>\`;
    }
  `;

	const COMMENT_SOURCE = `
    function minifyWithComment() {
      return html\`
        <div .icon=\${0/*JS Comment */}>
        </div>
      \`;
    }
  `;

	const COMMENT_SOURCE_MIN = `
    function minifyWithComment() {
      return html\`<div .icon="\${0/*JS Comment */}"></div>\`;
    }
  `;

	const SVG_MULTILINE_SOURCE = `
    function multiline() {
      return html\`
        <pre>
          Keep newlines

          within certain tags
        </pre>
        <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
          <path d="M6 19h12v2H6z" />
          <path d="M0
                   0h24v24H0V0z"
                fill="none" />
        </svg>
      \`;
    }
  `;

	const SVG_MULTILINE_SOURCE_MIN = `
    function multiline() {
      return html\`<pre>
          Keep newlines

          within certain tags
        </pre><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M6 19h12v2H6z"/><path d="M0                   0h24v24H0V0z" fill="none"/></svg>\`;
    }
  `;

	const SHADOW_PARTS_SOURCE = `
    function parts() {
      return css\`
        foo-bar::part(.space .separated) {
          color: red;
        }
      \`;
    }
  `;

	const SHADOW_PARTS_SOURCE_MIN = `
    function parts() {
      return css\`foo-bar::part(.space .separated){color:red}\`;
    }
  `;

	const MEMBER_EXPRESSION_LITERAL_SOURCE = `
    function nested() {
      return LitHtml.html\`<div id="container">
        <span>Some content here</span>
      </div>
      \`;
    }
  `;

	const MEMBER_EXPRESSION_LITERAL_SOURCE_MIN = `
    function nested() {
      return LitHtml.html\`<div id="container"><span>Some content here</span></div>\`;
    }
  `;

	it('should minify "html" and "css" tagged templates', async () => {
		const result = await minifyHTMLLiterals(SOURCE, { fileName: "test.js" });

		expect(result).toBeTypeOf("object");
		expect(result!.code).toEqual(SOURCE_MIN);
	});

	it('should minify "svg" tagged templates', async () => {
		const result = await minifyHTMLLiterals(SVG_SOURCE, { fileName: "test.js" });
		expect(result).toBeTypeOf("object");
		expect(result!.code).toEqual(SVG_SOURCE_MIN);
	});

	it("should minify html with attribute placeholders that have no quotes and JS comments", async () => {
		const result = await minifyHTMLLiterals(COMMENT_SOURCE, { fileName: "test.js" });
		expect(result).toBeTypeOf("object");
		expect(result!.code).toEqual(COMMENT_SOURCE_MIN);
	});

	it("should minify html tagged with a member expression ending in html", async () => {
		const result = await minifyHTMLLiterals(MEMBER_EXPRESSION_LITERAL_SOURCE, {
			fileName: "test.js",
		});
		expect(result).toBeTypeOf("object");
		expect(result!.code).toEqual(MEMBER_EXPRESSION_LITERAL_SOURCE_MIN);
	});

	it("should minify multiline svg elements", async () => {
		const result = await minifyHTMLLiterals(SVG_MULTILINE_SOURCE, {
			fileName: "test.js",
		});
		expect(result).toBeTypeOf("object");
		expect(result!.code).toEqual(SVG_MULTILINE_SOURCE_MIN);
	});

	it("should not remove spaces in ::part()", async () => {
		const result = await minifyHTMLLiterals(SHADOW_PARTS_SOURCE, {
			fileName: "test.js",
		});
		expect(result).toBeTypeOf("object");
		expect(result!.code).toEqual(SHADOW_PARTS_SOURCE_MIN);
	});

	it("should return null if source is already minified", async () => {
		const result = await minifyHTMLLiterals(SOURCE_MIN, { fileName: "test.js" });
		expect(result).toBeNull();
	});

	it("should return a v3 source map", async () => {
		const result = await minifyHTMLLiterals(SOURCE, { fileName: "test.js" });
		expect(result).toBeTypeOf("object");
		expect(result!.map).toBeTypeOf("object");
		expect(result!.map!.version).toEqual(3);
		expect(result!.map!.mappings).toBeTypeOf("string");
	});

	describe("options", () => {
		it("should use defaultMinifyOptions", () => {
			minifyHTMLLiterals(SOURCE, { fileName: "test.js" });
			const parts = parseLiterals(SOURCE)[1]!.parts;
			defaultStrategy.combineHTMLStrings(parts, defaultStrategy.getPlaceholder(parts));
		});

		it("should allow custom partial minifyOptions", async () => {
			const minifyOptions = { caseSensitive: false };
			await minifyHTMLLiterals(SOURCE, { fileName: "test.js", minifyOptions });
			const parts = parseLiterals(SOURCE)[1]!.parts;
			defaultStrategy.combineHTMLStrings(parts, defaultStrategy.getPlaceholder(parts));
		});

		it("should use MagicString constructor", async () => {
			let msUsed: MagicStringLike | undefined;
			await minifyHTMLLiterals(SOURCE, {
				fileName: "test.js",
				generateSourceMap(ms) {
					msUsed = ms;
					return undefined;
				},
			});

			expect(msUsed).toBeInstanceOf(MagicString);
		});

		it("should allow custom MagicStringLike constructor", async () => {
			let msUsed: MagicStringLike | undefined;
			await minifyHTMLLiterals(SOURCE, {
				fileName: "test.js",
				MagicString: MagicStringLike,
				generateSourceMap(ms) {
					msUsed = ms;
					return undefined;
				},
			});

			expect(msUsed).toBeInstanceOf(MagicStringLike);
		});

		it("should allow custom parseLiterals()", async () => {
			const customParseLiterals = (source: string, options?: ParseLiteralsOptions) => {
				return parseLiterals(source, options);
			};

			await minifyHTMLLiterals(SOURCE, {
				fileName: "test.js",
				parseLiterals: customParseLiterals,
			});
		});

		it("should allow custom shouldMinify()", async () => {
			const customShouldMinify = (template: Template) => {
				return defaultShouldMinify(template);
			};

			await minifyHTMLLiterals(SOURCE, {
				fileName: "test.js",
				shouldMinify: customShouldMinify,
			});
		});

		it("should use defaultValidation", () => {
			minifyHTMLLiterals(SOURCE, {
				fileName: "test.js",
				strategy: {
					getPlaceholder: () => {
						return ""; // cause an error
					},
					combineHTMLStrings: defaultStrategy.combineHTMLStrings,
					minifyHTML: defaultStrategy.minifyHTML,
					splitHTMLByPlaceholder: defaultStrategy.splitHTMLByPlaceholder,
				},
			});

			expect(async () => {
				await minifyHTMLLiterals(SOURCE, {
					fileName: "test.js",
					strategy: {
						getPlaceholder: defaultStrategy.getPlaceholder,
						combineHTMLStrings: defaultStrategy.combineHTMLStrings,
						minifyHTML: defaultStrategy.minifyHTML,
						splitHTMLByPlaceholder: () => {
							return []; // cause an error
						},
					},
				});
			}).toThrow();
		});

		it("should allow disabling validation", async () => {
			await minifyHTMLLiterals(SOURCE, {
				fileName: "test.js",
				strategy: {
					getPlaceholder: () => {
						return ""; // cause an error
					},
					combineHTMLStrings: defaultStrategy.combineHTMLStrings,
					minifyHTML: defaultStrategy.minifyHTML,
					splitHTMLByPlaceholder: defaultStrategy.splitHTMLByPlaceholder,
				},
				validate: false,
			});
		});

		it("should allow disabling generateSourceMap", async () => {
			const result = await minifyHTMLLiterals(SOURCE, {
				fileName: "test.js",
				generateSourceMap: false,
			});
			expect(result).toBeTypeOf("object");
			expect(result!.map).toBeUndefined();
		});
	});

	describe("defaultShouldMinify()", () => {
		it('should return true if the template is tagged with any "html" text', () => {
			expect(defaultShouldMinify({ tag: "html", parts: [] })).toBe(true);
			expect(defaultShouldMinify({ tag: "HTML", parts: [] })).toBe(true);
			expect(defaultShouldMinify({ tag: "hTML", parts: [] })).toBe(true);
			expect(defaultShouldMinify({ tag: "getHTML()", parts: [] })).toBe(true);
			expect(defaultShouldMinify({ tag: "templateHtml()", parts: [] })).toBe(true);
		});

		it('should return false if the template is not tagged or does not contain "html"', () => {
			expect(defaultShouldMinify({ parts: [] })).toBe(false);
			expect(defaultShouldMinify({ tag: "css", parts: [] })).toBe(false);
		});

		it('should return true if the template is tagged with any "svg" text', () => {
			expect(defaultShouldMinify({ tag: "svg", parts: [] })).toBe(true);
			expect(defaultShouldMinify({ tag: "SVG", parts: [] })).toBe(true);
			expect(defaultShouldMinify({ tag: "sVg", parts: [] })).toBe(true);
			expect(defaultShouldMinify({ tag: "getSVG()", parts: [] })).toBe(true);
			expect(defaultShouldMinify({ tag: "templateSvg()", parts: [] })).toBe(true);
		});
	});

	describe("defaultShouldMinifyCSS()", () => {
		it('should return true if the template is tagged with any "css" text', () => {
			expect(defaultShouldMinifyCSS({ tag: "css", parts: [] })).toBe(true);
			expect(defaultShouldMinifyCSS({ tag: "CSS", parts: [] })).toBe(true);
			expect(defaultShouldMinifyCSS({ tag: "csS", parts: [] })).toBe(true);
			expect(defaultShouldMinifyCSS({ tag: "getCSS()", parts: [] })).toBe(true);
			expect(defaultShouldMinifyCSS({ tag: "templateCss()", parts: [] })).toBe(true);
		});

		it('should return false if the template is not tagged or does not contain "css"', () => {
			expect(defaultShouldMinifyCSS({ parts: [] })).toBe(false);
			expect(defaultShouldMinifyCSS({ tag: "html", parts: [] })).toBe(false);
		});
	});

	describe("defaultValidation", () => {
		describe("ensurePlaceholderValid()", () => {
			it("should throw an error if the placeholder is not a string", () => {
				expect(() => {
					defaultValidation.ensurePlaceholderValid(undefined);
				}).toThrow();
				expect(() => {
					defaultValidation.ensurePlaceholderValid(true);
				}).toThrow();
				expect(() => {
					defaultValidation.ensurePlaceholderValid({});
				}).toThrow();
			});

			it("should throw an error if the placeholder is an empty string", () => {
				expect(() => {
					defaultValidation.ensurePlaceholderValid("");
				}).toThrow();
			});

			it("should not throw an error if the placeholder is a non-empty string", () => {
				defaultValidation.ensurePlaceholderValid("EXP");
			});
		});
	});
});
