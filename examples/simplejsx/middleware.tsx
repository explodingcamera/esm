/** @jsxImportSource simplejsx */
import { renderAsync, type ElementMiddleware, type PropsWithChildren } from "simplejsx";

function Document({ children }: PropsWithChildren) {
	return (
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<title>simplejsx middleware</title>
			</head>
			<body>{children}</body>
		</html>
	);
}

const externalLinks: ElementMiddleware = ({ tag, props }) => {
	if (tag !== "a" || typeof props["href"] !== "string") return;
	if (!props["href"].startsWith("https://")) return;

	return { ...props, target: "_blank", rel: "noreferrer" };
};

const imageMetadata: ElementMiddleware = async ({ tag, props }) => {
	if (tag !== "img" || typeof props["src"] !== "string") return;

	const size = await getImageSize(props["src"]);
	return {
		...props,
		loading: props["loading"] ?? "lazy",
		width: size.width,
		height: size.height,
	};
};

async function getImageSize(_src: string) {
	return { width: 1200, height: 800 };
}

const html = await renderAsync(
	<Document>
		<main>
			<h1>Element middleware</h1>
			<a href="https://example.com">External link</a>
			<img src="/photo.jpg" alt="A mountain lake" />
		</main>
	</Document>,
	{
		element: [externalLinks, imageMetadata],
	},
);

console.log(`<!doctype html>${html}`);
