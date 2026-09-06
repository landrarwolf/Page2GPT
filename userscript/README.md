# Page2GPT Userscript

This is the Tampermonkey / userscript build of Page2GPT.

## Install

1. Install Tampermonkey (or another compatible userscript manager).
2. Open the raw script URL:

   `https://raw.githubusercontent.com/landrarwolf/Page2GPT/main/userscript/Page2GPT.user.js`

3. Confirm installation.
4. Open a WeChat Official Account article or any ordinary webpage.
5. Click the **Page2GPT** pill in the bottom-right corner.

## Actions

- **Send to ChatGPT** — extracts the page, builds a prompt, copies it, and opens ChatGPT.
- **Copy Markdown** — copies only the normalized page content.
- **Preview** — shows the exact Markdown that will be exported.
- Tampermonkey's menu also exposes the same core commands.

## Permissions

The userscript requests only userscript-manager capabilities for clipboard access, opening the ChatGPT tab, and registering menu commands. It does not send article content to a Page2GPT server and does not require an API key.

The script matches ordinary HTTP/HTTPS pages so the generic extractor can work across websites. You can narrow site permissions in your userscript manager if you only want to use it on WeChat.
