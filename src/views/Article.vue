<script setup>
import { ref, watch, onMounted, onBeforeMount, onBeforeUnmount, nextTick } from "vue";
import { Marked } from "marked";
import hljs from "highlight.js";
import { getArticle } from "@/api/getArticle";
import { markedHighlight } from "marked-highlight";
import { sanitizeArticleContent } from "@/utils/sanitize";
import "highlight.js/styles/atom-one-dark-reasonable.css";
import "@/assets/css/zibuyu-markdown.css";

import { v4 as uuidv4 } from "uuid";
import useDeviceInfo from "@/stores/deviceInfo.js";
import { storeToRefs } from "pinia";

defineOptions({ name: "ArticleView" });

// // // // // ↓ 状态管理 ↓ // // // // //

const deviceInfo = useDeviceInfo(); // 执行函数，拿到Store

const {
  isShowHeaderNavigate,
  isShowBottomMenu,
  isShowFooterComponent,

  isArticleRightBlockFixed,
  isArticleShowRightBox,
  webTheme,
} = storeToRefs(deviceInfo); // 读取状态

// // // // // ↑ 状态管理 ↑ // // // // //

// // // // // ↓ markdown渲染 ↓ // // // // //

// 文章是否被当前用户点赞
const userLike = ref(false);

function userLikeArticle() {
  userLike.value = !userLike.value;
}

// 使用正则表达式匹配并替换HTML标签，得到真正文本
function stripHtmlTags(html) {
  return html.replace(/<[^>]*>/g, "");
}

const toc = []; // 存放目录的标题与id
const imageIdList = []; // 存放图片的id与url
const article = ref("");
const tocItems = ref([]);
const activeTocId = ref(""); // 当前阅读到的章节标题 id（用于 TOC 高亮）

// 文章头元信息（方向A·子曰·墨：编辑风文章头）
const articleTitle = ref(""); // 真实标题：从正文首个一级标题提取
const articleReadMinutes = ref(1); // 阅读时长：按正文字数派生
// 以下三项后端暂无结构化数据，先用占位样例（待接入真实数据）
const articleCategory = "技术笔记";
const articleDate = "2026-06-12";
const articleViews = "2.1k";

const marked = new Marked();

marked.use({
  pedantic: false,
  gfm: true,
  renderer: {
    heading: function heading(text, depth) {
      let headId = "uuid" + uuidv4().replace(/-/g, "");
      let depth_class = "";

      switch (depth) {
        case 1:
          depth_class = "toc_first";
          break;

        case 2:
          depth_class = "toc_second";
          break;

        case 3:
          depth_class = "toc_third";
          break;
      }

      const real_text = stripHtmlTags(text);

      toc.push({ real_text, headId, depth_class });

      return `<h${depth} id="${headId}"><span>${text}</span></h${depth}>`;
    },
    image: function image(img_url, second, title) {
      let imageId = "uuid" + uuidv4().replace(/-/g, "");
      let pId = "uuid" + uuidv4().replace(/-/g, "");

      imageIdList.push({
        parentId: pId,
        imageId: imageId,
        imageUrl: img_url,
      });

      return `<p style="text-align:center" id="${pId}" >
        <img id="${imageId}" loading="lazy" style="border-radius: var(--radius-md, 8px);margin: 0 auto 5px;display: block;" src="${img_url}" alt="图片加载失败">
        <span style="color: gray; font-size: 16px;"> ↑ ${title} ↑ </span>
        </p>`;
    },
    link: function link(content, second, title) {
      return `<a href="${content}" target="_blank">${title}</a>`;
    },
    html: function html(content) {
      console.log("123");
      console.log("123", content);
    },
  },
});

marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "shell";
      return hljs.highlight(code, { language }).value;
    },
  })
);

const generateTOC = () => {
  return toc.map((item) => ({
    text: item.real_text,
    headId: item.headId,
    depth_class: item.depth_class,
  }));
};

// TOC 当前章节高亮：用 IntersectionObserver 监听各标题元素
let tocObserver = null;
const visibleHeadings = new Set();

