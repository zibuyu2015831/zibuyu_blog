# 设计令牌实现表 · 方向 A「子曰·墨」

> ✅ 已选定方向 **A · 子曰·墨（Quiet Ink）**。本文是该方向的**最终具体令牌（single source of truth）**，把 [03-design-spec.md](./03-design-spec.md) 的骨架填上真实色值，并给出**现有全部 CSS 变量 → 语义令牌**的完整映射。P0 阶段照此机械替换即可。
>
> 气质回顾：暖宣纸 + 浓墨 + 一点朱砂，宋体标题，大留白，克制书卷。朱砂只作「印章/标记」语言，全站占比 < 5%。

---

## 1. 字体策略

```css
--font-display: "Noto Serif SC", "Songti SC", "STSong", SimSun, serif;        /* 标题·宋 */
--font-body:    "Noto Sans SC", -apple-system, BlinkMacSystemFont, "PingFang SC",
                "Microsoft YaHei", "Hiragino Sans GB", Arial, sans-serif;       /* 正文·黑 */
--font-mono:    ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace;
```

- 正文 18px / 行高 1.8 / 文章正文容器 `max-width: 70ch`。
- **加载策略（重要，避免中文 web 字体拖慢首屏）**：
  - 首选**系统宋体**（PingFang/Songti/微软雅黑 已覆盖大部分设备），Noto 作 CDN 兜底。
  - 若坚持 Noto Serif SC，**仅对标题用**（用量小），并 `font-display: swap` + 按需子集化；正文用系统黑体即可。
  - 原型用了 Google Fonts CDN，生产建议自托管 + 子集，或退回系统字体栈。

---

## 2. 语义令牌（明 / 暗）

> 这是「第 2 层」，主题切换只切这一层。直接替换 `light.css` / `dark.css` 顶部。

### `html.light`
```css
--color-primary:        #C8453B;   /* 朱砂 */
--color-primary-hover:  #A8362E;
--color-primary-subtle: #F6E3DF;   /* 朱砂浅底：标签/激活/用户气泡 */

--color-bg-default:  #FBF7EF;      /* 宣纸 */
--color-bg-subtle:   #F4EEE2;      /* 次级区块 */
--color-bg-elevated: #FFFDF8;      /* 卡片/导航 */
--color-bg-inset:    #EFE8D8;      /* 输入框/代码块凹陷 */

--color-text-primary:   #2B2620;
--color-text-secondary: #6B6356;
--color-text-tertiary:  #9B9283;
--color-text-inverse:   #FBF7EF;

--color-border-default: #E3DACA;
--color-border-subtle:  #EEE7D8;

--color-success: #4E7A3F;  /* 墨绿 */
--color-warning: #9A6B1E;  /* 赭黄 */
--color-danger:  #B23A2E;  /* 朱砂同源·深 */
--color-info:    #3E6B8C;  /* 黛蓝 */

--shadow-color: 43, 38, 32;        /* rgb，供阴影复用 */
--shadow-sm: 0 1px 2px rgba(var(--shadow-color), .08);
--shadow-md: 0 4px 14px rgba(var(--shadow-color), .12);
--shadow-lg: 0 12px 30px rgba(var(--shadow-color), .16);
```

### `html.dark`
```css
--color-primary:        #E06A5E;   /* 暗底朱砂提亮 */
--color-primary-hover:  #EA8076;
--color-primary-subtle: #3A211C;

--color-bg-default:  #15120E;      /* 浓墨 */
--color-bg-subtle:   #1F1B16;
--color-bg-elevated: #211D17;
--color-bg-inset:    #100D0A;

--color-text-primary:   #E9E2D4;
--color-text-secondary: #A89E8C;
--color-text-tertiary:  #786F60;
--color-text-inverse:   #15120E;

--color-border-default: #332C22;
--color-border-subtle:  #28221A;

--color-success: #7FA36A;
--color-warning: #C99A4E;
--color-danger:  #E07A6E;
--color-info:    #7FA8C4;

--shadow-color: 0, 0, 0;
--shadow-sm: 0 1px 2px rgba(var(--shadow-color), .35);
--shadow-md: 0 4px 14px rgba(var(--shadow-color), .45);
--shadow-lg: 0 12px 30px rgba(var(--shadow-color), .55);
```

> 原始令牌（间距/圆角/字号/动效/z-index）与 [03-design-spec.md](./03-design-spec.md) 第 1 节一致，**明暗共用、不随主题变**，写在 `tokens.css` 的 `:root`。

---

## 3. 现有变量 → 语义令牌 映射（第 3 层别名）

> 关键迁移点：旧变量名**全部保留**，只把取值改为引用语义令牌。模板零改动、昼夜机制零改动。下表一次定义、明暗自动跟随（因为引用的是已分主题的语义令牌）。

