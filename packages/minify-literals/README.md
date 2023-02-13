# minify-literals [![API Docs](https://img.shields.io/badge/API%20Docs-blue.svg)](https://paka.dev/npm/minify-literals)

> Minify HTML & CSS markup inside JavaScript/TypeScript template literal strings.

Uses [html-minifier-terser](https://www.npmjs.com/package/html-minifier-terser) to minify HTML and [clean-css](https://www.npmjs.com/package/clean-css) to minify CSS.

## Installation

```bash
$ npm i minify-literals
# or
$ yarn add minify-literals
# or
$ pnpm add minify-literals
```

## Usage

<table>
<tr>
<td> TypeScript </td>
</tr>
<tr>
<td>

```ts
import { minifyHTMLLiterals } from "minify-literals";

const source = `
		const el = html\`<div > <h1>  Hello World  </h1 > </div>\`;
		const css = css\` .foo { color: red; }  \`;
	`;

let { code, map } = await minifyHTMLLiterals(source);
// or with options: await minifyHTMLLiterals(source, { fileName: "test.js" });

console.log(code);
// const el = html`<div><h1>Hello World</h1></div>`;
// const css = css`.foo{color:red}`;

console.log(map);
// SourceMap {
//   "file": ".map",
//   "mappings": "AAAA;AACA,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC, [...]
//   "names": [],
//   "sources": [
//     null,
//   ],
//   "sourcesContent": [
//     null,
//   ],
//   "version": 3,
// },
```

</td>
</tr>
</table>

## Options

```ts
export interface Options {
  /**
   * Minify HTML options, see https://github.com/terser/html-minifier-terser#options-quick-reference
   * @default .//src/defaultOptions.ts
   */
  minifyOptions?: Partial<minify.Options>;

  /**
   * Override the default strategy for how to minify HTML.
   * More info:
   *  https://github.com/explodingcamera/esm/blob/main/packages/minify-literals/lib/strategy.ts
   *
   * @optional
   */
  strategy: S;
}
```

## Related Packages

- [rollup-plugin-minify-template-literals](../rollup-plugin-minify-template-literals/README.md) - Rollup plugin for minifying HTML & CSS markup inside JavaScript/TypeScript template literal strings.

## Credits

This package is based on [minify-html-literals](https://github.com/asyncLiz/minify-html-literals) by [Elizabeth Mitchell](https://github.com/asyncLiz)
I've fixed a few bugs, ported it to ES modules, and refactored it a bit.

Some of the fixed bugs:

- https://github.com/asyncLiz/minify-html-literals/issues/37
- https://github.com/asyncLiz/minify-html-literals/issues/45
- https://github.com/asyncLiz/minify-html-literals/issues/46
- https://github.com/asyncLiz/minify-html-literals/issues/40
