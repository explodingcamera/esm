# Henry's Libraries &nbsp;![GitHub Workflow Status (with branch)](https://img.shields.io/github/actions/workflow/status/explodingcamera/esm/ci.yaml?branch=main&label=ALL%20BUILDS)

> A monorepo with some of my smaller TypeScript/JavaScript libraries. <br/>

## Principles

- All packages are written in TypeScript
- 3rd party dependencies are kept to a minimum
- Only the latest LTS version of Node.js is officially supported

## Projects

| Package                                                                                       | Status   | Description                                         |
| --------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------- |
| [`@explodingcamera/css`](./packages/css)                                                      | Stable   | Small CSS reset/base files.                         |
| [`minify-literals`](./packages/minify-literals)                                               | Stable   | Minify CSS and HTML literals.                       |
| [`rollup-plugin-minify-template-literals`](./packages/rollup-plugin-minify-template-literals) | Stable   | Vite/Rollup plugin that minifies template literals. |
| [`spaify`](./packages/spaify)                                                                 | Unstable | Seamless page transitions for static sites.         |

## Deprecated Packages

These packages are no longer maintained in this repository.

| Package                                                                                  | Status     | Description                            |
| ---------------------------------------------------------------------------------------- | ---------- | -------------------------------------- |
| [`expo-plugin-aboutlibraries`](https://www.npmjs.com/package/expo-plugin-aboutlibraries) | Deprecated | Expo config plugin for AboutLibraries. |
| [`lit-q`](https://www.npmjs.com/package/lit-q)                                           | Deprecated | Async query/mutation helpers for Lit.  |
| [`ucmd`](https://www.npmjs.com/package/ucmd)                                             | Deprecated | Minimal typed argument parser.         |

## Packages Contained In Other Repositories

Please open issues and pull requests for these packages in their respective repositories.

| Package                                                                              | Description                                  |
| ------------------------------------------------------------------------------------ | -------------------------------------------- |
| [`@explodingcamera/eslint-config`](https://github.com/explodingcamera/eslint-config) | Shareable eslint config (deprecated).        |
| [`subsonic-api`](https://github.com/explodingcamera/subsonic-api)                    | API library for Subsonic-compatible servers. |