```css
html.light, html.dark {
  /* —— 全局框架 —— */
  --door:                 var(--color-bg-subtle);
  --header_background:     var(--color-bg-elevated);
  --header_font:           var(--color-text-primary);
  --header_slogen_font:    var(--color-primary);       /* 标语朱砂（落在 Hero scrim 上） */
  --home_background:       var(--color-bg-default);
  --footer_background:     var(--color-bg-elevated);
  --watermarkColor:        var(--color-text-tertiary);
  --el-bg-color:           var(--color-bg-elevated);

  /* —— 首页新闻轮播 —— */
  --news_activate_background:   var(--color-bg-elevated);
  --news_deactivate_background: var(--color-bg-subtle);
  --news_content:               var(--color-text-primary);

  /* —— 移动端菜单 —— */
  --small_screen_menu_bg:            var(--color-bg-elevated);
  --small_screen_menu_font:          var(--color-text-secondary);
  --small_screen_menu_font_activate: var(--color-primary);
  --menu_button_activate_bg:         var(--color-primary-subtle);

  /* —— 文章 —— */
  --markdown_article_title:             var(--color-text-primary);
  --markdown_article_body_deactivated:  var(--color-bg-default);
  --markdown_article_body_activated:    var(--color-bg-subtle);

  /* —— AiEnglish 子应用 —— */
  --english_page_bg:                   var(--color-bg-default);
  --english_left_bg:                   var(--color-bg-subtle);
  --english_left_spilit_line:          var(--color-border-default);
  --english_left_funtion_item_active:  var(--color-primary-subtle);
  --english_left_funtion_item_unactive:var(--color-bg-elevated);
  --english_left_funtion_item_hover:   var(--color-primary);
  --english_right_bg:                  var(--color-bg-default);
  --english_right_title_activate:      var(--color-bg-subtle);
  --english_reacte_content_ai_bg:      var(--color-bg-subtle);
  --english_reacte_content_user_bg:    var(--color-primary-subtle);
  --english_input_area_bg:             var(--color-bg-inset);
  --english_input_area_border:         var(--color-border-default);
  --english_input_area_border_focus:   var(--color-primary);
  --english_input_area_tip:            var(--color-text-tertiary);
  --english_scrollbar_bg:              var(--color-bg-default);
  --english_scrollbar:                 var(--color-border-default);
  --english_top_menu_icon:             var(--color-text-primary);
  --english_audio_icon:                var(--color-primary);
  --english_left_menu_fold_icon:       var(--color-primary);
  --english_left_menu_split_line:      var(--color-border-default);
}

/* 阴影别名（旧代码用 var(--home_hover_shadow) 作 box-shadow 颜色） */
html.light { --home_hover_shadow: rgba(43,38,32,.18); }
html.dark  { --home_hover_shadow: rgba(0,0,0,.55); }
```

---

## 4. Markdown 正文令牌映射（`zibuyu-markdown.css`）

> 文章页是 A 方向最该出彩的地方。这些变量在 `zibuyu-markdown.css` 内自带 `.light`/`.dark` 作用域，按下表改值；标注「P1 重构」的项需配合结构调整（见 [01](./01-review-report.md) Article 评审）。

| 变量 / 元素 | 方向 A 取值 | 备注 |
|------|------|------|
| 链接 `--zibuyu-a-gb` | `var(--color-primary)` | 朱砂链接 + hover 下划线（A 签名） |
| 行内代码 字 | `var(--color-primary)` | — |
| 行内代码 底 | `var(--color-bg-inset)` | 替代旧黄/蓝反差 |
| 引用 blockquote 底 | `var(--color-bg-subtle)` | 左边框改 `3px solid var(--color-primary)`，去掉 rebeccapurple |
| 代码块底（light） | `#F3ECDD` 暖纸凹陷 | 替代近黑 `rgb(33,7,7)`（评审致命项） |
| 代码块底（dark） | `#100D0A` | — |
| h1 | 文字 `--color-text-primary` + 下边框 `--color-border-default` | 宋体 |
| h2 / h3 标签底 | **P1 重构**：去掉彩色 span 背景，改 `border-bottom: 2px solid var(--color-primary)` + 标题前朱砂小点 | 当前生硬的彩底标签不符 A 气质 |
| 链接 `a::before` ✍🏻 | **P1 移除** | 评审重要项 |
| 正文容器 | `max-width: 70ch` + 行高 1.75–1.8 | 评审致命项 |

---

## 5. 关键组件在 A 下的表现速记

- **卡片**：`bg-elevated` + `1px solid border-subtle` + `radius-lg(12px)`，**默认无阴影**，hover 才上浮 + `shadow-sm`（A 靠留白不靠投影）。
- **按钮**：Primary = 朱砂描边、hover 反白填充（原型「请我喝杯茶」即此）；不要大面积实底朱砂。
- **标签/分类**：`primary-subtle` 底 + 朱砂字，或纯描边角标（印章感）。
- **链接**：朱砂 + hover 从中间生长的 2px 下划线。
- **昼夜切换**：保留机制；控件用宋字旁的 ☀/☾ 内联 SVG；切换加 `<html>` 0.4s 过渡让换色与 Hero 图淡变同步。

---

## 6. 落地清单（P0 执行时对照）

1. 新建 `src/assets/css/tokens.css`：放第 1 层原始令牌（明暗共用）+ 第 2 层语义令牌（`html.light`/`html.dark`）+ 第 3 层别名映射（本文第 3 节整段）。
2. `main.js` 在 `light/dark.css` **之前**引入 `tokens.css`（顺序：normalize → tokens → reset → 其余）。
3. `light.css` / `dark.css` 原有变量定义**删除**（已被 tokens.css 的别名层取代），或保留文件仅留必要的 EP 暗色覆盖。
4. 验证：昼夜切换、Hero 配图切换、各页明暗——应**视觉接近原型 A**。

> ⚠️ 注意 `themePlugin.js` 当前用 `import('@/assets/css/dark.css')` 动态加载来触发主题——P0 改造需确认 tokens.css 始终常驻、light/dark 仅承载语义层覆盖，避免动态 import 时序问题。这点在 P0 单列一个验证子项。
