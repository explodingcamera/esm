# rollup-plugin-minify-template-literals

> Minify HTML & CSS markup inside JavaScript/TypeScript template literal strings - for vite and rollup.

## Usage

### Vite

```ts
// vite.config.ts
import { defineConfig } from "vite";
import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals";

export default defineConfig({
  plugins: [minifyTemplateLiterals()],
});
```

### Rollup

```ts
// rollup.config.js
import { minifyTemplateLiterals } from "rollup-plugin-minify-template-literals";

export default {
  plugins: [minifyTemplateLiterals()],
};
```

## ES5 Support

Be sure to minify template literals before transpiling to ES5. Otherwise, the API will not be able to find any template literal (`${}`) strings.

## Options

```ts
export interface Options {
  /**
   * Pattern or array of patterns of files to minify.
   */
  include?: string | string[];
  /**
   * Pattern or array of patterns of files not to minify.
   */
  exclude?: string | string[];
  /**
   * Minify options, see
   * https://github.com/explodingcamera/esm/tree/main/packages/minify-literals#options.
   */
  options?: Partial<minify.Options>;
  /**
   * If true, any errors while parsing or minifying will abort the bundle
   * process. Defaults to false, which will only show a warning.
   */
  failOnError?: boolean;
  /**
   * Override minify-html-literals function.
   */
  minifyHTMLLiterals?: typeof minify.minifyHTMLLiterals;
  /**
   * Override include/exclude filter.
   */
  filter?: (id: string) => boolean;
}
```

## Credits

This package is based on [rollup-plugin-minify-html-literals](https://github.com/asyncLiz/minify-html-literals) by [Elizabeth Mitchell](https://github.com/asyncLiz).
I've fixed a few bugs, ported it to ES modules, and refactored it a bit.
