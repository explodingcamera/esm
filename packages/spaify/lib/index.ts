import { getDoc } from "./doc";

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
	attribute: string;
};

const init = (opts: Partial<Options> = {}) => {
	if ((window as any)["__spaify"]) throw new Error("Spaify's already initialized");
	(window as any)["__spaify"] = true;

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
	};

	const onLinkClick = (e: MouseEvent) => {
		const target = (e.target as Element).closest("a")!;

		if (
			!target ||
			target.tagName !== "A" ||
			window.location.origin !== target.origin ||
			target.matches(options.selectors.ignore)
		)
			return;

		e.preventDefault();
		handlePageTransition(target.href);
		history.pushState({ url: target.href }, "", target.href);
	};

	let abort = new AbortController();
	const handlePageTransition = async (to: string) => {
		const reload = () => window.location.assign(to);
		if (abort.signal) abort.abort();
		abort = new AbortController();

		let res;
		try {
			res = await getDoc(to, abort.signal);
		} catch (e: unknown) {
			return e === "abort" && reload();
		}
		const doc = res.doc.cloneNode(true) as Document;

		// collect all scripts that should be run for this pageload
		const runScripts = doc.querySelectorAll(
			`head script${options.selectors.always},body>script${options.selectors.always},${options.selectors.main} script:not(${options.selectors.once})`,
		);

		const newMain = doc.querySelector(options.selectors.main);
		// replace the main element
		const main = document.querySelector(options.selectors.main);
		if (!main || !newMain) return reload();
		main.replaceWith(newMain);

		// append the new scripts to the document
		runScripts.forEach((el) => insertScript(el));
		if (res.firstLoad) doc.querySelectorAll(options.selectors.once).forEach((el) => insertScript(el));

		// update the title
		if (doc.title) document.title = doc.title;

		// scroll to the top of the page
		window.scrollTo(0, 0);
	};

	const onPopState = () => handlePageTransition(window.location.href);
	document.addEventListener("click", onLinkClick);
	window.addEventListener("popstate", onPopState);

	return {
		unload: () => {
			document.removeEventListener("click", onLinkClick);
			window.removeEventListener("popstate", onPopState);
		},
	};
};

const insertScript = (el: Element) => {
	if (!(el instanceof HTMLScriptElement)) return;
	const newScript = document.createElement("script");
	newScript.innerHTML = el.innerHTML;
	if (el.innerHTML !== "") newScript.innerHTML = el.innerHTML;
	if (el.integrity !== "") newScript.integrity = el.integrity;
	if (el.referrerPolicy !== "") newScript.referrerPolicy = el.referrerPolicy;
	if (el.crossOrigin !== "") newScript.crossOrigin = el.crossOrigin;
	if (el.noModule !== false) newScript.noModule = el.noModule;
	if (el.type !== "") newScript.type = el.type;
	if (el.src !== "") newScript.src = el.src;
	newScript.setAttribute("data-spaify", "true");
	document.head.appendChild(newScript);
};

export { init, init as default };