const setupTocObserver = () => {
  // 先清理旧的观察器（防止热更新/重复调用泄漏）
  if (tocObserver) {
    tocObserver.disconnect();
    tocObserver = null;
  }
  visibleHeadings.clear();

  const headings = tocItems.value
    .map((item) => document.getElementById(item.headId))
    .filter(Boolean);

  if (!headings.length) return;

  tocObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleHeadings.add(entry.target.id);
        else visibleHeadings.delete(entry.target.id);
      });
      // 按文档顺序取第一个可见标题作为当前章节
      for (const item of tocItems.value) {
        if (visibleHeadings.has(item.headId)) {
          activeTocId.value = item.headId;
          break;
        }
      }
    },
    {
      // 触发线落在视口上部，下方留出余量，避免频繁跳动
      rootMargin: "-120px 0px -65% 0px",
      threshold: 0,
    }
  );

  headings.forEach((h) => tocObserver.observe(h));

  // 初始默认高亮第一项
  activeTocId.value = tocItems.value[0]?.headId || "";
};

onBeforeMount(async () => {
  const markdownTEXT = await getArticle(132156);

  // 文章标题取自正文首个一级标题，并将该 H1 从正文剥离，避免标题重复
  // （剥离后 TOC 自然从 H2 起算，与原型一致）
  const h1Match = markdownTEXT.match(/^\s*#\s+(.+?)\s*$/m);
  articleTitle.value = h1Match ? h1Match[1].replace(/`/g, "") : "未命名文章";
  const bodyMarkdown = h1Match ? markdownTEXT.replace(h1Match[0], "") : markdownTEXT;

  // 阅读时长：以去除标记后的字数估算（中文约 350 字/分钟）
  const plainLength = bodyMarkdown.replace(/[#>*`\-![\]()]/g, "").replace(/\s/g, "").length;
  articleReadMinutes.value = Math.max(1, Math.round(plainLength / 350));

  // 渲染前做 XSS 净化（保留代码高亮所需标签/类，见 utils/sanitize.js）
  article.value = sanitizeArticleContent(marked.parse(bodyMarkdown));
  tocItems.value = generateTOC();
  // 等待 v-html 把标题渲染进 DOM 后再建立观察器
  await nextTick();
  setupTocObserver();
});

onBeforeUnmount(() => {
  if (tocObserver) {
    tocObserver.disconnect();
    tocObserver = null;
  }
  // 移除阅读进度 / 键盘 / 图片委托监听，清理复制按钮，防止内存泄漏
  window.removeEventListener("scroll", onScrollProgress);
  window.removeEventListener("resize", onScrollProgress);
  window.removeEventListener("keydown", onKeydown);
  const body = articleBodyRef.value;
  if (body) body.removeEventListener("click", onBodyClick);
  clearCopyButtons();
});

// // // // // ↑ markdown渲染 ↑ // // // // //

// // // // // ↓ P3 增强：正文容器引用 ↓ // // // // //
// 正文容器引用（用于阅读进度、复制按钮注入、图片放大事件委托）
const articleBodyRef = ref(null);
// // // // // ↑ P3 增强：正文容器引用 ↑ // // // // //

// // // // // ↓ A. 阅读进度条 ↓ // // // // //

const readingProgress = ref(0);
let progressTicking = false;

// 以「正文区域」滚动百分比计算阅读进度（非整页），更贴合实际阅读位置
const computeReadingProgress = () => {
  const el = articleBodyRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const viewportH = window.innerHeight || document.documentElement.clientHeight;
  // 正文已滚出视口顶部的距离
  const scrolled = -rect.top;
  // 正文可滚动的总长度（正文高度超出视口的部分）
  const scrollable = rect.height - viewportH;
  if (scrollable <= 0) {
    readingProgress.value = 100;
    return;
  }
  const ratio = (scrolled / scrollable) * 100;
  readingProgress.value = Math.min(100, Math.max(0, ratio));
};

// rAF 节流的 scroll 处理
const onScrollProgress = () => {
  if (progressTicking) return;
  progressTicking = true;
  window.requestAnimationFrame(() => {
    computeReadingProgress();
    progressTicking = false;
  });
};

