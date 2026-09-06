# Architecture

Page2GPT intentionally keeps the first release small and local-first.

```text
Current browser tab
      │
      ▼
content.js
  ├─ WeChat-specific extractor
  └─ generic article heuristic
      │
      ▼
normalized article object
      │
      ▼
shared.js
  ├─ Markdown formatter
  └─ prompt builder + prompt-injection boundary
      │
      ▼
popup.js
  ├─ Copy Markdown
  └─ Copy prompt + open ChatGPT
```

## Privacy model

- No backend.
- No OpenAI API key.
- No page history.
- No persistent storage.
- `activeTab` access is used only after the user clicks the extension.
- The extracted page is copied to the local clipboard only when the user requests it.

## Extractor strategy

### WeChat

For `mp.weixin.qq.com`, Page2GPT prioritizes known article containers such as `#js_content` and metadata nodes such as `#activity-name`, `#js_name`, and `#publish_time`.

### Generic pages

For other sites, Page2GPT scores likely article containers (`article`, `main`, `.post-content`, etc.) using text length, paragraph count, heading count, and link density.

A later release can replace or augment the generic heuristic with Mozilla Readability without changing the popup or ChatGPT bridge.

## ChatGPT bridge

The MVP does **not** inject text into ChatGPT's DOM. UI automation would be brittle and could break whenever ChatGPT changes its frontend. Instead, the extension copies a complete prompt to the clipboard and opens `chatgpt.com` in a new tab.
