import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { test } from "vitest";
import { Mutation, Query } from ".";

test("Mutation", async () => {
	@customElement("example-element")
	class ExampleElement extends LitElement {
		myQuery = new Query(this, "my-query", () => fetch("https://example.com"));
		myMutation = new Mutation(this, "my-mutation", (ctx, x: number) =>
			fetch(`https://example.com/${x}`, { method: "POST", signal: ctx.signal }),
		);
		override render() {
			return html`
			<h1>My Query</h1>
			<p>
				${this.myQuery.loading ? "Loading..." : this.myQuery.error ? "Error!" : JSON.stringify(this.myQuery.data)}
			</p>
			<h1>My Mutation</h1>
			<button @click=${this.handleClick}>Mutate</button>
			<p>
				${
					this.myMutation.loading
						? "Loading..."
						: this.myMutation.error
						? "Error!"
						: JSON.stringify(this.myMutation.data)
				}
			</p>
			`;
		}

		handleClick() {
			// typesafe arguments based on the type of the fetcher function :)
			this.myMutation.run(10);
		}
	}
});
