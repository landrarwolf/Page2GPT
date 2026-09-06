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

- **Send to ChatGPT** — uses the already extracted page, copies the generated prompt, then opens ChatGPT.
- **Copy Markdown** — copies only the normalized page content.
- **Preview** — shows the exact Markdown that will be exported.
- Tampermonkey's menu also exposes the same core commands.

## iPhone / iPad clipboard behavior

Page2GPT v0.2.1 adds an iOS-specific clipboard path. Safari/WebKit requires clipboard writes to happen directly during a user gesture, so the userscript pre-extracts the article when the Page2GPT panel opens and performs the clipboard call immediately when **Send to ChatGPT** or **Copy Markdown** is tapped.

The script tries multiple compatible paths:

1. `navigator.clipboard.writeText()` during the tap gesture;
2. a selected-text `document.execCommand("copy")` fallback during the same gesture;
3. desktop userscript-manager clipboard APIs where appropriate.

On iOS, Page2GPT intentionally does **not** assume that `GM_setClipboard` succeeded. If automatic clipboard access is still blocked, Page2GPT keeps the current page open and shows a large selectable text box with **Copy again**, **Open ChatGPT**, and **Close** buttons. You can then use the standard iOS **Select All → Copy** command as the final fallback.

## Permissions

The userscript requests only userscript-manager capabilities for clipboard access, opening the ChatGPT tab, and registering menu commands. It does not send article content to a Page2GPT server and does not require an API key.

The script matches ordinary HTTP/HTTPS pages so the generic extractor can work across websites. You can narrow site permissions in your userscript manager if you only want to use it on WeChat.
