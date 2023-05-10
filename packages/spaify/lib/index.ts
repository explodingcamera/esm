export type Options = {
	selectors: {
		onceSelector: string;
		ignoreSelector: string;
		mainSelector: string;
		alwaysSelector: string;
	};
	dataAttribute: string;
};

const defaultOptions: Options = {
	dataAttribute: "data-spaify",

	selectors: {
		// The selector for the scripts that should only be run on the first page load. (and not when navigating between pages)
		// Note: this behavior is the default for all scripts in the head and directly inside the body.
		onceSelector: "[$data$-run=once]",

		// The selector for the scripts that should be run on every page load.
		// Note: this behavior is the default for all scripts inside the main element
		alwaysSelector: "[$data$-run=always]",

		// The selector for the links that should not be handled by SPAify.
		// (links to external sites are already ignored by default)
		ignoreSelector: "a[$data$-ignore]",

		// The selector for the element that contains the main content of the page.
		// This element will be replaced with the new page's main element.
		// script tags inside this element will always be run. To disable this, use the onceSelector.
		mainSelector: "body *[$data$-main]",
	},
};

export class SPAify {
	options: Options = defaultOptions;
	abortController: AbortController | null = null;

	onLinkClick = (e: MouseEvent) => {
		e.preventDefault();

		if (this.shouldHandleLinkClick(e)) {
			const to = (e.target as HTMLAnchorElement).href;
			this.handlePageTransition(to);
			history.pushState({}, "", to);
		}
	};

	shouldHandleLinkClick = (e: MouseEvent) => {
		const target = e.target as HTMLAnchorElement;
		return (
			target.tagName === "A" &&
			window.location.origin === target.origin &&
			!target.matches(this.options.selectors.ignoreSelector)
		);
	};

	async handlePageTransition(to: string) {
		// abort the previous request if it's still running
		// (this can happen if the user clicks multiple links in quick succession)
		if (this.abortController?.signal) {
			this.abortController.abort();
		}

		let doc: Document;
		try {
			this.abortController = new AbortController();
			const signal = this.abortController.signal;
			doc = await getHTMLDocument(to, signal);
		} catch (e: unknown) {
			console.error(e);
			if (e instanceof DOMException && e.name === "AbortError") {
				// the request was aborted, so we don't need to do anything
				return;
			}

			// something went wrong, so we just redirect to the page instead of trying to handle it with SPAify
			window.location.assign(to);
			return;
		}

		// remove scripts that should only be run for the first page load
		doc
			.querySelectorAll(`${this.options.selectors.mainSelector} script${this.options.selectors.onceSelector}`)
			.forEach((el) => {
				if (el instanceof HTMLScriptElement) {
					el.remove();
				}
			});

		// collect all scripts that should be run for this pageload
		const alwaysScripts = doc.querySelectorAll(
			`header script${this.options.selectors.alwaysSelector}, body > script${this.options.selectors.alwaysSelector}`,
		);

		const newMain = doc.querySelector(this.options.selectors.mainSelector);

		// replace the main element
		const main = document.querySelector(this.options.selectors.mainSelector);
		if (main && newMain) {
			main.replaceWith(newMain.cloneNode(true));
		} else {
			throw new Error(`Could not find main element in document`);
		}

		// append the new scripts to the document
		alwaysScripts.forEach((el) => {
			if (el instanceof HTMLScriptElement) {
				document.body.appendChild(el);
			}
		});

		// update the title
		const title = doc.querySelector("title");
		if (title) {
			document.title = title.textContent ?? "";
		}

		// scroll to the top of the page
		window.scrollTo(0, 0);
	}

	constructor(options: Partial<Options> = {}) {
		this.options = { ...this.options, ...options };
		Object.assign(
			this.options.selectors,
			Object.fromEntries(
				Object.entries(this.options.selectors).map(([key, value]) => [
					key,
					(value as string).replace("$data$", this.options.dataAttribute),
				]),
			),
		);

		this.load();
	}

	load() {
		document.addEventListener("click", this.onLinkClick);

		// back/forward navigation
		window.addEventListener("popstate", (e) => {
			if (e.state) {
				this.handlePageTransition(window.location.href);
			}
		});
	}

	unload() {
		document.removeEventListener("click", this.onLinkClick);
	}
}

const cache = new Map<string, Document>();
// We use XMLHttpRequest instead of fetch since it can stream the response and parse it as it comes in (instead of waiting for the entire response to finish)
function getHTMLDocument(url: string, signal: AbortSignal): Promise<Document> {
	if (cache.has(url)) {
		return Promise.resolve(cache.get(url)!);
	}

	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();

		// Use the signal to abort the request
		signal.addEventListener("abort", () => {
			xhr.abort();
			reject(new DOMException("Aborted", "AbortError"));
		});

		xhr.open("GET", url, true);
		xhr.responseType = "document";

		xhr.onload = function () {
			if (xhr.status >= 200 && xhr.status < 300 && xhr.responseXML) {
				cache.set(url, xhr.responseXML.cloneNode(true) as Document);
				resolve(xhr.responseXML);
			} else {
				reject(new Error(`HTTP Error: ${xhr.status}`));
			}
		};

		xhr.onerror = function () {
			reject(new Error("Network Error"));
		};

		xhr.send();
	});
}
