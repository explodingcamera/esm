# Spaify

Seamless page transitions for your static site in less than 2kb of JavaScript (1kb gzipped).
Loads pages via fetch and inserts them into the DOM without reloading the page. All external links are handled by the browser as usual.

## Installation

```bash
npm install spaify
```

## Usage

```js
import spaify from 'spaify'
spaify()
```

```html
<head>
  <script type="module">
    // with defaults
    import "https://esm.sh/spaify/default";

    // or with options
    import spaify from "https://esm.sh/spaify";
    spaify();
  </script>

  <script>
    console.log("this script will run on the first page load only");
  </script>

  <script data-spaify-run="once">
    console.log("this script will run every time this page is loaded / navigated to for the first time");
  </script>

  <script data-spaify-run="always">
    console.log("this script will run every time this page is loaded / navigated to");
  </script>
</head>

<body>
  <div data-spaify-main>
    <!-- all script tags in here default to a-spaify-run="always" -->

    <!-- this will be fetched via fetch and inserted into the DOM -->
    <a href="/page1">page 1</a> 

    <!-- these will be handled by the browser -->
    <a href="/page2" data-spaify-ignore>page 2</a> 
    <a href="https://example.com">external link</a>
  </div>

  <!-- all script here are like in the head -->
</body>
```
