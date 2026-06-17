# microjsx

Minimal JSX templating for safe HTML strings.

`microjsx` renders JSX to HTML strings. It works well for server-side templates, static sites, emails,
and other places where a string is the whole output. This is not a React replacement and does not handle
browser interactivity.

Full API docs: [jsdocs.io/package/microjsx](https://www.jsdocs.io/package/microjsx)  
Examples: [`examples/microjsx`](../../examples/microjsx)

## Install

```bash
npm install microjsx
```

## Setup

Use the automatic JSX runtime with `jsxImportSource`. In `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "microjsx"
  }
}
```

For Deno, use `"jsxImportSource": "npm:microjsx"` in `deno.json`.

## Example

```tsx
import { render, unsafeHTML, type PropsWithChildren } from "microjsx";

function Layout({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <html>
      <head>
        <title>{title}</title>
      </head>
      <body>{children}</body>
    </html>
  );
}

const html = render(
  <Layout title="Hello">
    <h1>Hello {"<JSX>"}</h1>
    {unsafeHTML("<hr>")}
  </Layout>,
);
```

## Behavior

- Text and attributes are escaped by default. Use `unsafeHTML()` only for trusted markup.
- `style` supports strings and objects, e.g. `style="color:red"` or `style={{ marginTop: 8 }}`.
- `renderAsync()` awaits async components, promise children, and promise attributes.
- Nested `<head>` elements are merged into the top-level `<head>`.

## See Also

- [Hono JSX](https://hono.dev/docs/guides/jsx) for Hono apps. It has a much broader runtime and DOM API.
- [Preact](https://preactjs.com/) for React-compatible UI components, DOM rendering, and hydration.
