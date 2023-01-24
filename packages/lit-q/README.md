# Lit-q [![API Docs](https://img.shields.io/badge/API%20Docs-blue.svg)](https://paka.dev/npm/lit-q)

## Usage

```ts
import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { query } from "lit-q";

@customElement("my-element")
export class MyElement extends LitElement {
  myQuery = new Query(this, "my-query", () => fetch("https://example.com"));
  myMutation = new Mutation(this, "my-mutation", () =>
    fetch("https://example.com", { method: "POST" })
  );

  render() {
    return html`
    <h1>My Query</h1>
    <p>
      ${this.myQuery.isLoading
        ? "Loading..."
        : this.myQuery.isError
        ? "Error!"
        : JSON.stringify(this.myQuery.data)}
    </p>
    <h1>My Mutation</h1>
    <button @click=${this.myMutation.mutate}>Mutate</button>
    <p>
      ${this.myMutation.isLoading
        ? "Loading..."
        : this.myMutation.isError
        ? "Error!"
        : JSON.stringify(this.myMutation.data)}
    </p>
    `;
}
```
