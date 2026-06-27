# UI 设计规范（系统骨架）

> 这是供**后续开发长期遵循**的规范。它定义系统的**结构与尺度**——令牌架构、排版/间距/圆角/阴影/动效阶梯、组件约定、暗色策略、响应式、可访问性。
>
> ⚠️ **与具体「视觉风格」解耦**：本规范定的是骨架与默认值。**品牌主色、字体家族、灰阶的最终十六进制取值，在 [04-design-directions.md](./04-design-directions.md) 选定方向后填入「待定」标记处。** 这样换方向不动骨架。
>
> ✅ **已选定方向 A · 子曰·墨**。下方「待定」处的具体取值见 [06-tokens-A-quiet-ink.md](./06-tokens-A-quiet-ink.md)（语义令牌、字体、现有变量映射的最终实现表）。本文继续作为「系统骨架/约定」参考，06 号为「方向 A 的具体实例」。

---

## 0. 设计原则

1. **内容优先**：每个元素都要 earn its place，空白用构图解决，不靠装饰填充。
2. **单一主色贯穿**：1 主色 + 语义色 + 灰阶。不凭空发明新颜色。
3. **8pt 节奏**：所有间距是 4 的倍数、优先 8 的倍数。
4. **一处做到 120%，其余 80%**：把精致集中在签名细节（如文章排版、昼夜切换），不平均用力。
5. **暗色是一等公民**：每个令牌都有明/暗两值，不是事后补丁。
6. **可访问**：正文对比度 ≥ 4.5:1，可聚焦元素有可见 focus 态。

---

## 1. 令牌架构（三层）

详见 [02-token-audit.md](./02-token-audit.md) 第四节。落地形态建议新建 `src/assets/css/tokens.css`：

```css
/* 第 1 层：原始令牌（明暗共用的纯数值） */
:root {
  /* —— 间距 8pt —— */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;

  /* —— 圆角 —— */
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px;
  --radius-xl: 16px; --radius-full: 9999px;

  /* —— 字号（1.25 模数，base 16） —— */
  --font-size-xs: 12px;  --font-size-sm: 14px;  --font-size-base: 16px;
  --font-size-lg: 18px;  --font-size-xl: 20px;  --font-size-2xl: 24px;
  --font-size-3xl: 30px; --font-size-4xl: 36px; --font-size-5xl: 48px;

  /* —— 行高 —— */
  --leading-tight: 1.25; --leading-normal: 1.5; --leading-relaxed: 1.75;

  /* —— 字重 —— */
  --weight-normal: 400; --weight-medium: 500;
  --weight-semibold: 600; --weight-bold: 700;

  /* —— 动效 —— */
  --motion-fast: 150ms; --motion-normal: 250ms; --motion-slow: 400ms;
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);

  /* —— 层级 z-index —— */
  --z-base: 1; --z-sticky: 100; --z-nav: 900;
  --z-overlay: 1000; --z-modal: 1100; --z-toast: 1200;
}

/* 第 2 层：语义令牌（主题在此切换） */
html.light {
  /* ✅ 方向 A 取值（完整版见 06-tokens-A-quiet-ink.md） */
  --color-primary:        #C8453B;  /* 朱砂 */
  --color-primary-hover:  #A8362E;
  --color-primary-subtle: #F6E3DF;

  --color-bg-default:  #FBF7EF;   /* 宣纸 */
  --color-bg-subtle:   #F4EEE2;   /* 次级区块 */
  --color-bg-elevated: #FFFDF8;   /* 卡片/导航（配阴影） */
  --color-bg-inset:    #EFE8D8;   /* 输入框/代码块凹陷 */

  --color-text-primary:   #1f2328;
  --color-text-secondary: #57606a;
  --color-text-tertiary:  #8b949e;
  --color-text-inverse:   #ffffff;

  --color-border-default: #d0d7de;
  --color-border-subtle:  #eaeef2;

  --color-success: #1a7f37; --color-warning: #9a6700;
  --color-danger:  #cf222e; --color-info:    #0969da;

  --shadow-sm: 0 1px 2px rgba(0,0,0,.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,.10);
  --shadow-lg: 0 12px 28px rgba(0,0,0,.14);
}
html.dark {
  /* ✅ 方向 A 取值（完整版见 06）：bg 用暖墨色系，非下方 GitHub 中性值 */
  --color-primary:        #E06A5E;  /* 暗底朱砂提亮 */
  --color-bg-default:  #15120E;     /* 浓墨（A）；以下中性值仅为骨架默认，A 实际值见 06 */
  --color-bg-subtle:   #161b22;
  --color-bg-elevated: #161b22;
  --color-bg-inset:    #010409;
  --color-text-primary:   #e6edf3;
  --color-text-secondary: #9198a1;
  --color-text-tertiary:  #6e7681;
  --color-border-default: #30363d;
  --color-border-subtle:  #21262d;
  --color-success: #3fb950; --color-warning: #d29922;
  --color-danger:  #f85149; --color-info:    #58a6ff;
  --shadow-sm: 0 1px 2px rgba(0,0,0,.30);
  --shadow-md: 0 4px 12px rgba(0,0,0,.40);
  --shadow-lg: 0 12px 28px rgba(0,0,0,.50);
}

/* 第 3 层：组件别名（兼容旧代码，逐步淘汰） */
html.light, html.dark {
  --header_background: var(--color-bg-elevated);
  --footer_background: var(--color-bg-elevated);
  --home_background:   var(--color-bg-subtle);
  --english_page_bg:   var(--color-bg-default);
  /* …旧变量逐个改为引用语义令牌，名字不动 */
}
```

