function getArticle(_article_id){
  return `# 在浏览器里把 Markdown 渲染好，是怎样一件事

这篇文章本身，就是一次渲染能力的现场演示——你正在读的每一行，都由本站的 Markdown 管线（\`marked\` 解析 → 代码高亮 → \`DOMPurify\` 净化 → 挂载后增强）实时生成。下面从最朴素的文本，一路走到流程图与时序图。

> 工具的好坏，不在于它能做多少花样，而在于它把最常用的那几样做得够稳、够安静。

## 一、文本的基本功

正文里该有的强调都在：**加粗**用来立论点，*斜体*用来打节奏，\`行内代码\`用来指称符号，~~删除线~~用来留下修改的痕迹，还有指向外部的[链接](https://github.com/zibuyu2015831)。

中文排印上，标题用宋体（\`--font-display\`），正文用黑体，引号用「」而非英文直引号——这些是「有人校对过」的细节信号。

---

## 二、列表与表格

无序列表适合并列要点：

- 解析：把文本切成 token 树
- 净化：在 token 落地为 HTML 后做 XSS 兜底
- 增强：挂载后再补复制按钮、图表、锚点

有序列表适合讲步骤，并且可以嵌套：

1. 写下 Markdown
2. 交给管线
   1. 先解析
   2. 再净化
   3. 后增强
3. 在页面上看到结果

表格则适合做对比——比如本站管线与 VitePress 的取舍：

| 维度 | 本站（运行时 SPA） | VitePress（构建时 SSG） |
| --- | --- | --- |
| 渲染时机 | 浏览器实时渲染 | 构建期预渲染 |
| 内容来源 | 后端 / 接口 | 本地 \`.md\` 文件 |
| 动态能力 | 登录 / 评论 / 打赏 | 基本静态 |
| SEO 首屏 | 较弱 | 天然占优 |

## 三、代码高亮

代码块由 \`highlight.js\` 着色，右上角有「复制」按钮（hover 代码块时浮现）。支持多语言：

\`\`\`javascript
// 把 Markdown 渲染为安全的 HTML
const html = sanitizeArticleContent(marked.parse(source));
\`\`\`

\`\`\`python
def fib(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
\`\`\`

\`\`\`bash
npm run build   # 构建，Mermaid 会被拆为独立异步 chunk
\`\`\`

## 四、用图说话：Mermaid

复杂的关系，一张图胜过十行字。Mermaid 图块在挂载后渲染为 SVG，并随昼夜主题自动换色。

### 流程图

\`\`\`mermaid
flowchart TD
    A[Markdown 源文本] --> B[marked 解析为 token]
    B --> C{含 mermaid 块?}
    C -- 是 --> D[输出纯文本占位]
    C -- 否 --> E[常规高亮 / 渲染]
    D --> F[DOMPurify 净化]
    E --> F
    F --> G[挂载到 DOM]
    G --> H[占位渲染为 SVG]
\`\`\`

### 时序图

\`\`\`mermaid
sequenceDiagram
    participant 读者
    participant 页面
    participant 管线
    读者->>页面: 打开文章
    页面->>管线: 传入 Markdown
    管线->>管线: 解析 → 净化 → 增强
    管线-->>页面: 返回安全 HTML
    页面-->>读者: 呈现 + 渲染图表
\`\`\`

### 类图

\`\`\`mermaid
classDiagram
    class 渲染管线 {
      +parse(src) tokens
      +sanitize(html) html
      +enhance(dom) void
    }
    class 提示框扩展
    class Mermaid扩展
    渲染管线 <|-- 提示框扩展
    渲染管线 <|-- Mermaid扩展
\`\`\`

## 五、提示框

用容器把「旁白」与正文分开，各司其职：

::: tip 提示
善用提示框，能让关键信息从正文里「跳出来」，但别滥用——满屏都是框，等于没有框。
:::

::: info 信息
本站提示框沿用 VitePress 的 \`:::\` 语法，容器内支持完整 Markdown：列表、代码、**强调**都行。
:::

::: warning 注意
渲染第三方或大模型输出时，务必保留净化环节；本演示为作者自有内容，风险较低。
:::

::: danger 警告
切勿为了「让某段 HTML 生效」而关闭 \`DOMPurify\`——这是一道不该省的保险。
:::

::: details 点开看：管线的三段职责
1. **解析**：\`marked\` 把文本变成结构化 token，自定义扩展在此截获 \`:::\` 容器与 mermaid 代码块。
2. **净化**：\`DOMPurify\` 按白名单清洗，挡住 \`<script>\`、\`onerror=\` 等注入。
3. **增强**：挂载后再补复制按钮、Mermaid SVG、标题锚点——这些都绕开 \`v-html\`。
:::

## 六、稳定锚点与配图

每个标题都带一个可读、稳定的锚点（鼠标移到标题上会显形「#」），点击即可复制深链、定位到某一节——刷新或分享都不会失效。

![示例配图：图片居中展示，下方自动生成图注](https://picsum.photos/seed/ziyue/900/380)

## 小结

一套好的渲染管线，应当**默认安全、按需增强、克制呈现**。把文本、代码、表格、图表、提示框这些日常元素都稳稳托住，剩下的，就交给内容本身。

> 把最常用的几样做到够稳够安静，工具便隐身了，只剩下你想表达的东西。`
}

 function getArticleHeads(markdown){
  // Split the markdown content by lines and trim each line
  const lines = markdown.split('\n').map(line => line.trim());
  // Object to store titles with their hierarchy
  const titles = [];
  // Variables to keep track of current position in the hierarchy
  let currentH1 = null;
  let currentH2 = null;
  // Regex patterns for headers
  const h1Pattern = /^# (.*)/;
  const h2Pattern = /^## (.*)/;
  const h3Pattern = /^### (.*)/;
  lines.forEach(line => {
    const h1Match = h1Pattern.exec(line);
    const h2Match = h2Pattern.exec(line);
    const h3Match = h3Pattern.exec(line);
    if (h1Match) {
      currentH1 = { title: h1Match[1], level: 1, children: [] };
      titles.push(currentH1);
      currentH2 = null;  // Reset currentH2 when a new H1 is encountered
    } else if (h2Match) {
      if (currentH1) {  // Ensure there is an H1 to attach this H2 to
        currentH2 = { title: h2Match[1], level: 2, children: [] };
        currentH1.children.push(currentH2);
      }
    } else if (h3Match) {
      if (currentH2) {  // Ensure there is an H2 to attach this H3 to
        const currentH3 = { title: h3Match[1], level: 3 };
        currentH2.children.push(currentH3);
      }
    }
  });
  return titles;
}
export{
  getArticle,
  getArticleHeads,
}
