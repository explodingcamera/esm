# Henry's Libraries &nbsp;![GitHub Workflow Status (with branch)](https://img.shields.io/github/actions/workflow/status/explodingcamera/esm/ci.yaml?branch=main&label=ALL%20BUILDS)

> A Monorepo with some of some of my smaller (TypeScript/JavaScript) libraries. <br/>
> As these grow, they will be split into their own repositories

## Principles

- All packages are written in TypeScript
- 3rd party dependencies are kept to a minimum (if any)
- Only the latest LTS version of Node.js is officially supported (currently 18)

<br />

## Projects

| Stable                                                                                                                                                                                  |                                                                                                                                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![](https://img.shields.io/npm/v/rollup-plugin-minify-template-literals?style=flat&colorA=000000&colorB=efefef)](https://www.npmjs.com/package/rollup-plugin-minify-template-literals) | [**`rollup-plugin-minify-template-literals`**](./packages/rollup-plugin-minify-template-literals) <br/> A rollup & vite plugin to minify html/css template literals |
| [![](https://img.shields.io/npm/v/minify-literals?style=flat&colorA=000000&colorB=efefef)](https://www.npmjs.com/package/minify-literals)                                               | [**`minify-literals`**](./packages/minify-literals) <br/> A library to minify html/css template literals                                                            |

| Unstable                                                                                                                                                        |                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![](https://img.shields.io/npm/v/ucmd?style=flat&colorA=000000&colorB=efefef)](https://www.npmjs.com/package/ucmd)                                             | [**`ucmd`**](./packages/ucmd) <br/> minimal and strictly typed argument parsing for node.js 19+                                                         |
| [![](https://img.shields.io/npm/v/lit-q?style=flat&colorA=000000&colorB=efefef)](https://www.npmjs.com/package/lit-q)                                           | [**`lit-q`**](./packages/lit-q) <br/> A simple async query/mutation library for Lit/LitElement inspired by react-query                                  |
| [![](https://img.shields.io/npm/v/expo-plugin-aboutlibraries?style=flat&colorA=000000&colorB=efefef)](https://www.npmjs.com/package/expo-plugin-aboutlibraries) | [**`expo-plugin-aboutlibraries`**](./packages/expo-plugin-aboutlibraries) <br/> A simple expo config plugin to install the AboutLibraries gradle plugin |
| [![](https://img.shields.io/npm/v/unlocked?style=flat&colorA=000000&colorB=efefef)](https://www.npmjs.com/package/unlocked)                                     | [**`unlocked`**](./packages/unlocked) <br/> Parse lockfiles from npm, yarn (v1 and v2), and pnpm into a common format for use in other tools            |

| In Development                                                                                                                |                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [![](https://img.shields.io/npm/v/legalizer?style=flat&colorA=000000&colorB=efefef)](https://www.npmjs.com/package/legalizer) | [**`legalizer`**](./packages/legalizer) <br/> A library to generate license information from all dependencies in a project |

# Packages contained in other repositories

Please open issues and pull requests for these packages in their respective repositories.

|                                                                                                                                                                         |                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![](https://img.shields.io/npm/v/@explodingcamera/eslint-config?style=flat&colorA=000000&colorB=efefef)](https://www.npmjs.com/package/@explodingcamera/eslint-config) | [**`@explodingcamera/eslint-config`**](https://github.com/explodingcamera/eslint-config) <br/> shareable eslint config (deprecated)               |
| [![](https://img.shields.io/npm/v/subsonic-api?style=flat&colorA=000000&colorB=efefef)](https://www.npmjs.com/package/subsonic-api)                                     | [**`subsonic-api`**](https://github.com/explodingcamera/subsonic-api) <br/> A simple API library for interacting with Subsonic-compatible servers |
