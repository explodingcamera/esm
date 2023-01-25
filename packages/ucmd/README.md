# µCMD [![API Docs](https://img.shields.io/badge/API%20Docs-blue.svg)](https://paka.dev/npm/ucmd)

> minimal and strictly typed argument parsing for node.js 19+

## Installation

```bash
$ npm i ucmd
# or
$ yarn add ucmd
# or
$ pnpm add ucmd
```

## Usage

<table>
<tr>
<td> TypeScript </td>
</tr>
<tr>
<td>

```ts
import { ucmd, Command } from "ucmd";

const buildCommand = {
  name: "build",
  run: (ctx) => console.log(ctx.args, ctx.positionals),
  args: {
    config: {
      type: "string",
      short: "c",
    },
  },
} satisfies Command;

ucmd("scripts")
  .withCommand({
    name: "test",
    run: (ctx) => console.log(ctx.args, ctx.positionals),
  })
  .withCommand(buildCommand)
  .run();
```

</td>
</tr>
</table>
