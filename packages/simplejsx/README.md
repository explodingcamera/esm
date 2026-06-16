# simplejsx

A minimal JSX templating library for rendering safe HTML strings.

`simplejsx` is a small JSX-to-HTML renderer for server-side templates, static site generation, emails,
and other places where you just want to emit HTML. It is not a React replacement: there are no hooks,
DOM rendering, hydration, Suspense, or React compatibility APIs.

Full API docs: [jsdocs.io/package/simplejsx](https://www.jsdocs.io/package/simplejsx)  
Examples: [`examples/simplejsx`](../../examples/simplejsx)

## Install

```bash
npm install simplejsx
```

## Setup

Use the automatic JSX runtime with `jsxImportSource` to use `simplejsx` as the JSX factory. In `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "simplejsx"
  }
}
```

For Deno, use `"jsxImportSource": "npm:simplejsx"` in `deno.json`.

## Example

```tsx
import { render, unsafeHTML, type PropsWithChildren } from "simplejsx";

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

Text and attributes are escaped by default. Use `renderAsync()` for async components, promise children,
or promise attributes. Nested `<head>` elements are merged into the top-level `<head>`, so page
components can set titles and metadata from inside a shared layout.

## See Also

- [Hono JSX](https://hono.dev/docs/guides/jsx) - JSX rendering for Hono apps, with a much broader runtime + dom API.
- [Preact](https://preactjs.com/) - React-compatible UI components with DOM rendering and hydration.