// // // // // ↑ A. 阅读进度条 ↑ // // // // //

// // // // // ↓ B. 代码块复制按钮 ↓ // // // // //

// 记录注入按钮的清理函数，内容更新/卸载时统一移除，避免重复注入与泄漏
let copyButtonCleanups = [];

const clearCopyButtons = () => {
  copyButtonCleanups.forEach((fn) => fn());
  copyButtonCleanups = [];
};

const injectCopyButtons = () => {
  const root = articleBodyRef.value;
  if (!root) return;
  // 先清理旧的，保证幂等
  clearCopyButtons();

  const blocks = root.querySelectorAll("pre");
  blocks.forEach((pre) => {
    // 防御：避免对同一 pre 重复注入
    if (pre.querySelector(":scope > .code-copy-btn")) return;

    pre.classList.add("has-copy-btn");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-copy-btn";
    btn.textContent = "复制";
    btn.setAttribute("aria-label", "复制代码");

    let resetTimer = null;

    const onClick = async () => {
      const codeEl = pre.querySelector("code") || pre;
      const text = codeEl.innerText;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        // 降级方案：clipboard API 不可用时用临时 textarea
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } catch {
          // 静默失败
        }
        document.body.removeChild(ta);
      }
      btn.textContent = "已复制 ✓";
      btn.classList.add("copied");
      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        btn.textContent = "复制";
        btn.classList.remove("copied");
      }, 1500);
    };

    btn.addEventListener("click", onClick);
    pre.appendChild(btn);

    copyButtonCleanups.push(() => {
      if (resetTimer) clearTimeout(resetTimer);
      btn.removeEventListener("click", onClick);
      btn.remove();
      pre.classList.remove("has-copy-btn");
    });
  });
};

// // // // // ↑ B. 代码块复制按钮 ↑ // // // // //

// // // // // ↓ C. 图片 lightbox（事件委托） ↓ // // // // //

const zoomedImage = ref(null);

const closeZoom = () => {
  zoomedImage.value = null;
};

// 事件委托：在正文容器统一监听 click，命中 img 即放大
const onBodyClick = (e) => {
  const target = e.target;
  if (target && target.tagName === "IMG") {
    zoomedImage.value = target.getAttribute("src");
  }
};

// ESC 关闭放大图
const onKeydown = (e) => {
  if (e.key === "Escape" && zoomedImage.value) closeZoom();
};

// // // // // ↑ C. 图片 lightbox（事件委托） ↑ // // // // //

// 内容渲染完成后（或内容变化时）重新注入复制按钮并刷新进度
const refreshEnhancements = async () => {
  await nextTick();
  injectCopyButtons();
  computeReadingProgress();
};

watch(article, () => {
  refreshEnhancements();
});

onMounted(() => {
  window.addEventListener("scroll", onScrollProgress, { passive: true });
  window.addEventListener("resize", onScrollProgress, { passive: true });
  window.addEventListener("keydown", onKeydown);
  const body = articleBodyRef.value;
  if (body) body.addEventListener("click", onBodyClick);
  // 首屏内容可能已就绪
  refreshEnhancements();
});

// // // // // ↓ 页面向上、向下跳动按钮 ↓ // // // // //

function backToTop() {
  window.scrollTo({
    top: 400,
    behavior: "smooth",
  });
}

function backToButton() {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: "smooth",
  });
}

