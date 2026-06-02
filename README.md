# Henry's Libraries &nbsp;![GitHub Workflow Status (with branch)](https://img.shields.io/github/actions/workflow/status/explodingcamera/esm/ci.yaml?branch=main&label=ALL%20BUILDS)

> A monorepo with some of my smaller TypeScript/JavaScript libraries. <br/>

## Principles

- All packages are written in TypeScript
- 3rd party dependencies are kept to a minimum
- Only the latest LTS version of Node.js is officially supported

## Projects

| Package                                                                                       |                                                                                                                                                                                                                                                                                              | Description                                         |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [`@explodingcamera/css`](./packages/css)                                                      | [![API Docs](https://img.shields.io/badge/API%20Docs-blue.svg)](https://paka.dev/npm/@explodingcamera/css) [![NPM Version](https://img.shields.io/npm/v/@explodingcamera/css.svg)](https://www.npmjs.com/package/@explodingcamera/css)                                                       | Small CSS reset/base files.                         |
| [`minify-literals`](./packages/minify-literals)                                               | [![API Docs](https://img.shields.io/badge/API%20Docs-blue.svg)](https://paka.dev/npm/minify-literals) [![NPM Version](https://img.shields.io/npm/v/minify-literals.svg)](https://www.npmjs.com/package/minify-literals)                                                                      | Minify CSS and HTML literals.                       |
| [`rollup-plugin-minify-template-literals`](./packages/rollup-plugin-minify-template-literals) | [![API Docs](https://img.shields.io/badge/API%20Docs-blue.svg)](https://paka.dev/npm/rollup-plugin-minify-template-literals) [![NPM Version](https://img.shields.io/npm/v/rollup-plugin-minify-template-literals.svg)](https://www.npmjs.com/package/rollup-plugin-minify-template-literals) | Vite/Rollup plugin that minifies template literals. |
| [`spaify`](./packages/spaify)                                                                 | [![API Docs](https://img.shields.io/badge/API%20Docs-blue.svg)](https://paka.dev/npm/spaify) [![NPM Version](https://img.shields.io/npm/v/spaify.svg)](https://www.npmjs.com/package/spaify)                                                                                                 | Seamless page transitions for static sites.         |

## Packages Contained In Other Repositories

Please open issues and pull requests for these packages in their respective repositories.

| Package                                                           |                                                                                                                                                                                                                | Description                                  |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| [`subsonic-api`](https://github.com/explodingcamera/subsonic-api) | [![API Docs](https://img.shields.io/badge/API%20Docs-blue.svg)](https://paka.dev/npm/subsonic-api) [![NPM Version](https://img.shields.io/npm/v/subsonic-api.svg)](https://www.npmjs.com/package/subsonic-api) | API library for Subsonic-compatible servers. |

## Deprecated Packages

These packages are no longer maintained and have been removed from the monorepo.

| Package                                                                                  | Description                            |
| ---------------------------------------------------------------------------------------- | -------------------------------------- |
| [`expo-plugin-aboutlibraries`](https://www.npmjs.com/package/expo-plugin-aboutlibraries) | Expo config plugin for AboutLibraries. |
| [`lit-q`](https://www.npmjs.com/package/lit-q)                                           | Async query/mutation helpers for Lit.  |
| [`ucmd`](https://www.npmjs.com/package/ucmd)                                             | Minimal typed argument parser.         |
| [`@explodingcamera/eslint-config`](https://github.com/explodingcamera/eslint-config)     | Shareable eslint config                |
