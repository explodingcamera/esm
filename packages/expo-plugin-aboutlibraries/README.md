# `expo-plugin-aboutlibraries`

A simple expo config plugin to add [AboutLibraries](https://github.com/mikepenz/AboutLibraries) as a gradle plugin to your app.

## Installation

```sh
expo install expo-plugin-aboutlibraries
```

## Usage

```js
// app.config.js or app.json

module.exports = {
  plugins: [
    [
      "expo-plugin-aboutlibraries",
      {
        aboutLibrariesVersion: "10.5.2", // optional, defaults to 10.5.2
      },
    ],
  ],
};
```

Now you can use AboutLibraries to generate a list of native libraries used in your app.

```sh
# apply the new config
$ expo prebuild

$ cd android

# This will generate a file called aboutLibraries.json in the assets folder
$ ./gradlew app:exportLibraryDefinitions -PaboutLibraries.exportPath=../../assets -PaboutLibraries.exportVariant=release
```