// 根据元素ID值实现页面跳转
const scrollToAnchor = (headId) => {
  const element = document.getElementById(headId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

// // // // // ↑ 页面向上、向下跳动按钮 ↑ // // // // //

// // // // // ↓ 评论输入框 ↓ // // // // //

const textarea = ref();

// // // // // ↑ 评论输入框 ↑ // // // // //

// 侧边作者头像（本地资源，避免依赖远端路径）
const userAvatar = new URL("../assets/image/user_avatar.png", import.meta.url).href;

// 文章封面带：复用首页同两张昼/夜图，按 deviceInfo.theme 交叉淡入。
// 注意：这是阅读页内独立元素，不触碰受保护的首页 Header.vue 昼夜特性。
const coverDay = new URL("../assets/image/header_day.jpg", import.meta.url).href;
const coverNight = new URL("../assets/image/header_night.jpg", import.meta.url).href;

// 作者卡社交链接（与页脚同款方框图标）
const authorSocials = [
  { name: "GitHub", href: "#", icon: new URL("../assets/image/github.png", import.meta.url).href },
  { name: "Gitee", href: "https://gitee.com/zibuyu2015831", icon: new URL("../assets/image/gitee.png", import.meta.url).href },
  { name: "哔哩哔哩", href: "#", icon: new URL("../assets/image/bilibili.png", import.meta.url).href },
];
</script>

<template>
  <!-- A. 阅读进度条：固定视口顶部细条，按正文滚动进度填充 -->
  <div class="reading-progress" role="progressbar" :aria-valuenow="Math.round(readingProgress)" aria-valuemin="0" aria-valuemax="100">
    <div class="reading-progress__bar" :style="{ width: readingProgress + '%' }"></div>
  </div>

  <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
  <SmallScreenMenu v-if="isShowBottomMenu"></SmallScreenMenu>

  <!-- 文章封面带：窄幅昼/夜配图（保留特色与昼夜切换），其上叠左对齐编辑风文章头 -->
  <header class="article-cover">
    <img
      class="article-cover__img"
      :src="coverNight"
      alt=""
      :class="{ 'cover-top': webTheme === 'dark', 'cover-bottom': webTheme !== 'dark' }"
    />
    <img
      class="article-cover__img"
      :src="coverDay"
      alt=""
      :class="{ 'cover-top': webTheme !== 'dark', 'cover-bottom': webTheme === 'dark' }"
    />
    <div class="article-cover__scrim"></div>

    <div class="article-cover__head">
      <nav class="crumb" aria-label="面包屑">
        <router-link to="/home">首页</router-link><span class="sep">/</span>
        <router-link to="/article/1231">文章</router-link><span class="sep">/</span>
        <span>{{ articleCategory }}</span>
      </nav>
      <span class="tag"><span class="mark-dot"></span>{{ articleCategory }}</span>
      <h1 class="article-title">{{ articleTitle }}</h1>
      <div class="byline">
        <span class="byline-author">
          <img :src="userAvatar" alt="子不语的头像" />子不语
        </span>
        <span class="sep">·</span><span>{{ articleDate }}</span>
        <span class="sep">·</span><span>阅读 {{ articleReadMinutes }} 分钟</span>
        <span class="sep">·</span><span>浏览 {{ articleViews }}</span>
      </div>
    </div>
  </header>

  <el-row class="main" justify="center">
    <el-col :span="isArticleShowRightBox ? 11 : 22" class="left">
      <div
        ref="articleBodyRef"
        v-html="article"
        class="markdown-body article_body"
        :class="webTheme"
      ></div>

      <el-divider />

      <section class="comment-section">
        <h3 class="comment-title">
          <span class="mark-dot"></span>留言
        </h3>

        <div class="comment-composer">
          <el-input
            class="comment-textarea"
            v-model="textarea"
            :rows="5"
            type="textarea"
            placeholder="留下你的想法，与作者交流……"
            resize="none"
          />
          <div class="comment-actions">
            <span class="comment-hint">理性交流，文明发言</span>
            <el-button class="comment-submit">发表评论</el-button>
          </div>
        </div>
      </section>
    </el-col>

    <el-col
      v-if="isArticleShowRightBox"
      class="right"
      :span="5"
      :offset="1"
      :class="{ isfixed: isArticleRightBlockFixed }"
    >
      <div class="aside-block toc-block">
        <p class="aside-title"><span class="mark-dot"></span>目录</p>
        <div class="toc">
          <div
            v-for="item in tocItems"
            :key="item.headId"
            :class="[item.depth_class, { active: item.headId === activeTocId }]"
            @click="() => scrollToAnchor(item.headId)"
          >
            {{ item.text }}
          </div>
        </div>
        <div class="aside-divider"></div>
        <div class="toc_icon">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="AI问答"
            placement="top-start"
          >
            <span class="iconfont icon-message"></span>
          </el-tooltip>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="我来评论两句"
            placement="top-start"
          >
            <span class="iconfont icon-iconfontconment2"></span>
          </el-tooltip>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="点赞+收藏"
            placement="top-start"
          >
            <span
              class="iconfont"
              :class="{ 'icon-good1': userLike, 'icon-good': !userLike }"
              @click="userLikeArticle"
            ></span>
          </el-tooltip>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="返回底部"
            placement="top-start"
          >
            <span class="iconfont icon-arrow-to-bottom" @click="backToButton"></span>
          </el-tooltip>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="返回开头"
            placement="top-start"
          >
            <span class="iconfont icon-arrow-to-top" @click="backToTop"></span>
          </el-tooltip>
        </div>
      </div>

      <div class="aside-block author-card">
        <div class="author-avatar-wrap">
          <img class="author-avatar" :src="userAvatar" alt="子不语的头像" />
          <span class="author-seal">子</span>
        </div>
        <p class="author-name">子不语</p>
        <p class="author-bio">写代码，也写字。<br />前端 / AI / 偶尔读点旧书。</p>
        <div class="author-links">
          <a
            v-for="s in authorSocials"
            :key="s.name"
            :href="s.href"
            :aria-label="s.name"
            :title="s.name"
            target="_blank"
            rel="noopener"
          >
            <img :src="s.icon" :alt="s.name" />
          </a>
        </div>
      </div>
    </el-col>
  </el-row>

  <!-- C. 图片 lightbox：全屏遮罩居中放大，点击遮罩或按 ESC 关闭 -->
  <Transition name="lightbox">
    <div v-if="zoomedImage" class="lightbox-overlay" @click="closeZoom">
      <img class="lightbox-image" :src="zoomedImage" alt="放大查看" />
    </div>
  </Transition>

  <Footer v-if="isShowFooterComponent"></Footer>
</template>

<style scoped>
.main {
  background-color: var(--home_background);
}
/* 用户评论样式（方向A·子曰·墨：宋体小标题 + 朱砂点 + 纸面输入卡） */

.comment-section {
  margin: 8px 0 56px;
}

.mark-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-primary-subtle);
  vertical-align: middle;
}

