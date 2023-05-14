import type { ReactiveController, ReactiveControllerHost } from "lit";

export type LitQContext = {
	signal?: AbortSignal | undefined;
};

const abortControllerAvailable = typeof fetch !== "undefined" && typeof AbortController === "undefined";

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
	#host: ReactiveControllerHost;

	#name: string;
	#fetcher: TFetcher;
	abortController;

	#loading = false;
	#error?: Error | TError | undefined;
	#data?: TResponse | undefined;
	#statusCode?: number | undefined;

	set loading(value: boolean) {
		this.#loading = value;
		this.#host.requestUpdate();
	}

	get loading() {
		return this.#loading;
	}

	set error(value: Error | TError | undefined) {
		this.#error = value;
		this.#host.requestUpdate();
	}

	get error() {
		return this.#error;
	}

	set data(value: TResponse | undefined) {
		this.#data = value;
		this.#host.requestUpdate();
	}

	get data() {
		return this.#data;
	}

	set statusCode(value: number | undefined) {
		this.#statusCode = value;
		this.#host.requestUpdate();
	}

	get statusCode() {
		return this.#statusCode;
	}

	constructor(host: ReactiveControllerHost, name: string, fetcher: TFetcher) {
		this.#host = host;
		this.#host.addController(this);

		this.#name = name;
		this.#fetcher = fetcher;

		if (abortControllerAvailable) this.abortController = new AbortController();
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
	override hostConnected() {
		this.run();
	}
}
