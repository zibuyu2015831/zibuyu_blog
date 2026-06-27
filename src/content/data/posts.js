// 文章列表示例数据（可替换为后端接口返回）。
// 字段约定：id 文章标识 / title 标题 / abstract 摘要 / category 分类 /
//          date 日期 / views 浏览量 / likes 点赞数 / cover 可选封面图 URL。
export const posts = [
  {
    id: 1,
    title: "从零实现一个 Vue3 响应式系统",
    abstract:
      "手写 reactive / effect，理解依赖收集与触发更新的全过程，看清框架背后的那点魔法。",
    category: "前端",
    date: "2026-06-20",
    views: 1213,
    likes: 86,
  },
  {
    id: 2,
    title: "设计令牌：让你的 CSS 不再失控",
    abstract:
      "17 种强调色、15 种字号是怎么一步步失控的，以及如何用三层令牌把它们重新收敛。",
    category: "设计",
    date: "2026-06-12",
    views: 2108,
    likes: 154,
  },
  {
    id: 3,
    title: "用 Pinia 管理主题切换的几种姿势",
    abstract:
      "订阅 store、动态 import 样式、localStorage 持久化——昼夜主题背后的取舍与权衡。",
    category: "前端",
    date: "2026-06-03",
    views: 980,
    likes: 61,
  },
  {
    id: 4,
    title: "子不语怪力乱神：一句话的现代解读",
    abstract: "理性不是冷漠，而是把有限的注意力，留给那些可以被理解、被验证的事物。",
    category: "随笔",
    date: "2026-05-25",
    views: 1502,
    likes: 203,
  },
  {
    id: 5,
    title: "LLM 流式输出的前端实现",
    abstract:
      "从 fetch 流到逐字渲染，处理中断、错误与 markdown 增量，做出顺滑的打字机体验。",
    category: "AI",
    date: "2026-05-18",
    views: 3007,
    likes: 271,
  },
  {
    id: 6,
    title: "我的 2026 工具清单",
    abstract: "编辑器、终端、效率工具，以及一点点让日常开发更有仪式感的小东西。",
    category: "效率",
    date: "2026-05-10",
    views: 762,
    likes: 48,
  },
];

export default posts;
