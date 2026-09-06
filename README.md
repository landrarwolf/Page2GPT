# Page2GPT

**Browser → clean context → ChatGPT.**

Some webpages — especially WeChat Official Account articles — are perfectly readable in a user's browser but unavailable to server-side AI crawlers. Page2GPT bridges that gap by extracting the content **inside your browser**, converting it to clean Markdown, and preparing it for ChatGPT.

## What works in v0.1.0

- Dedicated WeChat Official Account extraction for `mp.weixin.qq.com`
- Generic article extraction for normal webpages
- Title, source/account, publish time, article body, links, and image URLs
- Clean Markdown export
- Prompt presets: **Deep analysis**, **Summary**, **Fact check**, and **No instruction**
- Prompt-injection boundary: webpage text is explicitly treated as untrusted source material
- **Send to ChatGPT** = copy the complete prompt locally + open ChatGPT
- No backend, API key, login, database, or browsing history
- Manifest V3 WebExtension designed for Chrome-family browsers and Safari

## Why the ChatGPT step uses the clipboard

The first release deliberately avoids automating ChatGPT's webpage DOM. A selector-based integration would be fragile whenever ChatGPT's frontend changes. The stable workflow is:

```text
webpage → Page2GPT → clean prompt copied locally → ChatGPT opens → paste
```

This also avoids putting long article content into a URL.

## Install — Chrome / Edge / Chromium

1. Download or clone this repository.
2. Open the browser's extension management page.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the `extension/` folder.
6. Open a webpage and click **Page2GPT** in the toolbar.

## Install — Safari on macOS

Recent Safari versions can temporarily load a WebExtension folder directly for development:

1. Open **Safari → Settings → Developer**.
2. Enable **Allow unsigned extensions** if required.
3. Click **Add Temporary Extension…**.
4. Select the `extension/` folder (or a zip of that folder).
5. Enable Page2GPT in Safari's Extensions settings.

Temporary Safari extensions are for development testing. For iPhone/iPad or App Store distribution, package the same `extension/` folder with Xcode's current Safari Web Extension packager:

```bash
xcrun safari-web-extension-packager ./extension
```

The packager creates an Xcode project for macOS/iOS Safari distribution.

## Use it with a WeChat article

Open a link such as:

```text
https://mp.weixin.qq.com/s/...
```

Then click Page2GPT. You should see:

- `WeChat article`
- the article title
- account / publish metadata when available
- extracted character count

Choose a prompt preset, then click **Send to ChatGPT**. Page2GPT copies the full prompt and opens ChatGPT. Paste with `⌘V` / `Ctrl+V`.

## Permissions

Page2GPT requests only:

- `activeTab` — temporary access to the page after you click the extension
- `scripting` — run the extractor in that active tab
- `clipboardWrite` — copy Markdown / the ChatGPT prompt when requested

There are no broad persistent host permissions in v0.1.0.

## Project structure

```text
Page2GPT/
├── extension/
│   ├── manifest.json
│   ├── content.js      # WeChat + generic DOM extraction
│   ├── shared.js       # Markdown + prompt formatting
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

No build step is required for v0.1.0.

```bash
npm run check
npm test
```

After editing extension files, reload the extension in your browser. For content-script changes, reload the target webpage too.

## Roadmap

- Better generic extraction (Readability adapter)
- Selection → Ask ChatGPT
- Multi-page context bundles
- Better image handoff
- Optional site-specific extractors (Zhihu, Substack, Medium, arXiv, etc.)
- Optional direct handoff mechanisms if a stable supported integration becomes available

## License

MIT
