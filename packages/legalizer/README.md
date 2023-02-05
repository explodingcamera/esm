# (WIP) Legalizer  [![API Docs](https://img.shields.io/badge/API%20Docs-blue.svg)](https://paka.dev/npm/legalizer)

> Generate License Information from all dependencies in a project

## Purpose

Legalizer is a tool to generate license information for all dependencies in a project, which then can be displayed in an app, website, or other way.

First and foremost, legalizer is build for the JavaScript and React Native ecosystems, but it will eventually support other ecosystems as well through plugins. Being build in TypeScript as opposed to something like Go or Rust is a deliberate choice, as it allows for easier integration in web and mobile apps, which are the primary use cases for this tool. Furthermore, it allows me to ship just one version of the tool for all platforms and quickly run it with `npx` without having to install it first.