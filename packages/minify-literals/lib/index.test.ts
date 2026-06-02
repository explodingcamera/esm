import { describe, expect, it, test } from "bun:test";

import { minifyHTMLLiterals } from "./";

// https://github.com/explodingcamera/esm/issues/1
describe("handle key value pairs correctly", () => {
	it("should minify html", async () => {
		const source = `const css = css\`:host{\${"color"}: \${"red"}}\``;
		const expected = `const css = css\`:host{\${"color"}:\${"red"}}\``;
		expect((await minifyHTMLLiterals(source))?.code).toMatch(expected);
	});
});

// https://github.com/explodingcamera/esm/issues/7
describe("handle inline style suffixes after expressions", () => {
	it("should preserve text after a template expression in an inline style", async () => {
		const source = `
    const o = 30;
    const el = html\`<div style="height:\${o}px;"> <h1>  Hello World  </h1 > </div>\`;
  `;

		expect((await minifyHTMLLiterals(source))?.code).toBe(`
    const o = 30;
    const el = html\`<div style="height:\${o}px"><h1>Hello World</h1></div>\`;
  `);
	});
});

// https://github.com/explodingcamera/esm/issues/5
describe("handle nested CSS", () => {
	it("should minify nested CSS templates", async () => {
		const source = `
    const styles = css\`
      .card {
        color: red;

        & .title {
          color: blue;
        }
      }
    \`;
  `;

		expect((await minifyHTMLLiterals(source))?.code).toBe(`
    const styles = css\`.card{color:red;& .title{color:#00f}}\`;
  `);
	});
});

describe("handle Lit-style web components", () => {
	it("should minify static styles and render templates", async () => {
		const source = `
    import { LitElement, css, html } from "lit";

    class MyElement extends LitElement {
      static styles = css\`
        :host {
          display: block;

			&[hidden] {
            display: none;
          }
        }
      \`;

      render() {
        const height = 30;
        return html\`<div style="height:\${height}px;"> <slot></slot> </div>\`;
      }
    }
  `;

		expect((await minifyHTMLLiterals(source))?.code).toBe(`
    import { LitElement, css, html } from "lit";

    class MyElement extends LitElement {
      static styles = css\`:host{display:block;&[hidden]{display:none}}\`;

      render() {
        const height = 30;
        return html\`<div style="height:\${height}px"><slot></slot></div>\`;
      }
    }
  `);
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
      return html\`<style>\${styles};</style><h1 class="heading">\${title}</h1><button onclick="\${() => eventHandler()}"></button><ul>\${items.map(item => {
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
      return css\`.heading{font-size:24px}\${extra};\`;
    }

    function cssProperty(property) {
      const width = '20px';
      return css\`.foo{width:\${width};color:\${property};font-size:1rem}\`;
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
      return html\`<div .icon=\${0/*JS Comment */}></div>\`;
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

          within certain tags</pre><svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M6 19h12v2H6z"/><path d="M0                   0h24v24H0V0z" fill="none"/></svg>\`;
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
      return css\`        foo-bar::part(.space .separated) {          color: red;        }      \`;
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
		it("should allow custom html options", async () => {
			const result = await minifyHTMLLiterals(`html\`<div class="foo"></div>\`;`, {
				html: { removeAttributeQuotes: true },
			});

			expect(result?.code).toBe(`html\`<div class=foo></div>\`;`);
		});

		it("should allow a custom HTML minifier", async () => {
			const result = await minifyHTMLLiterals(`html\`<div> test </div>\`;`, {
				html: () => "<custom></custom>",
			});

			expect(result?.code).toBe(`html\`<custom></custom>\`;`);
		});

		it("should allow disabling HTML minification", async () => {
			const result = await minifyHTMLLiterals(`html\`<div>  test  </div>\`;css\`.foo { color: red; }\`;`, {
				html: false,
			});

			expect(result?.code).toBe(`html\`<div>  test  </div>\`;css\`.foo{color:red}\`;`);
		});

		it("should allow disabling CSS minification", async () => {
			const result = await minifyHTMLLiterals(
				`html\`<div> hi </div><style>.foo { color: red; }</style>\`;css\`.foo { color: red; }\`;`,
				{
					css: false,
				},
			);

			expect(result?.code).toBe(
				`html\`<div>hi</div><style>.foo { color: red; }</style>\`;css\`.foo { color: red; }\`;`,
			);
		});

		it("should allow a custom CSS minifier", async () => {
			const result = await minifyHTMLLiterals(`css\`.foo { color: red; }\`;`, {
				css: () => ".custom{}",
			});

			expect(result?.code).toBe(`css\`.custom{}\`;`);
		});

		it("should minify style and styled templates by default", async () => {
			const result = await minifyHTMLLiterals(`style\`.foo { color: red; }\`;styled.div\`color: red;\`;`);

			expect(result?.code).toBe(`style\`.foo{color:red}\`;styled.div\`color:red\`;`);
		});

		it("should allow custom tag lists", async () => {
			const result = await minifyHTMLLiterals(`view\`<div> hi </div>\`;theme\`.foo { color: red; }\`;`, {
				htmlTags: ["view"],
				cssTags: ["theme"],
			});

			expect(result?.code).toBe(`view\`<div>hi</div>\`;theme\`.foo{color:red}\`;`);
		});

		it("should allow disabling source maps", async () => {
			const result = await minifyHTMLLiterals(SOURCE, {
				fileName: "test.js",
				sourceMap: false,
			});
			expect(result).toBeTypeOf("object");
			expect(result!.map).toBeUndefined();
		});
	});
});