> 上面 light/dark 的中性灰与语义色是**对齐 GitHub Primer 的安全默认**，可直接用；`--color-primary*` 留空，待方向选型填入。

---

## 2. 排版规范

### 2.1 字体家族（三组，具体字体待方向选定）

```css
/* ✅ 方向 A 取值 */
--font-display: "Noto Serif SC", "Songti SC", "STSong", SimSun, serif;        /* 标题·宋 */
--font-body:    "Noto Sans SC", -apple-system, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
--font-mono:    ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
```
> 字体加载策略（中文字体首屏成本）见 [06-tokens-A-quiet-ink.md](./06-tokens-A-quiet-ink.md) 第 1 节。
- 中文回退链建议：`"PingFang SC", "Microsoft YaHei", "Noto Sans SC"`。
- **最多 2 种可见字体**（display + body），mono 仅代码。

### 2.2 类型阶梯（角色 → 令牌）

| 角色 | 字号 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| Display | `--font-size-5xl` 48 | tight | bold | 首页 Hero、关于页标语 |
| H1 | `--font-size-4xl` 36 | tight | bold | 文章主标题 |
| H2 | `--font-size-3xl` 30 | tight | semibold | 章节 |
| H3 | `--font-size-2xl` 24 | tight | semibold | 小节 |
| H4 | `--font-size-xl` 20 | normal | semibold | — |
| Body-lg | `--font-size-lg` 18 | **relaxed 1.75** | normal | **文章正文** |
| Body | `--font-size-base` 16 | normal | normal | UI 正文 |
| Caption | `--font-size-sm` 14 | normal | normal | 元信息/辅助 |
| Micro | `--font-size-xs` 12 | normal | medium | 标签/角标 |

**铁律**：标题与正文字号对比 ≥ 2.5×（眯眼测试层级仍清晰）。

### 2.3 阅读 measure（核心阅读体验）

- **文章正文容器 `max-width: 70ch`（约 720–760px），居中。** 这是修复 Article 行宽失控的关键一条。
- 正文段间距用 `--space-4`，标题上间距用 `--space-6`。

---

## 3. 间距与布局

- 所有 `margin`/`padding`/`gap` 只取 `--space-*`。淘汰 5/15/18/25/50/200px 等非系统值。
- **布局栅格**：沿用 Element Plus `el-row/el-col` 24 栏；页面最大内容宽度建议 `1200px` 容器居中。
- **区块节奏**：组件内间距用 `--space-2~4`，区块间用 `--space-6~7`，页面分区用 `--space-8`。

---

## 4. 圆角与阴影

| 元素 | 圆角 | 阴影 |
|------|------|------|
| 标签/徽章 | `--radius-sm` | 无 |
| 按钮/输入框 | `--radius-md` | 无（focus 用 ring） |
| 卡片 | `--radius-lg` | `--shadow-sm`，hover `--shadow-md` |
| 弹层/下拉 | `--radius-lg` | `--shadow-md` |
| 模态 | `--radius-xl` | `--shadow-lg` |
| 头像/圆点 | `--radius-full` | — |

> 淘汰 `border-radius: 1%` / `30%` 这类百分比写法（除真正的圆形用 `--radius-full`）。

---

## 5. 动效

| 场景 | 时长 | 缓动 |
|------|------|------|
| hover/focus/颜色 | `--motion-fast` | `--ease-standard` |
| 卡片位移/展开 | `--motion-normal` | `--ease-out` |
| 主题切换/大过渡 | `--motion-slow` | `--ease-standard` |
| 昼夜 Hero 图淡入淡出 | 保留现有 ~1.2–1.5s | ease |

- 尊重 `prefers-reduced-motion`：开启时关闭非必要动画。
- **开屏门动画延迟从 1s 降到 ≤ 500ms**（见 01·G6）。

---

## 6. 组件约定

