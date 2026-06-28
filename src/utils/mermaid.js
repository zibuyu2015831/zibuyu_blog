/**
 * Mermaid 图渲染（两段式：marked 占位 + 挂载后注入）
 *
 * 设计要点 / 安全：
 * - marked 阶段：mermaidExtension 把 ```mermaid 块转成纯文本占位
 *   `<pre class="mermaid-src">源码</pre>`。纯文本 + pre/class 能安全穿过
 *   DOMPurify（ARTICLE_CONFIG 白名单），故无需为 SVG 放开 sanitize 白名单。
 * - 挂载阶段：renderMermaidBlocks 读取占位里的源码，调用 mermaid 生成 SVG，
 *   直接写入 DOM（不经 v-html / DOMPurify）。文章为作者自有内容，叠加 mermaid
 *   `securityLevel:'strict'`，XSS 姿态不降。
 * - mermaid 库较大（数百 KB），用动态 import 拆为独立异步 chunk，且仅当页面
 *   真的含图块时才加载——无图文章零额外开销。
 */

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------- marked 阶段：把 ```mermaid 截获为占位 ----------
export const mermaidExtension = {
  name: "mermaid",
  level: "block",

  start(src) {
    const m = src.match(/^ {0,3}```mermaid/m);
    return m ? m.index : undefined;
  },

  tokenizer(src) {
    // 必须优先于内置 fences——marked 自定义 block tokenizer 先于内置规则执行
    const rule = /^ {0,3}```mermaid[^\n]*\n([\s\S]*?)\n {0,3}```[ \t]*(?:\n|$)/;
    const match = rule.exec(src);
    if (!match) return undefined;
    return { type: "mermaid", raw: match[0], text: match[1] };
  },

  renderer(token) {
    return `<pre class="mermaid-src">${escapeHtml(token.text)}</pre>\n`;
  },
};

// ---------- 挂载阶段：占位 → SVG ----------

let mermaidPromise = null;
function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => m.default || m);
  }
  return mermaidPromise;
}

// 「子曰·墨」主题变量映射（base 主题 + themeVariables，明暗各一套）
function mermaidConfig(theme) {
  const isDark = theme === "dark";
  const serif = '"Noto Serif SC", "Songti SC", serif';
  return {
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    fontFamily: serif,
    themeVariables: isDark
      ? {
          background: "transparent",
          primaryColor: "#3A211C",
          primaryTextColor: "#EDE6D8",
          primaryBorderColor: "#E06A5E",
          lineColor: "#A89E8C",
          secondaryColor: "#1F1A14",
          tertiaryColor: "#15120E",
          fontFamily: serif,
        }
      : {
          background: "transparent",
          primaryColor: "#F6E3DF",
          primaryTextColor: "#3A2A1E",
          primaryBorderColor: "#C8453B",
          lineColor: "#6B6356",
          secondaryColor: "#FBF7EF",
          tertiaryColor: "#FFFDF8",
          fontFamily: serif,
        },
  };
}

let renderSeq = 0;

/**
 * 把容器内所有 Mermaid 占位 / 已渲染块按当前主题（重新）渲染成 SVG。
 * 无占位时直接返回，连 mermaid 库都不会加载。
 * @param {HTMLElement|null} container 文章正文容器
 * @param {'light'|'dark'} theme 当前主题
 */
export async function renderMermaidBlocks(container, theme) {
  if (!container) return;
  // 首次渲染读 pre.mermaid-src 的源码；主题重渲读 .mermaid-block 的 data-src
  const blocks = container.querySelectorAll("pre.mermaid-src, .mermaid-block");
  if (!blocks.length) return;

  let mermaid;
  try {
    mermaid = await loadMermaid();
  } catch {
    return; // 加载失败：保留源码占位，不阻断页面
  }
  mermaid.initialize(mermaidConfig(theme));

  for (const el of blocks) {
    const src = el.classList.contains("mermaid-block")
      ? el.getAttribute("data-src")
      : el.textContent;
    if (!src || !src.trim()) continue;

    const id = `mermaid-svg-${renderSeq++}`;
    try {
      const { svg } = await mermaid.render(id, src);
      const wrapper = document.createElement("div");
      wrapper.className = "mermaid-block";
      wrapper.setAttribute("data-src", src);
      wrapper.innerHTML = svg;
      el.replaceWith(wrapper);
    } catch (err) {
      // 语法错误等：降级为可见源码 + 错误标记，不白屏
      const pre = document.createElement("pre");
      pre.className = "mermaid-src mermaid-error";
      pre.setAttribute("data-error", (err && err.message) ? String(err.message).slice(0, 120) : "Mermaid 渲染失败");
      pre.textContent = src;
      el.replaceWith(pre);
    }
  }
}
