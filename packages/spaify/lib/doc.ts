const cache = new Map<string, Document>();
cache.set(window.location.href, document.cloneNode(true) as Document);

export async function getDoc(
	url: string,
	signal: AbortSignal,
): Promise<{ doc: Document; firstLoad: boolean }> {
	if (cache.has(url)) return { doc: cache.get(url)!, firstLoad: false };
	const resp = await fetch(url, { signal });
	if (!resp.ok) throw resp.statusText;
	const doc = new DOMParser().parseFromString(await resp.text(), "text/html");
	cache.set(url, doc);
	return { doc, firstLoad: true };
}

// XMLHttpRequest might be faster due to a streaming decoder, benchmark this (for now, fetch is used because it's less code)
// export function getDoc(url: string, signal: AbortSignal): Promise<Document> {
// 	if (cache.has(url)) {
// 		return Promise.resolve(cache.get(url)!);
// 	}
// 	return new Promise((resolve, reject) => {
// 		const xhr = new XMLHttpRequest();

// 		// Use the signal to abort the request
// 		signal.addEventListener("abort", () => {
// 			xhr.abort();
// 			reject("abort");
// 		});
// 		xhr.open("GET", url, true);
// 		xhr.responseType = "document";
// 		xhr.onload = function () {
// 			if (xhr.status >= 200 && xhr.status < 300 && xhr.responseXML) {
// 				cache.set(url, xhr.responseXML.cloneNode(true) as Document);
// 				resolve(xhr.responseXML);
// 			} else {
// 				reject(new Error(`HTTP Error: ${xhr.status}`));
// 			}
// 		};
// 		xhr.onerror = function () {
// 			reject(new Error("Network Error"));
// 		};
// 		xhr.send();
// 	});
// }
