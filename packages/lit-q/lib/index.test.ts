import "./../test-preload";
import { html, LitElement } from "lit";
import { describe, expect, mock, test } from "bun:test";
import { Mutation, Query } from "./index";

const fetchMock = mock((_url: string, _options?: RequestInit) => {
	return Promise.resolve({
		json: () =>
			Promise.resolve({
				foo: "bar",
			}),
	});
});

describe("Mutation", () => {
	test("works with a basic query/mutation", async () => {
		class ExampleElement extends LitElement {
			myQuery = new Query(this, "my-query", () => fetchMock("https://example.com/"));
			myMutation = new Mutation(this, "my-mutation", (ctx, x: number) => {
				expect(x).toBe(10);
				return fetchMock(`https://example.com/${x}`, {
					method: "POST",
					signal: ctx.signal,
				});
			});
			override render() {
				return html`
				<h1>My Query</h1>
				<p>
					${
						this.myQuery.loading
							? "Loading..."
							: this.myQuery.error
							  ? "Error!"
							  : JSON.stringify(this.myQuery.data)
					}
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
		customElements.define("example-element", ExampleElement);

		const el = new ExampleElement();
		document.body.appendChild(el);
		await el.myMutation.run(10);

		expect(el.myQuery.data).toBeDefined();
		expect(el.myMutation.data).toBeDefined();

		document.body.removeChild(el);
	});
});
