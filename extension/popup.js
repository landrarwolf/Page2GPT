(function () {
  "use strict";

  const ext = globalThis.browser || globalThis.chrome;
  const shared = globalThis.Page2GPTShared;
  let article = null;

  const els = {};

  document.addEventListener("DOMContentLoaded", async () => {
    [
      "statusPill",
      "charCount",
      "articleTitle",
      "articleMeta",
      "warningText",
      "mode",
      "extraInstruction",
      "sendButton",
      "copyButton",
      "previewButton",
      "previewPanel",
      "previewText",
      "closePreview",
      "actionHint"
    ].forEach((id) => (els[id] = document.getElementById(id)));

    els.sendButton.addEventListener("click", sendToChatGPT);
    els.copyButton.addEventListener("click", copyMarkdown);
    els.previewButton.addEventListener("click", showPreview);
    els.closePreview.addEventListener("click", () => els.previewPanel.classList.add("hidden"));

    await extractCurrentPage();
  });

  async function getActiveTab() {
    const tabs = await ext.tabs.query({ active: true, currentWindow: true });
    return tabs && tabs[0];
  }

  async function ensureContentScript(tabId) {
    if (!ext.scripting || !ext.scripting.executeScript) {
      throw new Error("This browser does not expose the WebExtension scripting API required by Page2GPT.");
    }
    await ext.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  }

  async function extractCurrentPage() {
    setLoading();
    try {
      const tab = await getActiveTab();
      if (!tab || typeof tab.id !== "number") throw new Error("No active webpage tab found.");

      await ensureContentScript(tab.id);
      const response = await ext.tabs.sendMessage(tab.id, { type: "PAGE2GPT_EXTRACT" });
      if (!response || !response.ok) {
        throw new Error((response && response.error) || "The page did not return extractable content.");
      }

      article = shared.normalizeArticle(response.article);
      renderArticle(article);
    } catch (error) {
      setError(error && error.message ? error.message : String(error));
    }
  }

  function setLoading() {
    els.statusPill.className = "pill loading";
    els.statusPill.textContent = "Extracting…";
    els.articleTitle.textContent = "Reading current page…";
    els.articleMeta.textContent = "";
    els.charCount.textContent = "";
    els.warningText.classList.add("hidden");
    [els.sendButton, els.copyButton, els.previewButton].forEach((button) => (button.disabled = true));
  }

  function setError(message) {
    article = null;
    els.statusPill.className = "pill error";
    els.statusPill.textContent = "Unavailable";
    els.articleTitle.textContent = "Could not read this page";
    els.articleMeta.textContent = message;
    els.charCount.textContent = "";
    [els.sendButton, els.copyButton, els.previewButton].forEach((button) => (button.disabled = true));
  }

  function renderArticle(a) {
    els.statusPill.className = "pill success";
    els.statusPill.textContent = a.extractor === "wechat" ? "WeChat article" : "Web page";
    els.articleTitle.textContent = a.title;
    const meta = [a.source, a.publishedAt].filter(Boolean).join(" · ");
    els.articleMeta.textContent = meta || a.url;
    els.charCount.textContent = `${Math.max(a.textLength, a.markdownBody.length).toLocaleString()} chars`;

    if (a.warnings.length) {
      els.warningText.textContent = a.warnings.join(" ");
      els.warningText.classList.remove("hidden");
    } else {
      els.warningText.classList.add("hidden");
    }

    [els.sendButton, els.copyButton, els.previewButton].forEach((button) => (button.disabled = false));
  }

  async function writeClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      textarea.remove();
      if (!ok) throw new Error("Clipboard access was denied by the browser.");
    }
  }

  async function sendToChatGPT() {
    if (!article) return;
    try {
      const prompt = shared.buildPrompt(article, els.mode.value, els.extraInstruction.value);
      await writeClipboard(prompt);
      els.sendButton.textContent = "Copied — opening ChatGPT…";
      els.actionHint.textContent = "Paste into ChatGPT with ⌘V / Ctrl+V. The article never passes through a Page2GPT server.";
      await ext.tabs.create({ url: "https://chatgpt.com/" });
      setTimeout(() => (els.sendButton.textContent = "Send to ChatGPT"), 1200);
    } catch (error) {
      els.actionHint.textContent = error && error.message ? error.message : String(error);
    }
  }

  async function copyMarkdown() {
    if (!article) return;
    try {
      await writeClipboard(shared.articleToMarkdown(article));
      const original = els.copyButton.textContent;
      els.copyButton.textContent = "Copied ✓";
      setTimeout(() => (els.copyButton.textContent = original), 1000);
    } catch (error) {
      els.actionHint.textContent = error && error.message ? error.message : String(error);
    }
  }

  function showPreview() {
    if (!article) return;
    els.previewText.value = shared.articleToMarkdown(article);
    els.previewPanel.classList.remove("hidden");
  }
})();
