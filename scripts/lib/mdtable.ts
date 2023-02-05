import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Command, CommandContext } from "ucmd";
import type { PackageJson } from "@npm/types";

export const mdtableCommandOptions = {
	name: "mdtable",
	description: "generate the markdown table for readme.md",
	args: {
		external: {
			type: "string",
			short: "e",
			multiple: true,
		},
	},
} satisfies Command;

type Row = {
	name: string;
	description: string;
	url: string;
	npm: string;
	support?: "stable" | "unstable" | "preview" | "external";
};

type Table = Row[];

const html = (strings: TemplateStringsArray, ...values: any[]) => {
	return (
		strings
			.reduce((acc, str, i) => {
				return acc + str + (values[i] || "");
			}, "")
			// remove all leading spaces and tabs
			.replace(/^[ \t]+/gm, "")
			// remove all newlines
			.replace(/\n/g, "")
	);
};

const createTable = (table: Table) => {
	return html`<table>
  <thead>
    <tr>
      <th>NPM</th>
			<th>Support</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    ${table
			.map(
				(pkg) =>
					html`
          <tr>
            <td>
              <a href="https://npmjs.com/package/${pkg.npm}">
                <img src="https://img.shields.io/npm/v/${pkg.npm}.svg?style=flat-square" alt="${pkg.name}" />
              </a>
            </td>
						<td>
							${pkg.support === "stable" && html`<strong>Stable</strong>`}
							${pkg.support === "unstable" && html`<strong>Unstable</strong>`}
							${pkg.support === "preview" && html`<strong>Preview</strong>`}
							${pkg.support === "external" && html`<strong>External</strong>`}
						</td>
            <td>
              <a href="${pkg.url}">
                <strong><code>${pkg.name}</code></strong>
              </a><br />
              ${pkg.description}
            </td>
          </tr>`,
			)
			.join("\n")}
  </tbody>
</table>`;
};

const notEmpty = <TValue>(value: TValue | null | undefined): value is TValue =>
	value !== null && value !== undefined;

export const mdtableCommand = async ({ args }: CommandContext<typeof mdtableCommandOptions>) => {
	const packages = await readdir(join(process.cwd(), "packages"));
	const table: Table = (
		await Promise.all(
			packages.map(async (pkg) => {
				const pkgJson: PackageJson = JSON.parse(
					await readFile(join(process.cwd(), "packages", pkg, "package.json"), "utf8"),
				);

				if (pkgJson.private) return null;

				let support: Row["support"] = "stable";

				let supportOverride = (pkgJson as any)["support"] as Row["support"];
				if (supportOverride) {
					support = supportOverride;
				} else if (!pkgJson.version.startsWith("0.")) {
					support = "stable";
				} else if (pkgJson.version.startsWith("0.0")) {
					support = "preview";
				} else {
					support = "unstable";
				}

				return {
					name: pkgJson.name,
					description: pkgJson.description ?? "",
					url: `./packages/${pkg}`,
					npm: pkgJson.name,
					support,
				} satisfies Row;
			}),
		)
	)
		.filter(notEmpty)
		// sort by support and name (stable first, then unstable, then development, then external)
		.sort((a, b) =>
			a.support === b.support
				? a.name.localeCompare(b.name)
				: a.support === "stable"
				? -1
				: b.support === "stable"
				? 1
				: a.support === "unstable"
				? -1
				: b.support === "unstable"
				? 1
				: a.support === "preview"
				? -1
				: b.support === "preview"
				? 1
				: 0,
		);

	const code = createTable(table);

	const readme = await readFile(join(process.cwd(), "README.md"), "utf8");
	const newReadme = readme.replace(
		/<!-- START TABLE -->[\s\S]*<!-- END TABLE -->/,
		`<!-- START TABLE -->\n${code}\n<!-- END TABLE -->`,
	);
	await writeFile(join(process.cwd(), "README.md"), newReadme);
};
