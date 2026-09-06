# Page2GPT

**Send the page you can read to the AI that cannot fetch it.**

Page2GPT is a privacy-first browser extension that extracts the meaningful content of the page currently open in your browser, turns it into clean Markdown, and prepares it for ChatGPT.

The initial motivation is simple: some pages—especially **WeChat Official Account (`mp.weixin.qq.com`) articles**—open normally in a user's browser but are unavailable to server-side AI crawlers. Page2GPT bridges that gap by reading the page **locally from the browser DOM**.

## What it does

- Detects WeChat Official Account articles and uses a WeChat-specific extractor.
- Falls back to a generic article extractor for ordinary pages.
- Preserves useful structure such as headings, paragraphs, lists, links, bold text, blockquotes, and image URLs.
- Removes hidden elements, scripts, styles, common WeChat UI noise, QR-code sections, and unrelated controls.
- Produces clean Markdown with title, source/account, publication time, URL, and article content.
- Offers four prompt modes:
  - **Deep analysis** — key claims, reasoning, fact/opinion separation, weaknesses, and what matters.
  - **Summary** — concise structured summary.
  - **Fact check** — claims that should be verified and why.
  - **No instruction** — only the extracted article context.
- **Send to ChatGPT** copies the complete prompt to the clipboard and opens ChatGPT.
- **Copy Markdown** copies only the normalized article.
- **Preview** shows exactly what will be exported.

## Privacy

Page2GPT v0.1.0 has:

- no backend;
- no OpenAI API key;
- no analytics;
- no account system;
- no cloud storage.

Extraction and formatting happen locally in your browser. The extension uses the minimal permissions needed for the MVP: `activeTab`, `scripting`, and `clipboardWrite`.

## Install

### Chrome / Edge / Chromium

1. Clone or download this repository.
2. Open the browser's Extensions page.
3. Enable **Developer mode**.
4. Choose **Load unpacked**.
5. Select the `extension/` directory.
6. Open a webpage and click the Page2GPT extension.

### Safari on macOS

Recent Safari versions can load a WebExtension folder for local development/testing. Point Safari's Web Extension development workflow at the `extension/` directory. For App Store distribution or iOS/iPadOS packaging, use Apple's Safari Web Extension tooling in Xcode.

## Try it on WeChat

Open a URL such as:

```text
https://mp.weixin.qq.com/s/...
```

Then click Page2GPT. The popup should identify it as a WeChat article, show the title, and enable export actions.

## Architecture

```text
Current browser tab
      │
      ▼
content.js
      │
      ├── WeChat extractor
      └── Generic extractor
      │
      ▼
Normalized Article
      │
      ├── Markdown formatter
      └── Prompt formatter
      │
      ▼
popup.js
      │
      ├── Copy Markdown
      ├── Preview
      └── Send to ChatGPT
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for implementation details.

## Development

The MVP intentionally uses plain JavaScript and Manifest V3. There is no framework and no build step.

Run the tests with:

```bash
npm test
```

The test fixture covers the most important WeChat DOM-cleaning and Markdown-formatting behavior.

## Roadmap

- [x] WeChat Official Account extraction
- [x] Generic webpage extraction
- [x] Markdown export
- [x] Prompt presets
- [x] Open ChatGPT + copy context
- [ ] Stronger generic readability heuristics
- [ ] Selection-only export from the context menu
- [ ] Optional image handoff
- [ ] Site adapters for Zhihu / Substack / Medium / paper pages
- [ ] Multi-page collection and combined handoff
- [ ] Packaged Safari app / iOS extension

## Design principle

Page2GPT does **not** try to become another AI client. The browser is responsible for accessing content the user can already see; ChatGPT remains responsible for understanding, verification, and follow-up reasoning.

## License

MIT
