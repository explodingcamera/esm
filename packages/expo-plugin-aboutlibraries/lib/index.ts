import { ConfigPlugin, createRunOncePlugin, withAppBuildGradle, withProjectBuildGradle } from "@expo/config-plugins";
import pkg from "../package.json";

const DEFAULT_VERSION = "10.5.2";

const newString = (text: string) =>
	`// --- start of expo-plugin-aboutlibraries\n${text}\n// --- end of expo-plugin-aboutlibraries`;

const withAboutLibrariesApp: ConfigPlugin = (config) => {
	return withAppBuildGradle(config, (config) => {
		if (config.modResults.contents.includes("// --- start of expo-plugin-aboutlibraries")) return config;

		if (config.modResults.language !== "groovy")
			throw new Error(`Cannot automatically configure project build.gradle if it's not groovy`);

		config.modResults.contents = `${newString("apply plugin: 'com.mikepenz.aboutlibraries.plugin'")}\n${
			config.modResults.contents
		}`;

		return config;
	});
};

const withAboutLibrariesProject: ConfigPlugin<{ aboutLibrariesVersion: string }> = (
	config,
	{ aboutLibrariesVersion },
) => {
	return withProjectBuildGradle(config, (config) => {
		if (config.modResults.contents.includes("// --- start of expo-plugin-aboutlibraries")) {
			config.modResults.contents = config.modResults.contents.replace(
				// replace the version number
				/id 'com.mikepenz.aboutlibraries.plugin' version '(.*)' apply false/,
				`id 'com.mikepenz.aboutlibraries.plugin' version '${aboutLibrariesVersion}' apply false`,
			);
			return config;
		}

		if (config.modResults.language !== "groovy")
			throw new Error(`Cannot automatically configure project build.gradle if it's not groovy`);

		const plugin = newString(
			`plugins {\n  id 'com.mikepenz.aboutlibraries.plugin' version "${aboutLibrariesVersion}" apply false\n}`,
		);

		config.modResults.contents = config.modResults.contents.replace("allprojects {", `\n${plugin}\n\nallprojects {`);

		return config;
	});
};

const withAboutLibraries: ConfigPlugin<{
	aboutLibrariesVersion?: string;
}> = (config, value) => {
	const ABOUT_LIBRARIES_VERSION = value?.aboutLibrariesVersion ?? DEFAULT_VERSION;

	config = withAboutLibrariesApp(config);
	config = withAboutLibrariesProject(config, { aboutLibrariesVersion: ABOUT_LIBRARIES_VERSION });

	return config;
};

export const withAndroidAboutLibraries = createRunOncePlugin(withAboutLibraries, pkg.name, pkg.version);
export default withAndroidAboutLibraries;
