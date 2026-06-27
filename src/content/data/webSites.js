/**
 * 网址导航数据 · 方向 A「子曰·墨」
 *
 * ⚠️ 示例数据，可替换：以下为常用站点示例，按分类组织，
 *    后续可直接增删站点或调整分类，无需改动组件代码。
 *
 * 字段说明：
 *   title    站点名称（必填）
 *   desc     一句话描述（必填，卡片最多展示两行）
 *   url      跳转地址（必填，整卡点击 → 新标签打开）
 *   favicon  可选；不填则按域名自动取图，再回退首字母色块
 *   category 分类名（用于分组与分区标题）
 *
 * recommended: 是否进入「推荐」分区
 */

/** @typedef {{ title: string, desc: string, url: string, favicon?: string, category: string, recommended?: boolean }} WebSiteItem */

/** @type {WebSiteItem[]} */
export const webSites = [
  // ---------- 开发 ----------
  {
    title: "GitHub",
    desc: "全球最大的代码托管与开源协作平台。",
    url: "https://github.com",
    category: "开发",
    recommended: true,
  },
  {
    title: "MDN Web Docs",
    desc: "前端最权威的 HTML / CSS / JavaScript 文档。",
    url: "https://developer.mozilla.org",
    category: "开发",
    recommended: true,
  },
  {
    title: "Vue.js",
    desc: "渐进式 JavaScript 框架官方文档与生态。",
    url: "https://vuejs.org",
    category: "开发",
    recommended: true,
  },
  {
    title: "Vite",
    desc: "下一代前端构建工具，极速冷启动与热更新。",
    url: "https://vitejs.dev",
    category: "开发",
  },
  {
    title: "Stack Overflow",
    desc: "程序员问答社区，几乎能搜到一切报错。",
    url: "https://stackoverflow.com",
    category: "开发",
  },
  {
    title: "npm",
    desc: "Node.js 包管理器与海量开源依赖仓库。",
    url: "https://www.npmjs.com",
    category: "开发",
  },

  // ---------- 设计 ----------
  {
    title: "Dribbble",
    desc: "设计师作品社区，灵感与配色的聚集地。",
    url: "https://dribbble.com",
    category: "设计",
    recommended: true,
  },
  {
    title: "Figma",
    desc: "协作式界面设计工具，浏览器即可上手。",
    url: "https://www.figma.com",
    category: "设计",
    recommended: true,
  },
  {
    title: "Coolors",
    desc: "快速生成与探索配色方案的在线工具。",
    url: "https://coolors.co",
    category: "设计",
  },
  {
    title: "Unsplash",
    desc: "高质量免费可商用图片素材库。",
    url: "https://unsplash.com",
    category: "设计",
  },

  // ---------- 社区 ----------
  {
    title: "V2EX",
    desc: "创意工作者们的社区，技术与生活兼谈。",
    url: "https://www.v2ex.com",
    category: "社区",
  },
  {
    title: "掘金",
    desc: "面向开发者的中文技术内容分享社区。",
    url: "https://juejin.cn",
    category: "社区",
  },
  {
    title: "Hacker News",
    desc: "Y Combinator 旗下的科技创业资讯社区。",
    url: "https://news.ycombinator.com",
    category: "社区",
  },
  {
    title: "知乎",
    desc: "中文问答社区，认真你就赢了。",
    url: "https://www.zhihu.com",
    category: "社区",
  },

  // ---------- AI ----------
  {
    title: "OpenAI",
    desc: "ChatGPT 与 GPT 系列模型的官方平台。",
    url: "https://openai.com",
    category: "AI",
    recommended: true,
  },
  {
    title: "Hugging Face",
    desc: "开源模型、数据集与 AI 应用的聚合社区。",
    url: "https://huggingface.co",
    category: "AI",
  },
  {
    title: "Claude",
    desc: "Anthropic 出品的对话式 AI 助手。",
    url: "https://claude.ai",
    category: "AI",
  },
  {
    title: "Poe",
    desc: "聚合多家大模型的对话平台。",
    url: "https://poe.com",
    category: "AI",
  },

  // ---------- 工具 ----------
  {
    title: "Can I use",
    desc: "查询前端特性在各浏览器的兼容性。",
    url: "https://caniuse.com",
    category: "工具",
  },
  {
    title: "TinyPNG",
    desc: "智能压缩 PNG / JPEG 图片，体积更小。",
    url: "https://tinypng.com",
    category: "工具",
  },
  {
    title: "Carbon",
    desc: "把代码片段渲染成漂亮的分享图。",
    url: "https://carbon.now.sh",
    category: "工具",
  },
];

/** 分类展示顺序 */
export const categoryOrder = ["开发", "设计", "社区", "AI", "工具"];

/** 推荐站点（用于「推荐」分区） */
export const recommendedSites = webSites.filter((site) => site.recommended);

/**
 * 按分类分组后的站点列表，遵循 categoryOrder 顺序。
 * @returns {{ category: string, sites: WebSiteItem[] }[]}
 */
export const groupedSites = categoryOrder
  .map((category) => ({
    category,
    sites: webSites.filter((site) => site.category === category),
  }))
  .filter((group) => group.sites.length > 0);
