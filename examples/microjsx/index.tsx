/** @jsxImportSource microjsx */
import { renderAsync, unsafeHTML, type PropsWithChildren } from "microjsx";

function Document({ children }: PropsWithChildren) {
	return (
		<html lang="en">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
			</head>
			<body>{children}</body>
		</html>
	);
}

async function Page() {
	const name = await Promise.resolve("<World>");

	return (
		<>
			<head>
				<title>microjsx example</title>
				<meta name="description" content="Rendered with microjsx" />
			</head>
			<main class="page">
				<h1>Hello {name}</h1>
				<p>Text is escaped by default.</p>
				{unsafeHTML("<hr>")}
			</main>
		</>
	);
}

const html = await renderAsync(
	<Document>
		<Page />
	</Document>,
);

console.log(`<!doctype html>${html}`);
