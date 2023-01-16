import type { ReactiveController, ReactiveControllerHost } from "lit";
import { state } from "lit/decorators.js";

export type LitQContext = {
	signal?: AbortSignal | undefined;
};

const abortControllerAvailable = typeof AbortController !== "undefined";

type RemoveFirstFromTuple<T extends any[]> = ((...args: T) => void) extends (_: any, ...args: infer R) => void
	? R
	: never;

export class Mutation<
	TResponse = unknown,
	TError = Error,
	TFetcher extends (context: LitQContext, ...args: any[]) => Promise<TResponse> = (
		context: LitQContext,
		...args: any[]
	) => Promise<TResponse>,
> implements ReactiveController
{
	host: ReactiveControllerHost;

	#name: string;
	#fetcher: TFetcher;
	abortController = abortControllerAvailable ? new AbortController() : undefined;

	@state() loading = false;
	@state() error?: Error | TError | undefined;
	@state() data?: TResponse | undefined;
	@state() statusCode?: number | undefined;

	constructor(host: ReactiveControllerHost, name: string, fetcher: TFetcher) {
		(this.host = host).addController(this);

		this.#name = name;
		this.#fetcher = fetcher;
	}

	hostConnected() {}
	hostDisconnected() {}

	async cancel() {
		if (this.abortController) {
			this.abortController.abort();
		}
	}

	async run(...args: RemoveFirstFromTuple<Parameters<TFetcher>>) {
		if (this.loading) {
			return Promise.reject(new Error(`Mutation ${this.#name} is already running`));
		}

		this.loading = true;
		this.error = undefined;
		this.statusCode = undefined;
		this.data = undefined;

		try {
			this.data = await this.#fetcher(
				{
					signal: this.abortController?.signal,
				},
				...args,
			);
		} catch (error) {
			this.error = error as TError;
		} finally {
			this.loading = false;
		}

		return this.data;
	}
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
