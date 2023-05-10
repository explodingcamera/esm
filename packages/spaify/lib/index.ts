import { getDoc } from "./doc";

export type Options = {
	selectors: {
		/**
		 * 	The selector for the scripts that should only be run on the first page load. (and not when navigating between pages)
		 * 	Note: this behavior is the default for all scripts in the head and directly inside the body.
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
	attribute: string;
};

const init = (opts: Partial<Options> = {}) => {
	const a = opts.attribute || "data-spaify";
	const options = {
		attribute: a,
		selectors: {
			once: `script[${a}-run=once]`,
			always: `script[${a}-run=always]`,
			ignore: `a[${a}-ignore]`,
			main: `body *[${a}-main]`,
			...opts.selectors,
		},
	};

	const onLinkClick = (e: MouseEvent) => {
		const target = e.target as HTMLAnchorElement;
		if (
			target.tagName !== "A" ||
			window.location.origin !== target.origin ||
			target.matches(options.selectors.ignore)
		)
			return;

		e.preventDefault();
		history.pushState({ url: target.href }, "", target.href);
		handlePageTransition(target.href);
	};

	let abort = new AbortController();
	const handlePageTransition = async (to: string) => {
		if (abort.signal) abort.abort();
		abort = new AbortController();

		let doc: Document;
		try {
			abort = new AbortController();
			doc = await getDoc(to, abort.signal);
		} catch (e: unknown) {
			if (e === "abort") {
				// the request was aborted, so we don't need to do anything
				return;
			}

			// something went wrong, so we just redirect to the page instead of trying to handle it with Spaify
			window.location.assign(to);
			return;
		}

		// remove scripts that should only be run for the first page load
		doc
			.querySelectorAll(`${options.selectors.main} ${options.selectors.once}`)
			.forEach((el) => el.tagName === "SCRIPT" && el.remove());

		// collect all scripts that should be run for this pageload
		const alwaysScripts = doc.querySelectorAll(
			`header ${options.selectors.always}, body > ${options.selectors.always}`,
		);

		const newMain = doc.querySelector(options.selectors.main);

		// replace the main element
		const main = document.querySelector(options.selectors.main);
		if (!main || !newMain) throw new Error(`No main element`);
		main.replaceWith(newMain.cloneNode(true));

		// append the new scripts to the document
		alwaysScripts.forEach((el) => el.tagName === "SCRIPT" && document.body.appendChild(el));

		// update the title
		if (doc.title) document.title = doc.title;

		// scroll to the top of the page
		window.scrollTo(0, 0);
	};

	const onPopState = (e: PopStateEvent) => handlePageTransition(window.location.href);
	document.addEventListener("click", onLinkClick);
	window.addEventListener("popstate", onPopState);

	return {
		unload: () => {
			document.removeEventListener("click", onLinkClick);
			window.removeEventListener("popstate", onPopState);
		},
	};
};

export { init, init as default };
