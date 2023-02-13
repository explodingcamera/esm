import type { CommonLock } from "unlocked";
import { Enums, Models, Serialize, Spec } from "@cyclonedx/cyclonedx-library";

export type Options = {};

const defaultOptions = (options: Partial<Options>) => ({
	...options,
});

const _ = {
	createComponent: (type: `${Enums.ComponentType}`, name: string) => {
		const component = new Models.Component(type as Enums.ComponentType, name);
		component.version = "1.0.0";
		return component;
	},
};

export const toCycloneDX = (lockfile: CommonLock, options: Partial<Options>) => {
	const opts = defaultOptions(options);

	let bom = new Models.Bom();
	bom.metadata.component = _.createComponent("application", "MyProject");

	const componentA = _.createComponent("library", "MyComponentA");

	bom.components.add(componentA);
	bom.metadata.component.dependencies.add(componentA.bomRef);

	return bom;
};

export const serializeJson = (bom: Models.Bom) =>
	new Serialize.JsonSerializer(new Serialize.JSON.Normalize.Factory(Spec.Spec1dot4)).serialize(bom);

export const serializeXml = (bom: Models.Bom) =>
	new Serialize.XmlSerializer(new Serialize.XML.Normalize.Factory(Spec.Spec1dot4)).serialize(bom);
