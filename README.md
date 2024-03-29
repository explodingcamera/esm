# Henry's Libraries &nbsp;![GitHub Workflow Status (with branch)](https://img.shields.io/github/actions/workflow/status/explodingcamera/esm/ci.yaml?branch=main&label=ALL%20BUILDS)

> A Monorepo with some of some of my smaller (TypeScript/JavaScript) libraries. <br/>
> As these grow, they might be split into their own repositories

## Principles

- All packages are written in TypeScript
- 3rd party dependencies are kept to a minimum (if any)
- Only the latest LTS version of Node.js is officially supported (currently 20)

## Projects

<!-- START TABLE -->
<table><thead><tr><th>NPM</th><th>Support</th><th>Description</th></tr></thead><tbody><tr><td><a href="https://npmjs.com/package/minify-literals"><img src="https://img.shields.io/npm/v/minify-literals.svg?style=flat-square" alt="minify-literals" /></a></td><td><strong>Stable</strong></td><td><a href="./packages/minify-literals"><strong><code>minify-literals</code></strong></a><br />Minify CSS and HTML literals</td></tr><tr><td><a href="https://npmjs.com/package/rollup-plugin-minify-template-literals"><img src="https://img.shields.io/npm/v/rollup-plugin-minify-template-literals.svg?style=flat-square" alt="rollup-plugin-minify-template-literals" /></a></td><td><strong>Stable</strong></td><td><a href="./packages/rollup-plugin-minify-template-literals"><strong><code>rollup-plugin-minify-template-literals</code></strong></a><br />A Vite/Rollup plugin that minifies template literals.</td></tr><tr><td><a href="https://npmjs.com/package/expo-plugin-aboutlibraries"><img src="https://img.shields.io/npm/v/expo-plugin-aboutlibraries.svg?style=flat-square" alt="expo-plugin-aboutlibraries" /></a></td><td><strong>Unstable</strong></td><td><a href="./packages/expo-plugin-aboutlibraries"><strong><code>expo-plugin-aboutlibraries</code></strong></a><br />A simple expo config plugin to add the aboutlibraries plugin to your app</td></tr><tr><td><a href="https://npmjs.com/package/lit-q"><img src="https://img.shields.io/npm/v/lit-q.svg?style=flat-square" alt="lit-q" /></a></td><td><strong>Unstable</strong></td><td><a href="./packages/lit-q"><strong><code>lit-q</code></strong></a><br />A simple async query/mutation library for Lit/LitElement inspired by react-query</td></tr><tr><td><a href="https://npmjs.com/package/spaify"><img src="https://img.shields.io/npm/v/spaify.svg?style=flat-square" alt="spaify" /></a></td><td><strong>Unstable</strong></td><td><a href="./packages/spaify"><strong><code>spaify</code></strong></a><br />Seamless page transitions for your static site in less than 2kb of JavaScript</td></tr><tr><td><a href="https://npmjs.com/package/ucmd"><img src="https://img.shields.io/npm/v/ucmd.svg?style=flat-square" alt="ucmd" /></a></td><td><strong>Unstable</strong></td><td><a href="./packages/ucmd"><strong><code>ucmd</code></strong></a><br />µCMD is a minimal and strictly typed argument parsing library for node.js</td></tr><tr><td><a href="https://npmjs.com/package/@explodingcamera/css"><img src="https://img.shields.io/npm/v/@explodingcamera/css.svg?style=flat-square" alt="@explodingcamera/css" /></a></td><td><strong>Preview</strong></td><td><a href="./packages/css"><strong><code>@explodingcamera/css</code></strong></a><br /></td></tr></tbody></table>
<!-- END TABLE -->

## Packages contained in other repositories

Please open issues and pull requests for these packages in their respective repositories.

|                                                                                                                                                                         |                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![](https://img.shields.io/npm/v/@explodingcamera/eslint-config?style=flat&colorA=000000&colorB=efefef)](https://www.npmjs.com/package/@explodingcamera/eslint-config) | [**`@explodingcamera/eslint-config`**](https://github.com/explodingcamera/eslint-config) <br/> shareable eslint config (deprecated)               |
| [![](https://img.shields.io/npm/v/subsonic-api?style=flat&colorA=000000&colorB=efefef)](https://www.npmjs.com/package/subsonic-api)                                     | [**`subsonic-api`**](https://github.com/explodingcamera/subsonic-api) <br/> A simple API library for interacting with Subsonic-compatible servers |
