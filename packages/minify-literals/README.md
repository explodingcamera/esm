# minify-literals [![API Docs](https://img.shields.io/badge/API%20Docs-blue.svg)](https://paka.dev/npm/minify-literals) [![NPM Version](https://img.shields.io/npm/v/minify-literals.svg)](https://www.npmjs.com/package/minify-literals)

> Minify HTML & CSS markup inside JavaScript/TypeScript template literal strings.

Uses [html-minifier-next](https://www.npmjs.com/package/html-minifier-next) to minify HTML and [lightningcss](https://lightningcss.dev/) to minify CSS.

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
export type Options = {
  /** Source filename used for parsing and source map generation. */
  fileName?: string;

  /**
   * Options passed to html-minifier-next, or a custom HTML minifier. Set to false to skip HTML and SVG templates.
   */
  html?:
    | false
    | Partial<HTMLMinifyOptions>
    | ((html: string) => string | Promise<string>);

  /**
   * Options passed to Lightning CSS, or a custom CSS minifier. Set to false to skip CSS.
   */
  css?: false | CSSMinifyOptions | ((css: string) => string | Promise<string>);

  /** Template tag substrings treated as HTML. Defaults to ["html", "svg"]. */
  htmlTags?: readonly string[];

  /** Template tag substrings treated as CSS. Defaults to ["css", "style", "styles", "styled"]. */
  cssTags?: readonly string[];

  /** Generate a source map for changed code. Defaults to true. */
  sourceMap?: boolean;
};
```

## Related Packages

- [rollup-plugin-minify-template-literals](https://npmjs.com/package/rollup-plugin-minify-template-literals) - Rollup plugin for minifying HTML & CSS markup inside JavaScript/TypeScript template literal strings.

## Credits

This package was originally a fork of [minify-html-literals](https://github.com/asyncLiz/minify-html-literals) by [Elizabeth Mitchell](https://github.com/asyncLiz)
