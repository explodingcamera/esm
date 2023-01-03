import type { ReactiveController, ReactiveControllerHost } from "lit";
import { state } from "lit/decorators.js";

/// My attempt at a query/mutation system similar to React Query for Lit

export class Mutation<
	TResponse = unknown,
	TError = Error,
	// rome-ignore lint/suspicious/noExplicitAny: any required for type inference
	TFetcher extends (...args: any[]) => Promise<TResponse> = () => Promise<TResponse>,
> implements ReactiveController
{
	host: ReactiveControllerHost;

	#name: string;
	#fetcher: TFetcher;

	@state() loading = false;
	@state() error?: Error | TError | undefined;
	@state() data?: TResponse | undefined;
	@state() statusCode?: number | undefined;

	async run(...args: Parameters<TFetcher>) {
		if (this.loading) {
			return Promise.reject(new Error(`Mutation ${this.#name} is already running`));
		}

		this.loading = true;
		this.error = undefined;
		this.statusCode = undefined;
		this.data = undefined;

		try {
			try {
				this.data = await this.#fetcher(...args);
			} catch (error) {
				this.error = error as TError;
			}
		} finally {
			this.loading = false;
		}

		return this.data;
	}

	constructor(host: ReactiveControllerHost, name: string, fetcher: TFetcher) {
		(this.host = host).addController(this);

		this.#name = name;
		this.#fetcher = fetcher;
	}

	hostConnected() {}
	hostDisconnected() {}
}

// a query is a mutation that runs on connect, and doesn't need to be manually run
export class Query<T = unknown> extends Mutation<T> {
	constructor(host: ReactiveControllerHost, name: string, fetcher: () => Promise<T>) {
		super(host, name, fetcher);
	}

	override hostConnected() {
		this.run();
	}
}
