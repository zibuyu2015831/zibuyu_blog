/**
 * marked 提示框容器扩展（VitePress 风 ::: 语法）
 *
 * 语法：
 *   ::: tip 可选标题
 *   正文（支持完整 markdown）
 *   :::
 *
 * 支持类型：tip / info / warning / danger / details
 * 其中 details 渲染为可折叠的 <details>；其余渲染为 .custom-block.{type}。
 * 容器内文本经 this.lexer.blockTokens 递归解析，故内部可写列表、代码、强调等。
 * 仅做字符串转换，产物（div/p/details/summary/class）由 sanitize.js 白名单放行。
 */

// 已知类型 → 默认中文标题
const TYPE_TITLES = {
  tip: "提示",
  info: "信息",
  warning: "注意",
  danger: "警告",
  details: "详情",
};

export const admonitionExtension = {
  name: "admonition",
  level: "block",

  // 告诉 marked 下一个可能的容器起点，便于正确切分段落
  start(src) {
    const m = src.match(/^ {0,3}:::/m);
    return m ? m.index : undefined;
  },

  tokenizer(src) {
    // 开启 `::: type [标题]`，惰性匹配正文，直到独占一行的结束 `:::`
    // 容忍 0–3 个前导空格（与 CommonMark 缩进规则一致）
    const rule = /^ {0,3}:::[ \t]*([A-Za-z]+)[ \t]*([^\n]*)(?:\n([\s\S]*?))?\n {0,3}:::[ \t]*(?:\n|$)/;
    const match = rule.exec(src);
    if (!match) return undefined;

    const type = match[1].toLowerCase();
    // 非已知类型不接管，交回 marked 默认解析（避免误吞普通文本）
    if (!Object.prototype.hasOwnProperty.call(TYPE_TITLES, type)) return undefined;

    const title = (match[2] || "").trim() || TYPE_TITLES[type];
    const body = match[3] || "";

    const token = {
      type: "admonition",
      raw: match[0],
      admType: type,
      title,
      tokens: [],
    };
    // 递归解析容器内 markdown
    this.lexer.blockTokens(body, token.tokens);
    return token;
  },

  renderer(token) {
    const inner = this.parser.parse(token.tokens);
    if (token.admType === "details") {
      return `<details class="custom-block details"><summary>${token.title}</summary>\n${inner}</details>\n`;
    }
    return `<div class="custom-block ${token.admType}"><p class="custom-block-title">${token.title}</p>\n${inner}</div>\n`;
  },

  // 让 marked 的 walkTokens（含 markedHighlight）能下钻到容器内部的代码块等
  childTokens: ["tokens"],
};
