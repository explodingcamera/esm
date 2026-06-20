/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

const cache = new Map<string, Document>();
cache.set(location.href, document.cloneNode(true) as Document);

export type Options = {
	selectors: {
		/**
		 * 	The selector for the scripts that should only run on the initial page load.
		 */
		once: string;

		/**
		 * The selector for the scripts that should be run on every page load.
		 * Note: this behavior is the default for all scripts inside the main element
		 * */
		always: string;

		/**
		 * The selector for the links that should not be handled by Spaify.
		 * (links to external sites are already ignored by default)
		 * */
		ignore: string;

		/**
		 * The selector for the element that contains the main content of the page.
		 * This element will be replaced with the new page's main element.
		 * script tags inside this element will always be run. To disable this, use the onceSelector.
		 * */
		main: string;
	};
	/**
	 * The attribute prefix Spaify uses for its own selectors.
	 */
	attribute: string;
	/**
	 * Whether to keep the current document's html attributes in sync with the new page.
	 */
	keepHtmlAttributes: boolean;

	/**
	 * Whether to keep the current document's body attributes in sync with the new page.
	 */
	keepBodyAttributes: boolean;
};

export type SpaifyOptions = Partial<Omit<Options, "selectors">> & {
	selectors?: Partial<Options["selectors"]>;
};

export type SpaifyInstance = {
	unload(): void;
};

const init = (opts: SpaifyOptions = {}): SpaifyInstance => {
	if ((window as any).__spaify) throw new Error("Spaify's already initialized");
	(window as any).__spaify = true;

	const a = opts.attribute || "data-spaify";
	const options = {
		attribute: a,
		selectors: {
			once: `[${a}-run=once]`,
			always: `[${a}-run=always]`,
			ignore: `a[${a}-ignore]`,
			main: `body *[${a}-main]`,
			...opts.selectors,
		},
		keepHtmlAttributes: opts.keepHtmlAttributes ?? false,
		keepBodyAttributes: opts.keepBodyAttributes ?? false,
	};
	const scrollPositions = new Map<string, [number, number]>();
	let currentUrl = location.href;
	const scrollRestoration = history.scrollRestoration;
	history.scrollRestoration = "manual";

	const onLinkClick = (e: MouseEvent) => {
		if (
			e.defaultPrevented ||
			e.button !== 0 ||
			e.metaKey ||
			e.ctrlKey ||
			e.shiftKey ||
			e.altKey ||
			!(e.target instanceof Element)
		)
			return;

		const target = e.target.closest("a");

		if (
			!(target instanceof HTMLAnchorElement) ||
			location.origin !== target.origin ||
			target.hasAttribute("download") ||
			(target.target && target.target !== "_self") ||
			target.matches(options.selectors.ignore)
		)
			return;

		const url = new URL(target.href);
		if (url.pathname === location.pathname && url.search === location.search) return;

		e.preventDefault();
		void handlePageTransition(target.href, true);
	};

	let abort = new AbortController();
	const handlePageTransition = async (to: string, push = false) => {
		const reload = () => location.assign(to);
		scrollPositions.set(currentUrl, [scrollX, scrollY]);
		abort.abort();
		abort = new AbortController();
		const signal = abort.signal;

		let res: { doc: Document; firstLoad: boolean };
		try {
			res = await getDoc(to, signal);
		} catch (e: unknown) {
			if (!(e instanceof DOMException && e.name === "AbortError")) reload();
			return;
		}
		if (signal.aborted) return;

		const doc = res.doc.cloneNode(true) as Document;

		// collect all scripts that should be run for this pageload
		const runScripts = doc.querySelectorAll(
			`script${options.selectors.always},${options.selectors.main} script:not(${options.selectors.once})`,
		);

		const newMain = doc.querySelector(options.selectors.main);
		const main = document.querySelector(options.selectors.main);
		if (!main || !newMain) return reload();
		const scroll: [number, number] = push ? [0, 0] : scrollPositions.get(to) || [0, 0];

		const swap = () => {
			if (signal.aborted) return;

			if (options.keepHtmlAttributes) {
				syncAttributes(document.documentElement, doc.documentElement);
			}
			if (options.keepBodyAttributes) {
				syncAttributes(document.body, doc.body);
			}

			if (push) history.pushState({ url: to }, "", to);
			currentUrl = to;
			main.replaceWith(newMain);
			runScripts.forEach((el) => {
				insertScript(el, options.attribute);
			});
			if (res.firstLoad) {
				doc.querySelectorAll(options.selectors.once).forEach((el) => {
					insertScript(el, options.attribute);
				});
			}

			if (doc.title) document.title = doc.title;
			window.scrollTo(scroll[0], scroll[1]);
		};

		try {
			await (document.startViewTransition
				? document.startViewTransition(swap).updateCallbackDone
				: Promise.resolve().then(swap));
		} catch {
			if (signal.aborted) return;
			return reload();
		}
	};

	const onPopState = () => handlePageTransition(location.href);
	document.addEventListener("click", onLinkClick);
	window.addEventListener("popstate", onPopState);

	return {
		unload: () => {
			document.removeEventListener("click", onLinkClick);
			window.removeEventListener("popstate", onPopState);
			history.scrollRestoration = scrollRestoration;
		},
	};
};

const syncAttributes = (current: Element, next: Element) => {
	for (const { name } of [...current.attributes]) {
		if (!next.hasAttribute(name)) current.removeAttribute(name);
	}
	for (const { name, value } of next.attributes) {
		current.setAttribute(name, value);
	}
};

const insertScript = (el: Element, attribute: string) => {
	if (!(el instanceof HTMLScriptElement)) return;
	const newScript = document.createElement("script");
	for (const { name, value } of el.attributes) {
		newScript.setAttribute(name, value);
	}
	newScript.text = el.text;
	newScript.setAttribute(attribute, "1");
	document.head.appendChild(newScript);
};

async function getDoc(url: string, signal: AbortSignal): Promise<{ doc: Document; firstLoad: boolean }> {
	if (cache.has(url)) return { doc: cache.get(url)!, firstLoad: false };
	const resp = await fetch(url, { signal });
	if (!resp.ok) throw resp.statusText;
	const doc = new DOMParser().parseFromString(await resp.text(), "text/html");
	cache.set(url, doc);
	return { doc, firstLoad: true };
}

export { init, init as default };