.comment-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 18px;
  font-family: var(--font-display, "Noto Serif SC", serif);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.04em;
  color: var(--color-text-primary);
}

.comment-composer {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: 14px;
  padding: 14px 16px 16px;
  transition: border-color var(--motion-fast, 180ms) var(--ease-standard, ease),
    box-shadow var(--motion-fast, 180ms) var(--ease-standard, ease);
}

.comment-composer:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-subtle);
}

/* 内层 textarea 去掉 Element 默认边框/蓝色聚焦环，融入纸面卡片 */
.comment-textarea :deep(.el-textarea__inner) {
  background: transparent;
  border: none;
  box-shadow: none !important;
  padding: 2px 4px;
  color: var(--color-text-primary);
  font-family: var(--font-body, inherit);
  font-size: 15px;
  line-height: 1.75;
}

.comment-textarea :deep(.el-textarea__inner)::placeholder {
  color: var(--color-text-tertiary);
}

.comment-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-default);
}

.comment-hint {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.comment-submit.el-button {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fbf7ef;
  border-radius: 8px;
  padding: 10px 24px;
  font-weight: 600;
  letter-spacing: 0.06em;
  transition: background-color 0.22s ease, border-color 0.22s ease;
}

.comment-submit.el-button:hover,
.comment-submit.el-button:focus {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  color: #fbf7ef;
}

/* ↓ 侧边栏卡片（方向A·子曰·墨：纸面卡 + 朱砂印章作者卡 + 宋体小标题） ↓ */

.right .aside-block {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: 12px;
  padding: 22px 20px;
  margin-bottom: 20px;
}

/* 作者卡 */
.author-card {
  text-align: center;
}

.author-avatar-wrap {
  position: relative;
  width: 72px;
  height: 72px;
  margin: 0 auto 14px;
}

.author-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-subtle);
}

