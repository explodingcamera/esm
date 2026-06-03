import { Parser, type Expression, type Node, type TemplateLiteral } from "acorn";
import { tsPlugin } from "@sveltejs/acorn-typescript";

export type Template = {
	tag: string;
	parts: TemplatePart[];
};

export type TemplatePart = {
	text: string;
	start: number;
	end: number;
};

export function parseTemplates(source: string, fileName = ""): Template[] {
	let ast: Node;
	try {
		ast = Parser.extend(tsPlugin({ jsx: /\.m?[jt]sx($|[?#])/.test(fileName) })).parse(source, {
			ecmaVersion: "latest",
			locations: true,
			sourceType: "module",
		});
	} catch {
		return [];
	}

	const templates: Template[] = [];
	const nodes = [ast];

	for (const node of nodes) {
		if (node.type === "TaggedTemplateExpression") {
			const { tag, quasi } = node as Node & { tag: Expression; quasi: TemplateLiteral };
			templates.push({
				tag: source.slice(tag.start, tag.end),
				parts: quasi.quasis.map((quasi) => ({
					text: quasi.value.raw,
					start: quasi.start,
					end: quasi.end,
				})),
			});
		}

		for (const value of Object.values(node)) {
			if (Array.isArray(value)) {
				for (const item of value) {
					if (item && typeof item === "object" && typeof (item as Node).type === "string") {
						nodes.push(item as Node);
					}
				}
			} else if (value && typeof value === "object" && typeof (value as Node).type === "string") {
				nodes.push(value as Node);
			}
		}
	}

	return templates;
}
