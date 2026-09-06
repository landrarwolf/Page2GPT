(function () {
  "use strict";

  if (globalThis.__PAGE2GPT_CONTENT_INSTALLED__) return;
  globalThis.__PAGE2GPT_CONTENT_INSTALLED__ = true;

  const api = globalThis.browser || globalThis.chrome;

  const SKIP_SELECTORS = [
    "script",
    "style",
    "noscript",
    "template",
    "svg",
    "canvas",
    "iframe",
    "nav",
    "footer",
    "aside",
    "form",
    "button",
    "input",
    "textarea",
    "select",
    "[hidden]",
    "[aria-hidden='true']",
    ".qr_code_pc",
    "#js_pc_qr_code",
    ".reward_area",
    ".rich_media_tool",
    ".js_ad_link",
    ".weui-desktop-popover",
    ".wx_follow_widget"
  ];

  const GENERIC_CANDIDATE_SELECTORS = [
    "article",
    "main",
    "[role='main']",
    ".article-content",
    ".article__content",
    ".post-content",
    ".post__content",
    ".entry-content",
    ".content-body",
    ".story-body",
    "#article-content",
    "#content"
  ];

  function cleanInline(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function absoluteUrl(value) {
    if (!value) return "";
    const raw = String(value).trim();
    if (!raw || raw.startsWith("data:") || raw.startsWith("javascript:")) return "";
    try {
      return new URL(raw, location.href).href;
    } catch (_) {
      return raw;
    }
  }

  function metaContent(selectors) {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      const value = node && (node.getAttribute("content") || node.textContent);
      if (cleanInline(value)) return cleanInline(value);
    }
    return "";
  }

  function firstText(selectors) {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      const value = node && cleanInline(node.textContent);
      if (value) return value;
    }
    return "";
  }

  function cloneAndClean(root) {
    const clone = root.cloneNode(true);
    for (const selector of SKIP_SELECTORS) {
      clone.querySelectorAll(selector).forEach((node) => node.remove());
    }
    clone.querySelectorAll("[style]").forEach((node) => {
      const style = String(node.getAttribute("style") || "").toLowerCase();
      if (/display\s*:\s*none|visibility\s*:\s*hidden/.test(style)) node.remove();
    });
    return clone;
  }

  function escapeMarkdownText(value) {
    return String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/([*_`])/g, "\\$1");
  }

  function inlineChildren(node) {
    return Array.from(node.childNodes).map(nodeToMarkdown).join("");
  }

  function nodeToMarkdown(node, listContext) {
    if (!node) return "";
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeMarkdownText(String(node.nodeValue || "").replace(/\s+/g, " "));
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return "";

    const el = node;
    const tag = el.tagName.toLowerCase();

    if (["script", "style", "noscript", "template", "svg", "canvas", "iframe"].includes(tag)) return "";

    if (tag === "br") return "\n";
    if (tag === "hr") return "\n\n---\n\n";

    if (/^h[1-6]$/.test(tag)) {
      const level = Number(tag[1]);
      const text = cleanInline(el.textContent);
      return text ? `\n\n${"#".repeat(level)} ${escapeMarkdownText(text)}\n\n` : "";
    }

    if (tag === "p") {
      const body = inlineChildren(el).trim();
      return body ? `\n\n${body}\n\n` : "";
    }

    if (tag === "strong" || tag === "b") {
      const body = inlineChildren(el).trim();
      return body ? `**${body}**` : "";
    }

    if (tag === "em" || tag === "i") {
      const body = inlineChildren(el).trim();
      return body ? `*${body}*` : "";
    }

    if (tag === "code") {
      const body = String(el.textContent || "").trim();
      return body ? `\`${body.replace(/`/g, "\\`")}\`` : "";
    }

    if (tag === "pre") {
      const body = String(el.textContent || "").trim();
      return body ? `\n\n\`\`\`\n${body}\n\`\`\`\n\n` : "";
    }

    if (tag === "blockquote") {
      const body = normalizeMarkdown(inlineChildren(el));
      return body ? `\n\n${body.split("\n").map((line) => `> ${line}`).join("\n")}\n\n` : "";
    }

    if (tag === "a") {
      const body = inlineChildren(el).trim() || cleanInline(el.textContent);
      const href = absoluteUrl(el.getAttribute("href"));
      if (!body) return "";
      if (!href || href === location.href) return body;
      return `[${body}](${href})`;
    }

    if (tag === "img") {
      const src = absoluteUrl(
        el.getAttribute("data-src") ||
          el.getAttribute("data-original") ||
          el.getAttribute("data-lazy-src") ||
          el.getAttribute("src")
      );
      if (!src) return "";
      const alt = cleanInline(el.getAttribute("alt")) || "image";
      return `\n\n![${escapeMarkdownText(alt)}](${src})\n\n`;
    }

    if (tag === "ul" || tag === "ol") {
      const ordered = tag === "ol";
      const items = Array.from(el.children)
        .filter((child) => child.tagName && child.tagName.toLowerCase() === "li")
        .map((child, index) => {
          const body = normalizeMarkdown(Array.from(child.childNodes).map((n) => nodeToMarkdown(n, { ordered })).join(""));
          if (!body) return "";
          const prefix = ordered ? `${index + 1}. ` : "- ";
          return `${prefix}${body.replace(/\n/g, "\n  ")}`;
        })
        .filter(Boolean)
        .join("\n");
      return items ? `\n\n${items}\n\n` : "";
    }

    if (tag === "li") {
      const body = normalizeMarkdown(inlineChildren(el));
      const prefix = listContext && listContext.ordered ? "1. " : "- ";
      return body ? `${prefix}${body}\n` : "";
    }

    if (tag === "table") {
      const rows = Array.from(el.querySelectorAll("tr"))
        .map((row) =>
          Array.from(row.querySelectorAll(":scope > th, :scope > td"))
            .map((cell) => cleanInline(cell.textContent))
            .filter(Boolean)
            .join(" | ")
        )
        .filter(Boolean);
      return rows.length ? `\n\n${rows.join("\n")}\n\n` : "";
    }

    if (["div", "section", "article", "main", "figure", "figcaption"].includes(tag)) {
      const body = inlineChildren(el);
      return body ? `\n${body}\n` : "";
    }

    return inlineChildren(el);
  }

  function normalizeMarkdown(value) {
    return String(value || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^ +| +$/gm, "")
      .trim();
  }

  function rootToMarkdown(root) {
    return normalizeMarkdown(nodeToMarkdown(cloneAndClean(root)));
  }

  function collectImages(root) {
    const seen = new Set();
    const images = [];
    root.querySelectorAll("img").forEach((img) => {
      const url = absoluteUrl(
        img.getAttribute("data-src") ||
          img.getAttribute("data-original") ||
          img.getAttribute("data-lazy-src") ||
          img.getAttribute("src")
      );
      if (url && !seen.has(url)) {
        seen.add(url);
        images.push(url);
      }
    });
    return images;
  }

  function extractWeChat() {
    const root = document.querySelector("#js_content, .rich_media_content");
    if (!root) return null;

    const title =
      firstText(["#activity-name", ".rich_media_title", "h1"]) ||
      metaContent(["meta[property='og:title']"]) ||
      document.title;

    const source = firstText(["#js_name", ".rich_media_meta_nickname", ".wx_follow_nickname"]);
    const publishedAt =
      firstText(["#publish_time", ".rich_media_meta_text"] ) ||
      metaContent(["meta[property='article:published_time']"]);
    const author = metaContent(["meta[name='author']"]);
    const markdownBody = rootToMarkdown(root);
    const textLength = cleanInline(root.textContent).length;
    const warnings = [];
    if (textLength < 80) warnings.push("The extracted WeChat body is unusually short.");

    return {
      title,
      source,
      author,
      publishedAt,
      url: location.href,
      markdownBody,
      textLength,
      extractor: "wechat",
      images: collectImages(root),
      warnings
    };
  }

  function scoreCandidate(el) {
    if (!el) return -Infinity;
    const text = cleanInline(el.textContent);
    const paragraphCount = el.querySelectorAll("p").length;
    const headingCount = el.querySelectorAll("h1,h2,h3,h4").length;
    const linkText = Array.from(el.querySelectorAll("a"))
      .map((a) => cleanInline(a.textContent).length)
      .reduce((a, b) => a + b, 0);
    return text.length + paragraphCount * 120 + headingCount * 80 - Math.min(linkText, text.length) * 0.35;
  }

  function chooseGenericRoot() {
    const candidates = [];
    for (const selector of GENERIC_CANDIDATE_SELECTORS) {
      document.querySelectorAll(selector).forEach((el) => candidates.push(el));
    }
    if (!candidates.length) return document.body;
    candidates.sort((a, b) => scoreCandidate(b) - scoreCandidate(a));
    return candidates[0] || document.body;
  }

  function extractGeneric() {
    const root = chooseGenericRoot();
    if (!root) throw new Error("No readable document body found.");

    const title =
      metaContent(["meta[property='og:title']", "meta[name='twitter:title']"]) ||
      firstText(["article h1", "main h1", "h1"]) ||
      document.title;
    const author = metaContent([
      "meta[name='author']",
      "meta[property='article:author']",
      "meta[name='byl']"
    ]);
    const publishedAt =
      metaContent(["meta[property='article:published_time']", "meta[name='date']", "meta[name='pubdate']"]) ||
      firstText(["time[datetime]", "time"]);
    const source = metaContent(["meta[property='og:site_name']"]) || location.hostname;
    const markdownBody = rootToMarkdown(root);
    const textLength = cleanInline(root.textContent).length;
    const warnings = [];
    if (textLength < 120) warnings.push("The selected generic article body is unusually short.");

    return {
      title,
      source,
      author,
      publishedAt,
      url: location.href,
      markdownBody,
      textLength,
      extractor: "generic",
      images: collectImages(root),
      warnings
    };
  }

  function extractCurrentPage() {
    if (location.hostname === "mp.weixin.qq.com") {
      return extractWeChat() || extractGeneric();
    }
    return extractGeneric();
  }

  globalThis.Page2GPTContent = { extractCurrentPage, extractWeChat, extractGeneric, rootToMarkdown };

  if (api && api.runtime && api.runtime.onMessage) api.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || message.type !== "PAGE2GPT_EXTRACT") return undefined;
    try {
      sendResponse({ ok: true, article: extractCurrentPage() });
    } catch (error) {
      sendResponse({ ok: false, error: error && error.message ? error.message : String(error) });
    }
    return true;
  });
})();