.author-seal {
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: var(--color-primary);
  color: #fbf7ef;
  font-family: var(--font-display, "Noto Serif SC", serif);
  font-weight: 700;
  font-size: 13px;
  line-height: 1;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.author-name {
  margin: 0 0 6px;
  font-family: var(--font-display, "Noto Serif SC", serif);
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
}

.author-bio {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--color-text-secondary);
}

/* 侧边小标题：宋体 + 字距 + 朱砂点 */
.aside-title {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 14px;
  font-family: var(--font-display, "Noto Serif SC", serif);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.14em;
  color: var(--color-text-secondary);
}

/* 目录卡内分隔线 + 动作图标行 */
.aside-divider {
  height: 1px;
  background: var(--color-border-default);
  margin: 16px 0 14px;
}

.toc_icon {
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
}

.toc_icon span {
  font-size: 20px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: color var(--motion-fast, 180ms) var(--ease-standard, ease),
    transform var(--motion-fast, 180ms) var(--ease-standard, ease);
}

.toc_icon span:hover {
  color: var(--color-primary);
  transform: translateY(-2px);
}

.toc_icon .icon-good1 {
  color: var(--color-primary);
}

.toc_icon .icon-arrow-to-bottom,
.toc_icon .icon-arrow-to-top {
  font-size: 18px;
}

.toc {
  margin-left: 2px;
}

.toc > div {
  padding: var(--space-2, 8px) var(--space-3, 12px);
  border-left: 2px solid var(--color-border-default);
  color: var(--color-text-secondary);
  cursor: pointer;
  line-height: var(--leading-normal, 1.5);
  transition: color var(--motion-fast, 150ms) var(--ease-standard, ease),
    border-color var(--motion-fast, 150ms) var(--ease-standard, ease);
}

.toc > div:hover {
  color: var(--color-text-primary);
}

/* TOC 当前章节高亮：朱砂左边框 + 朱砂字 */
.toc > div.active {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
  font-weight: var(--weight-medium, 500);
}

.toc .toc_first {
  font-weight: var(--weight-semibold, 600);
}

.toc .toc_second {
  padding-left: var(--space-5, 24px);
}

.toc .toc_third {
  padding-left: var(--space-7, 40px);
  font-size: var(--font-size-sm, 14px);
}

/* 文章主题样式 */

.markdown-body {
  /* 行宽：约 70ch（致命项），居中，保证长文阅读舒适 */
  max-width: 70ch;
  width: 100%;
  margin: var(--space-7, 40px) auto var(--space-5, 24px);
  padding: 0 var(--space-2, 8px);
  font-size: var(--font-size-lg, 18px);
  line-height: var(--leading-relaxed, 1.75);
  /* 正文直接落在页面纸色上（对齐原型，无卡片底） */
  background-color: transparent;
}

/* 首字下沉：朱砂宋体，仅作用于正文首段（对齐原型 lead 段）。
   正文由 v-html 注入，不带 scoped 属性，需用 :deep() 穿透。 */
.article_body > :deep(p:first-of-type::first-letter) {
  font-family: var(--font-display, "Noto Serif SC", serif);
  font-weight: 900;
  font-size: 3em;
  line-height: 0.82;
  float: left;
  margin: 4px 12px 0 0;
  color: var(--color-primary);
}

/* ↓ 文章封面带（窄幅昼/夜图 + 叠加编辑风文章头） ↓ */
.article-cover {
  position: relative;
  width: 100%;
  height: clamp(240px, 32vh, 320px);
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.article-cover__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 1.5s ease;
}

/* 昼/夜交叉淡入（与首页 Hero 同机制，受 deviceInfo.theme 驱动） */
.article-cover__img.cover-top {
  opacity: 1;
}

.article-cover__img.cover-bottom {
  opacity: 0;
}

/* 底部暗纱：保证编辑头文字在昼/夜两张图上都清晰（比首页强一档） */
.article-cover__scrim {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.66) 0%,
    rgba(0, 0, 0, 0.34) 42%,
    rgba(0, 0, 0, 0.05) 100%
  );
}

/* 编辑头：落在封面带左下，与正文左对齐 */
.article-cover__head {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 40px 28px;
  color: #fbf7ef;
}

