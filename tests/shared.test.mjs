import test from "node:test";
import assert from "node:assert/strict";

await import("../extension/shared.js");
const shared = globalThis.Page2GPTShared;

const article = {
  title: "A WeChat Test Article",
  source: "Example Account",
  publishedAt: "2026-09-06",
  url: "https://mp.weixin.qq.com/s/example",
  markdownBody: "## Claim\n\nThis is the body.",
  textLength: 20,
  extractor: "wechat"
};

test("articleToMarkdown preserves title, metadata, URL, and body", () => {
  const markdown = shared.articleToMarkdown(article);
  assert.match(markdown, /^# A WeChat Test Article/m);
  assert.match(markdown, /Source: Example Account/);
  assert.match(markdown, /https:\/\/mp\.weixin\.qq\.com\/s\/example/);
  assert.match(markdown, /## Claim/);
});

test("buildPrompt includes prompt-injection defense", () => {
  const prompt = shared.buildPrompt(article, "deep", "Focus on methodology");
  assert.match(prompt, /untrusted source material/i);
  assert.match(prompt, /Focus on methodology/);
  assert.match(prompt, /BEGIN EXTRACTED PAGE/);
});

test("normalizeWhitespace removes excessive blank lines", () => {
  assert.equal(shared.normalizeWhitespace("a\n\n\n\n b"), "a\n\nb");
});
