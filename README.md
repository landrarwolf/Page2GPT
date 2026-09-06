# Page2GPT

**Browser → clean context → ChatGPT.**

Some webpages — especially WeChat Official Account articles — are perfectly readable in a user's browser but unavailable to server-side AI crawlers. Page2GPT bridges that gap by extracting the content **inside your browser**, converting it to clean Markdown, and preparing it for ChatGPT.

## Recommended build: Tampermonkey / Userscript

For the original use case — opening a WeChat article and handing it to ChatGPT — the **userscript is now the recommended build**.

It is a single `.user.js` file with a small floating **Page2GPT** button in the bottom-right corner of the page. No unpacked browser extension is required.

### Install

1. Install Tampermonkey or another compatible userscript manager.
2. Open the raw script:

   `https://raw.githubusercontent.com/landrarwolf/Page2GPT/main/userscript/Page2GPT.user.js`

3. Confirm installation.
4. Open a WeChat Official Account article or another webpage.
5. Click **Page2GPT** in the bottom-right corner.

You can then choose:

- **Send to ChatGPT** — extract the page, build a prompt, copy it locally, and open ChatGPT.
- **Copy Markdown** — copy only the normalized article/page.
- **Preview** — inspect the exact Markdown before exporting.
- **Deep analysis / Summary / Fact check / No instruction** prompt modes.

The same actions are also available from Tampermonkey's userscript menu.

See [`userscript/README.md`](userscript/README.md).

## What works in v0.2.0

- Tampermonkey / userscript build with floating UI and menu commands
- Dedicated WeChat Official Account extraction for `mp.weixin.qq.com`
- Generic article extraction for normal webpages
- Title, source/account, publish time, article body, links, and image URLs
- Clean Markdown export
- Prompt presets: **Deep analysis**, **Summary**, **Fact check**, and **No instruction**
- Prompt-injection boundary: webpage text is explicitly treated as untrusted source material
- **Send to ChatGPT** = copy the complete prompt locally + open ChatGPT
- No backend, API key, login, database, or browsing history
- Existing Manifest V3 WebExtension retained in `extension/`

## Why the ChatGPT step uses the clipboard

Page2GPT deliberately avoids automating ChatGPT's webpage DOM. A selector-based integration would be fragile whenever ChatGPT's frontend changes. The stable workflow is:

```text
webpage → Page2GPT → clean prompt copied locally → ChatGPT opens → paste
```

This also avoids putting long article content into a URL.

## Use it with a WeChat article

Open a link such as:

```text
https://mp.weixin.qq.com/s/...
```

With the userscript installed, the **Page2GPT** button appears on the page. Opening it should show:

- `WeChat article`
- the article title
- extracted character count
- prompt mode selector

Choose a mode and click **Send to ChatGPT**. Page2GPT copies the full prompt and opens ChatGPT. Paste with `⌘V` / `Ctrl+V`.

## Userscript permissions

The Tampermonkey build uses:

- `GM_setClipboard` — copy Markdown / the ChatGPT prompt
- `GM_openInTab` — open ChatGPT
- `GM_registerMenuCommand` — expose quick commands in the userscript menu

The script matches ordinary HTTP/HTTPS pages so the generic extractor can work across websites. You can narrow site permissions in your userscript manager if you only want to use it on WeChat.

All extraction and formatting happen locally in the browser. Page2GPT has no server and does not receive your article content.

## Traditional browser extension

The original WebExtension remains available in [`extension/`](extension/).

### Chrome / Edge / Chromium

1. Download or clone this repository.
2. Open the browser's extension management page.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the `extension/` folder.
6. Open a webpage and click **Page2GPT** in the toolbar.

### Safari on macOS

For development, Safari can load a WebExtension through its extension-development workflow. For iPhone/iPad or App Store distribution, package the `extension/` folder with Apple's Safari Web Extension tooling in Xcode.

## Project structure

```text
Page2GPT/
├── userscript/
│   ├── Page2GPT.user.js  # Tampermonkey/userscript build
│   └── README.md
├── extension/
│   ├── manifest.json
│   ├── content.js        # WeChat + generic DOM extraction
│   ├── shared.js         # Markdown + prompt formatting
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── tests/
│   └── shared.test.mjs
├── docs/
│   └── ARCHITECTURE.md
├── package.json
└── LICENSE
```

## Development

No build step is required.

```bash
npm run check
npm test
```

`npm run check` validates both the WebExtension JavaScript and the Tampermonkey userscript.

## Roadmap

- Better generic extraction (Readability adapter)
- Selection → Ask ChatGPT
- Multi-page context bundles
- Better image handoff
- Optional site-specific extractors (Zhihu, Substack, Medium, arXiv, etc.)
- Packaged Safari / iOS distribution if needed

## License

MIT
