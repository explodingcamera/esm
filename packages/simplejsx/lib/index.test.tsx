/** @jsxImportSource . */
import { expect, test } from "bun:test";
import { jsx, render, renderAsync, unsafeHTML, type PropsWithChildren } from "./index.js";

test("escapes", () => {
	expect(render(<p title={"\"<&'"}>Hello {"<&'\""}</p>)).toBe(
		'<p title="&quot;&lt;&amp;&#39;">Hello &lt;&amp;&#39;&quot;</p>',
	);
});

test("components", () => {
	function Layout({ title, children }: PropsWithChildren<{ title: string }>) {
		return (
			<section>
				<h1>{title}</h1>
				{children}
			</section>
		);
	}

	const items = ["one", "two"];
	expect(
		render(
			<Layout title="Items">
				<ul>
					{items.map((item) => (
						<li>{item}</li>
					))}
				</ul>
				{false}
				{null}
				{undefined}
			</Layout>,
		),
	).toBe("<section><h1>Items</h1><ul><li>one</li><li>two</li></ul></section>");
});

test("fragments", () => {
	expect(
		render(
			<>
				<p>one</p>
				<p>two</p>
			</>,
		),
	).toBe("<p>one</p><p>two</p>");
});

test("raw html", () => {
	expect(render(<div>{"<strong>escaped</strong>"}</div>)).toBe(
		"<div>&lt;strong&gt;escaped&lt;/strong&gt;</div>",
	);
	expect(render(<div>{unsafeHTML("<strong>trusted</strong>")}</div>)).toBe(
		"<div><strong>trusted</strong></div>",
	);
});

test("attributes", () => {
	expect(
		render(
			<label class="field" htmlFor="name" data-id={1} aria-hidden={false}>
				Name
			</label>,
		),
	).toBe('<label class="field" for="name" data-id="1" aria-hidden="false">Name</label>');
	expect(render(<input disabled checked={false} value="name" />)).toBe('<input disabled value="name">');
});

test("element middleware", () => {
	expect(
		render(<a href="/docs">Docs</a>, {
			element: [
				({ tag, props }) => (tag === "a" ? { ...props, target: "_blank" } : undefined),
				({ tag, props }) => {
					if (tag === "a") props["rel"] = "noreferrer";
				},
			],
		}),
	).toBe('<a href="/docs" target="_blank" rel="noreferrer">Docs</a>');
	expect(
		render(<p>Hi</p>, {
			element: [[({ props }) => ({ ...props, class: "message" })]],
		}),
	).toBe('<p class="message">Hi</p>');
});

test("style", () => {
	expect(
		render(
			<div
				style={{
					marginTop: 10,
					opacity: 0.5,
					"--gap": 2,
					backgroundColor: "red",
				}}
			/>,
		),
	).toBe('<div style="margin-top:10px;opacity:0.5;--gap:2;background-color:red;"></div>');
	expect(render(<div style={'color: red; --label: "a&b";'} />)).toBe(
		'<div style="color: red; --label: &quot;a&amp;b&quot;;"></div>',
	);
});

test("children arrays and null", () => {
	function Box({ children }: PropsWithChildren) {
		return <div>{children}</div>;
	}

	expect(render(<Box>{[<span>one</span>, null, "two"]}</Box>)).toBe("<div><span>one</span>two</div>");
	expect(render(jsx("div", { children: null }))).toBe("<div></div>");
});

test("head hoisting", () => {
	function Page() {
		return (
			<>
				<head>
					<title>Page</title>
					<meta name="description" content="A&B" />
				</head>
				<main>Page</main>
			</>
		);
	}

	expect(
		render(
			<html lang="en">
				<head>
					<meta charSet="utf-8" />
				</head>
				<body>
					<Page />
				</body>
			</html>,
		),
	).toBe(
		'<html lang="en"><head><meta charset="utf-8"><title>Page</title><meta name="description" content="A&amp;B"></head><body><main>Page</main></body></html>',
	);
});

test("head creation", () => {
	expect(
		render(
			<html lang="en">
				<body>
					<head>
						<title>Page</title>
					</head>
					<main>Page</main>
				</body>
			</html>,
		),
	).toBe('<html lang="en"><head><title>Page</title></head><body><main>Page</main></body></html>');
});

test("async", async () => {
	async function Message() {
		return <strong>Async</strong>;
	}

	await expect(
		renderAsync(
			<div title={Promise.resolve("a&b")}>
				<Message />
				{Promise.resolve("x<y")}
			</div>,
		),
	).resolves.toBe('<div title="a&amp;b"><strong>Async</strong>x&lt;y</div>');
	await expect(
		renderAsync(<div title={Promise.resolve(null)} data-id={Promise.resolve(undefined)} />),
	).resolves.toBe("<div></div>");
	await expect(
		renderAsync(jsx("img", { src: "/image.png" }), {
			element: async ({ tag, props }) =>
				tag === "img" ? { ...props, alt: Promise.resolve("A&B") } : undefined,
		}),
	).resolves.toBe('<img src="/image.png" alt="A&amp;B">');
	await expect(
		renderAsync(<img src="/photo.jpg" alt="Mountain lake" />, {
			element: async ({ tag, props }) => {
				if (tag !== "img") return;

				await Promise.resolve();
				props["width"] = 1200;
				props["height"] = 800;
			},
		}),
	).resolves.toBe('<img src="/photo.jpg" alt="Mountain lake" width="1200" height="800">');
});

test("async head", async () => {
	await expect(
		renderAsync(
			<html lang="en">
				<head>
					<title>Base</title>
				</head>
				<body>
					<head>
						<meta name="description" content={Promise.resolve("A&B")} />
					</head>
				</body>
			</html>,
		),
	).resolves.toBe(
		'<html lang="en"><head><title>Base</title><meta name="description" content="A&amp;B"></head><body></body></html>',
	);
});

test("sync rejects async", () => {
	async function Message() {
		return <strong>Async</strong>;
	}

	expect(() => render(<Message />)).toThrow("renderAsync");
	expect(() => render(<div>{Promise.resolve("Async")}</div>)).toThrow("renderAsync");
	expect(() => render(<div />, { element: async () => {} })).toThrow("renderAsync");
});

test("function attrs", () => {
	expect(
		render(
			<button type="button" onclick={() => {}}>
				Click
			</button>,
		),
	).toBe('<button type="button">Click</button>');
	expect(() => render(jsx("div", { value: () => {} }))).toThrow("function prop");
});

test("void children", () => {
	expect(() => render(jsx("input", { children: "bad" }))).toThrow("void element");
});
