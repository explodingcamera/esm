# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/2.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0]

- Updated to `html-minifier-next@7.0.0`
- Added `& Record<string, unknown>` to `HTMLMinifyOptions` and `CSSMinifyOptions` types to allow for additional options and to avoid breaking changes when `html-minifier-next` or `lightningcss` adds new options in the future.

## [2.0.2]

- Fix stale build artifacts in the npm package.

## [2.0.1]

- Replace `parse-literals` with a local implementation.

## [2.0.0]

- Replace html-minifier-terser and clean-css with html-minifier-next and Lightning CSS.
- Simplify the options API.
- Remove custom strategy, parser, and MagicString hooks in favor of `html`, `css`, `htmlTags`, `cssTags`, and `sourceMap` options.

## [1.0.10]

- Update build scripts.

## [1.0.6]

- Fix linting issues.

## [1.0.0]

- Mark `minify-literals` and `rollup-plugin-minify-template-literals` as stable.

## [0.2.3]

- Fix issues with key-value pairs.

## [0.2.2]

- Add API docs link to README.

## [0.2.1]

- Fix HTML and CSS comments.
- Fix template literals used as property names.

## [0.2.0]

- Clean up `package.json`.

## [0.1.0]

- Fix various open bugs.

## [0.0.2]

- Fix npm `package.json`.

## [0.0.1]

- Initial release.