/* 面包屑 */
.article-cover__head .crumb {
  font-size: 13px;
  letter-spacing: 0.03em;
  color: rgba(251, 247, 239, 0.78);
  margin-bottom: 16px;
}

.article-cover__head .crumb a {
  color: inherit;
  text-decoration: none;
  transition: color 0.22s ease;
}

.article-cover__head .crumb a:hover {
  color: #fff;
}

.article-cover__head .crumb .sep {
  margin: 0 8px;
  opacity: 0.5;
}

/* 标签胶囊：暖白描边，叠在图上可读 */
.article-cover__head .tag {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-display, "Noto Serif SC", serif);
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.1em;
  color: #fbf7ef;
  border: 1px solid rgba(251, 247, 239, 0.6);
  border-radius: var(--radius-sm, 4px);
  padding: 2px 12px;
  margin-bottom: 16px;
}

.article-cover__head .tag .mark-dot {
  width: 5px;
  height: 5px;
  box-shadow: none;
}

/* 大宋体标题 */
.article-cover__head .article-title {
  margin: 0 0 16px;
  font-family: var(--font-display, "Noto Serif SC", serif);
  font-weight: 900;
  font-size: clamp(28px, 4vw, 42px);
  line-height: 1.3;
  letter-spacing: 0.01em;
  max-width: 22ch;
  text-wrap: balance;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.4);
}

/* 署名行 */
.article-cover__head .byline {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 14px;
  color: rgba(251, 247, 239, 0.86);
}

.article-cover__head .byline-author {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #fff;
}

.article-cover__head .byline-author img {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(251, 247, 239, 0.5);
}

.article-cover__head .byline .sep {
  opacity: 0.45;
}
/* ↑ 文章封面带 ↑ */

@media (max-width: 768px) {
  .article-cover__head {
    padding: 0 16px 22px;
  }
}

/* 右侧板块设置 */

.main {
  position: relative;
}

.right {
  position: absolute;
  width: 400px;
  top: 50px;
  right: 80px;
}

.isfixed {
  /* 与 .right 同宽，消除固定时 395 vs 400 的横向跳动 */
  width: 400px;
  position: fixed;
  right: 80px;
  top: 150px;
}

/* ↓ 作者卡社交图标行（与页脚同款方框） ↓ */
.author-links {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 16px;
}

.author-links a {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
  transition: border-color 0.22s ease, transform 0.22s ease;
}

.author-links a:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.author-links img {
  width: 17px;
  height: 17px;
  object-fit: contain;
}

/* 暗色下给深色 logo 一点亮底，避免糊进卡片 */
:global(html.dark) .author-links a {
  background: rgba(255, 255, 255, 0.06);
}
/* ↑ 作者卡社交图标行 ↑ */

/* ↓ A. 阅读进度条 ↓ */
.reading-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  /* 高于内容、低于浮层；放在最顶层细条，与导航互不遮挡 */
  z-index: var(--z-toast, 1200);
  background: transparent;
  pointer-events: none;
}

.reading-progress__bar {
  height: 100%;
  width: 0;
  background: var(--color-primary);
  border-radius: 0 var(--radius-full, 9999px) var(--radius-full, 9999px) 0;
  transition: width var(--motion-fast, 150ms) var(--ease-out, ease);
}
/* ↑ A. 阅读进度条 ↑ */

/* ↓ C. 图片 lightbox ↓ */
.lightbox-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6, 32px);
  background: rgba(0, 0, 0, 0.78);
  z-index: var(--z-modal, 1100);
  cursor: zoom-out;
}

.lightbox-image {
  max-width: 92vw;
  max-height: 92vh;
  object-fit: contain;
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-lg, 0 12px 30px rgba(0, 0, 0, 0.55));
}

/* 平滑淡入 */
.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity var(--motion-normal, 250ms) var(--ease-standard, ease);
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-active .lightbox-image,
.lightbox-leave-active .lightbox-image {
  transition: transform var(--motion-normal, 250ms) var(--ease-out, ease);
}

.lightbox-enter-from .lightbox-image,
.lightbox-leave-to .lightbox-image {
  transform: scale(0.96);
}
/* ↑ C. 图片 lightbox ↑ */
</style>
