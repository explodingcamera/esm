# rollup-plugin-minify-template-literals [![API Docs](https://img.shields.io/badge/API%20Docs-blue.svg)](https://paka.dev/npm/rollup-plugin-minify-template-literals) [![NPM Version](https://img.shields.io/npm/v/rollup-plugin-minify-template-literals.svg)](https://www.npmjs.com/package/rollup-plugin-minify-template-literals)

> Minify HTML & CSS markup inside JavaScript/TypeScript template literal strings - for vite and rollup.

## Installation

```bash
$ npm i rollup-plugin-minify-template-literals
# or
$ yarn add rollup-plugin-minify-template-literals
# or
$ pnpm add rollup-plugin-minify-template-literals
```

## Usage

### Vite

<table>
<tr>
<td> vite.config.ts </td>
</tr>
<tr>
<td>

```ts
import { defineConfig } from "vite";
import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals";

export default defineConfig({
  plugins: [minifyTemplateLiterals()],
});
```

</td>
</tr>
</table>

### Rollup

<table>
<tr>
<td> rollup.config.js </td>
</tr>
<tr>
<td>

```ts
import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals";

export default {
  plugins: [minifyTemplateLiterals()],
};
```

</td>
</tr>
</table>

## ES5 Support

Be sure to minify template literals before transpiling to ES5. Otherwise, the API will not be able to find any template literal (`${}`) strings.

## Options

```ts
export interface Options {
  /**
   * Pattern or array of patterns of files to minify.
   */
  include?: string | RegExp | Array<string | RegExp>;
  /**
   * Pattern or array of patterns of files not to minify.
   */
  exclude?: string | RegExp | Array<string | RegExp>;
  /**
   * Options passed to minify-literals.
   */
  minify?: MinifyOptions;
}
```

## Related Packages

- [minify-literals](https://npmjs.com/package/minify-literals) - Minify HTML & CSS markup inside JavaScript/TypeScript template literal strings.
