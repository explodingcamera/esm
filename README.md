# Henry's Libraries &nbsp;![GitHub Workflow Status (with branch)](https://img.shields.io/github/actions/workflow/status/explodingcamera/esm/ci.yaml?branch=main&label=ALL%20BUILDS)

> A Monorepo with some of some of my smaller (TypeScript/JavaScript) libraries. <br/>
> As these grow, they might be split into their own repositories

<br/>

## Principles

- All packages are written in TypeScript
- 3rd party dependencies are kept to a minimum (if any)
- Only the latest LTS version of Node.js is officially supported (currently 18)

<br />

## Projects


<!-- START TABLE -->
<table><thead><tr><th>NPM</th><th>Support</th><th>Description</th></tr></thead><tbody><tr><td><a href="https://npmjs.com/package/minify-literals"><img src="https://img.shields.io/npm/v/minify-literals.svg?style=flat-square" alt="minify-literals" /></a></td><td><strong>Stable</strong></td><td><a href="./packages/minify-literals"><strong><code>minify-literals</code></strong></a><br />Minify CSS and HTML literals</td></tr><tr><td><a href="https://npmjs.com/package/rollup-plugin-minify-template-literals"><img src="https://img.shields.io/npm/v/rollup-plugin-minify-template-literals.svg?style=flat-square" alt="rollup-plugin-minify-template-literals" /></a></td><td><strong>Stable</strong></td><td><a href="./packages/rollup-plugin-minify-template-literals"><strong><code>rollup-plugin-minify-template-literals</code></strong></a><br />A Vite/Rollup plugin that minifies template literals.</td></tr><tr><td><a href="https://npmjs.com/package/expo-plugin-aboutlibraries"><img src="https://img.shields.io/npm/v/expo-plugin-aboutlibraries.svg?style=flat-square" alt="expo-plugin-aboutlibraries" /></a></td><td><strong>Unstable</strong></td><td><a href="./packages/expo-plugin-aboutlibraries"><strong><code>expo-plugin-aboutlibraries</code></strong></a><br />A simple expo config plugin to add the aboutlibraries plugin to your app</td></tr><tr><td><a href="https://npmjs.com/package/lit-q"><img src="https://img.shields.io/npm/v/lit-q.svg?style=flat-square" alt="lit-q" /></a></td><td><strong>Unstable</strong></td><td><a href="./packages/lit-q"><strong><code>lit-q</code></strong></a><br />A simple async query/mutation library for Lit/LitElement inspired by react-query</td></tr><tr><td><a href="https://npmjs.com/package/ucmd"><img src="https://img.shields.io/npm/v/ucmd.svg?style=flat-square" alt="ucmd" /></a></td><td><strong>Unstable</strong></td><td><a href="./packages/ucmd"><strong><code>ucmd</code></strong></a><br />??CMD is a minimal and strictly typed argument parsing library for node.js</td></tr><tr><td><a href="https://npmjs.com/package/legalizer"><img src="https://img.shields.io/npm/v/legalizer.svg?style=flat-square" alt="legalizer" /></a></td><td><strong>Preview</strong></td><td><a href="./packages/legalizer"><strong><code>legalizer</code></strong></a><br />Generate License Information from all dependencies in a project</td></tr><tr><td><a href="https://npmjs.com/package/pnpm-lock"><img src="https://img.shields.io/npm/v/pnpm-lock.svg?style=flat-square" alt="pnpm-lock" /></a></td><td><strong>Preview</strong></td><td><a href="./packages/pnpm-lock"><strong><code>pnpm-lock</code></strong></a><br />A fork of @pnpm/lockfile-file without all the dependencies and only the lockfile parsing</td></tr><tr><td><a href="https://npmjs.com/package/unlocked"><img src="https://img.shields.io/npm/v/unlocked.svg?style=flat-square" alt="unlocked" /></a></td><td><strong>Preview</strong></td><td><a href="./packages/unlocked"><strong><code>unlocked</code></strong></a><br />Parse lockfiles from npm, yarn, and pnpm into a common format</td></tr><tr><td><a href="https://npmjs.com/package/unlocked-aboutlibraries"><img src="https://img.shields.io/npm/v/unlocked-aboutlibraries.svg?style=flat-square" alt="unlocked-aboutlibraries" /></a></td><td><strong>Preview</strong></td><td><a href="./packages/unlocked-aboutlibraries"><strong><code>unlocked-aboutlibraries</code></strong></a><br /></td></tr><tr><td><a href="https://npmjs.com/package/unlocked-cyclconedx"><img src="https://img.shields.io/npm/v/unlocked-cyclconedx.svg?style=flat-square" alt="unlocked-cyclconedx" /></a></td><td><strong>Preview</strong></td><td><a href="./packages/unlocked-cyclonedx"><strong><code>unlocked-cyclconedx</code></strong></a><br />Create CycloneDX SBOMs from CommonLock files</td></tr></tbody></table>
<!-- END TABLE -->

<br/>

## Packages contained in other repositories

Please open issues and pull requests for these packages in their respective repositories.

|                                                                                                                                                                         |                                                                                                                                                   |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![](https://img.shields.io/npm/v/@explodingcamera/eslint-config?style=flat&colorA=000000&colorB=efefef)](https://www.npmjs.com/package/@explodingcamera/eslint-config) | [**`@explodingcamera/eslint-config`**](https://github.com/explodingcamera/eslint-config) <br/> shareable eslint config (deprecated)               |
| [![](https://img.shields.io/npm/v/subsonic-api?style=flat&colorA=000000&colorB=efefef)](https://www.npmjs.com/package/subsonic-api)                                     | [**`subsonic-api`**](https://github.com/explodingcamera/subsonic-api) <br/> A simple API library for interacting with Subsonic-compatible servers |