### 按钮
- 三级：Primary（主色实底）/ Secondary（描边）/ Ghost（纯文字）。
- 高度 36px（默认）；圆角 `--radius-md`；focus 显 2px 主色 ring。

### 卡片（文章卡 / 导航卡 / 侧栏卡 统一）
- 背景 `--color-bg-elevated`，圆角 `--radius-lg`，`--shadow-sm`。
- hover：`translateY(-4px)` + `--shadow-md` + `--motion-normal`，`cursor: pointer`。
- 当前各页卡片 hover 行为不一（Home 缩放、WebNavigate 无）→ **统一为上浮**。

### 输入框 / 文本域
- 背景 `--color-bg-inset`，边框 `--color-border-default`，focus 边框 `--color-primary` + ring。
- 禁止硬编码边框色（清理 `content/InputBar.vue` `#333ce1`、`Article.vue` 评论框 `green`）。

### 聊天气泡（AiEnglish）
- AI 气泡 `--color-bg-subtle`，用户气泡 `--color-primary-subtle`（明确拉开层次）。
- `max-width: min(75%, 680px)`，内部 `code/table { overflow-x:auto; word-break:break-word }`。
- 消息间距 ≥ `--space-4`，操作按钮不与下一条重叠。

### 状态设计（当前普遍缺失，列为规范要求）
- **空状态**：插画/图标 + 一句引导 + 主操作。
- **加载态**：骨架屏（列表/卡片）或行内 spinner（流式输出）。
- **错误态**：原因 + 重试按钮。
- **无数据/搜索无结果**：区分「还没有」与「没搜到」。

---

## 7. 暗色模式策略

- 所有颜色经第 2 层语义令牌，**禁止组件内写死十六进制**。
- 暗色不是把白变黑：用 `--color-bg-default/subtle/elevated` 三档表达层次，elevated 比 default 略亮。
- 代码块、图片在暗色下需单独校验对比度（见 01·Article 代码块问题）。

---

## 8. 响应式

| 断点 | 宽度 | 说明 |
|------|------|------|
| `sm` | < 640 | 手机 |
| `md` | 640–880 | 大手机/小平板 |
| `lg` | 880–1200 | 平板/小桌面（现有 880 主断点保留） |
| `xl` | > 1200 | 桌面，内容容器 1200 居中 |

- 优先**流式尺寸**（`clamp()` / `%` / `ch`）而非固定 px。
- 移动端：导航走底部菜单（现有 `SmallScreenMenu`）；文章隐藏侧栏、正文全宽但保留左右 `--space-4` 内边距；卡片单列。

---

## 9. 可访问性（A11y）

- 正文对比度 ≥ 4.5:1，大字 ≥ 3:1（用语义令牌默认值已基本达标）。
- **可见 focus 态**：所有可交互元素 `:focus-visible` 显主色 ring。
- ⚠️ `reset.css` 的 `a { all: unset }` 会清掉链接的默认可达性表现 → 规范要求：链接保留可聚焦 + 明确 hover/focus 样式。
- 图片有 `alt`；图标按钮有 `aria-label`；语音/播放等纯图标控件必须可达。
- 颜色不作为唯一信息载体（如「点赞激活」除变色外加图标填充态）。

---

## 10. 🔒 受保护特性：昼/夜主题 + 首页配图切换

**机制保留不变**，仅优化表现层。当前实现链：

```
App.vue（onBeforeMount 按 7:00–22:00 自动定主题）
  → stores/deviceInfo.js（theme 状态）
  → plugins/themePlugin.js（$subscribe 切 html class + 动态 import css + localStorage 6h）
  → Header.vue（白天图/黑夜图 双 <img> 绝对定位 opacity 切换）
```

**规范化要点（保留机制，优化体验）**：
1. 主题切换时给 `<html>` 加 `transition`，让背景/文字色随图片一起平滑过渡（当前色变是瞬切、图是 1.5s 淡变，不同步）。
2. **偏好记忆**：首次访问按时段自动判断；用户**手动切换后长期记忆**（≥30 天），不再被时段自动覆盖。
3. 切换控件统一为一个可发现的图标按钮（当前桌面 radio 组 + 移动端藏在「我的」抽屉，重复且隐蔽）→ 收敛为顶栏单一入口 + 清晰昼/夜图标。
4. Hero 双图建议按当前主题**优先加载对应图**、另一张延迟/懒加载（当前两张都加载，约 3MB+，拖首屏）。

---

## 附：本规范如何被使用

- 新增页面/组件：先查本规范是否已有对应令牌/组件约定，**不新建散装变量、不写死颜色**。
- Code Review 检查项：是否使用语义令牌？间距是否 8pt？是否有暗色值？是否有 focus 态？
- 选定方向后：把第 1 节「待定」处填上，本规范即成为唯一事实来源（single source of truth）。
