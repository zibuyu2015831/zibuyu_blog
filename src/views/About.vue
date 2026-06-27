<script setup>
import useDeviceInfo from "@/stores/deviceInfo";

import { storeToRefs } from "pinia";
import { ref, onMounted, onBeforeUnmount } from "vue";

import githubIcon from "@/assets/image/github.png";
import bilibiliIcon from "@/assets/image/bilibili.png";
import userAvatar from "@/assets/image/user_avatar.png";

defineOptions({ name: "AboutView" });

// // // // // // // // // // ↓ 状态管理（与其他 view 一致，控制全局组件显隐） ↓ // // // // // // // // // //

const deviceInfoStore = useDeviceInfo();
const {
  isShowHeaderComponent,
  isShowFooterComponent,
  isShowHeaderNavigate,
  isShowBottomMenu,
} = storeToRefs(deviceInfoStore);

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ Hero 打字机标语（升级版：朱砂光标） ↓ // // // // // // // // // //

// Hero 副标语逐字显示，循环播放
const slogan = "写代码，也写字。前端 / AI / 偶尔读点旧书。";
const typedSlogan = ref("");
const showCursor = ref(true);

// 路由页面：离开后须清理定时器，否则定时器仍在后台触发（#05 内存安全）
let typeTimer = null;
let cursorTimer = null;
let typingIndex = 0;

const typeSlogan = () => {
  if (typingIndex < slogan.length) {
    typedSlogan.value += slogan[typingIndex];
    typingIndex += 1;
    typeTimer = setTimeout(typeSlogan, 120);
  } else {
    // 全部显示后停留，再清空重来
    typeTimer = setTimeout(() => {
      typedSlogan.value = "";
      typingIndex = 0;
      typeSlogan();
    }, 4000);
  }
};

onMounted(() => {
  typeSlogan();
  cursorTimer = setInterval(() => {
    showCursor.value = !showCursor.value;
  }, 530);
});

onBeforeUnmount(() => {
  if (typeTimer) clearTimeout(typeTimer);
  if (cursorTimer) clearInterval(cursorTimer);
});

// // // // // // // // // // ↑ Hero 打字机标语 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 页面内容数据（示例数据，可后续接入接口） ↓ // // // // // // // // // //

// 技能标签（示例数据）
const skills = [
  "Vue3",
  "JavaScript",
  "Python",
  "Element Plus",
  "设计系统",
  "LLM 应用",
];

// 经历时间线（示例数据）
const timeline = [
  {
    year: "2024",
    title: "开始写博客",
    desc: "搭起这片自留地，把日常的踩坑与思考记下来。",
  },
  {
    year: "2025",
    title: "深入 AI 应用",
    desc: "从 LLM 流式输出到智能体编排，把模型真正用进产品里。",
  },
  {
    year: "2026",
    title: "重构设计系统",
    desc: "用三层令牌收敛失控的颜色与字号，让样式重新可被理解。",
  },
];

// 联系 / 社交（示例数据，链接为占位）
const socials = [
  { name: "GitHub", icon: githubIcon, link: "#", text: "github.com/zibuyu" },
  { name: "Bilibili", icon: bilibiliIcon, link: "#", text: "space.bilibili.com" },
];

const email = "hello@example.com";

// // // // // // // // // // ↑ 页面内容数据 ↑ // // // // // // // // // //
</script>

<template>
  <Header v-if="isShowHeaderComponent"></Header>
  <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
  <SmallScreenMenu v-if="isShowBottomMenu"></SmallScreenMenu>

  <main class="about">
    <!-- ===================== Hero ===================== -->
    <section class="hero" aria-label="关于本站">
      <span class="hero-eyebrow"><span class="seal-line"></span>子曰 · 墨</span>
      <h1 class="hero-title">子不语</h1>
      <p class="hero-sub">
        <span>{{ typedSlogan }}</span
        ><span class="cursor" :class="{ 'is-hidden': !showCursor }">|</span>
      </p>
    </section>

    <div class="about-layout">
      <!-- 左：自我介绍 + 技能 + 时间线 -->
      <div class="about-main">
        <!-- 自我介绍 -->
        <section class="block" aria-label="自我介绍">
          <h2 class="section-title"><span class="mark-dot"></span>关于我</h2>
          <p class="intro">
            全栈开发工程师，现居广州。热衷前端工程化、AI 应用与设计系统——
            喜欢把混乱的东西收敛成秩序，也喜欢在代码之外读点旧书。
            这里安静地记下我在前端、AI 路上的所思所得。
          </p>
        </section>

        <!-- 技能标签 -->
        <section class="block" aria-label="技能标签">
          <h2 class="section-title"><span class="mark-dot"></span>我在做的</h2>
          <ul class="skill-list">
            <li v-for="skill in skills" :key="skill" class="skill-tag">
              {{ skill }}
            </li>
          </ul>
        </section>

        <!-- 经历时间线 -->
        <section class="block" aria-label="经历时间线">
          <h2 class="section-title">
            <span class="mark-dot"></span>一点轨迹
            <span class="section-note">示例数据</span>
          </h2>
          <ol class="timeline">
            <li v-for="item in timeline" :key="item.year" class="timeline-item">
              <span class="timeline-year">{{ item.year }}</span>
              <div class="timeline-body">
                <h3 class="timeline-title">{{ item.title }}</h3>
                <p class="timeline-desc">{{ item.desc }}</p>
              </div>
            </li>
          </ol>
        </section>
      </div>

      <!-- 右：作者卡 + 联系方式 -->
      <aside class="about-aside" aria-label="作者与联系方式">
        <div class="card author-card">
          <div class="author-avatar-wrap">
            <img class="author-avatar" :src="userAvatar" alt="子不语的头像" />
            <span class="author-seal">语</span>
          </div>
          <p class="author-name">子不语</p>
          <p class="author-bio">写代码，也写字。<br />前端 / AI / 偶尔读点旧书。</p>
          <div class="author-links">
            <a
              v-for="s in socials"
              :key="s.name"
              :href="s.link"
              :aria-label="s.name"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img :src="s.icon" :alt="s.name" />
            </a>
          </div>
        </div>

        <div class="card contact-card">
          <h2 class="aside-title"><span class="mark-dot"></span>联系我</h2>
          <ul class="contact-list">
            <li v-for="s in socials" :key="s.name" class="contact-item">
              <span class="contact-label">{{ s.name }}</span>
              <a
                :href="s.link"
                target="_blank"
                rel="noopener noreferrer"
                class="contact-value"
                >{{ s.text }}</a
              >
            </li>
            <li class="contact-item">
              <span class="contact-label">邮箱</span>
              <a :href="`mailto:${email}`" class="contact-value">{{ email }}</a>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </main>

  <Footer v-if="isShowFooterComponent"></Footer>
</template>

<style scoped>
/* ============================================================
   关于页 · 方向 A「子曰·墨」
   暖宣纸 + 浓墨 + 朱砂点缀，全部使用全局设计令牌
   ============================================================ */

.about {
  background-color: var(--color-bg-default);
  color: var(--color-text-primary);
  font-family: var(--font-body);
  line-height: var(--leading-relaxed);
}

/* 朱砂小圆点 */
.mark-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  vertical-align: middle;
}

/* ---------- Hero ---------- */
.hero {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6) var(--space-7);
  border-bottom: 1px solid var(--color-border-subtle);
}

.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
  letter-spacing: 0.34em;
  margin-bottom: var(--space-4);
}

.hero-eyebrow .seal-line {
  width: 22px;
  height: 1px;
  background-color: var(--color-primary);
}

.hero-title {
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: var(--font-size-5xl);
  line-height: var(--leading-tight);
  letter-spacing: 0.06em;
  margin: 0;
}

.hero-sub {
  margin: var(--space-4) 0 0;
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  letter-spacing: 0.02em;
  min-height: 1.6em;
}

/* 朱砂光标 */
.hero-sub .cursor {
  color: var(--color-primary);
  font-weight: var(--weight-normal);
  margin-left: 1px;
}

.hero-sub .cursor.is-hidden {
  opacity: 0;
}

/* ---------- 主体布局 ---------- */
.about-layout {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-7) var(--space-6) var(--space-8);
  display: grid;
  grid-template-columns: minmax(0, 1fr) 312px;
  gap: var(--space-8);
  align-items: start;
}

/* 区块 */
.block {
  margin-bottom: var(--space-7);
}

.block:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: baseline;
  gap: var(--space-3);
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: var(--font-size-2xl);
  letter-spacing: 0.04em;
  margin: 0 0 var(--space-5);
}

.section-title .mark-dot {
  transform: translateY(-3px);
}

.section-note {
  font-family: var(--font-body);
  font-weight: var(--weight-normal);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  letter-spacing: 0.08em;
}

/* 自我介绍 */
.intro {
  margin: 0;
  font-size: var(--font-size-lg);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
  max-width: 60ch;
}

/* 技能标签：朱砂浅底 + 朱砂描边 */
.skill-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.skill-tag {
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  font-weight: var(--weight-medium);
  letter-spacing: 0.04em;
  color: var(--color-primary);
  background-color: var(--color-primary-subtle);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-4);
}

/* 时间线 */
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: var(--space-5);
  padding: 0 0 var(--space-6) var(--space-5);
  border-left: 1px solid var(--color-border-default);
}

.timeline-item:last-child {
  padding-bottom: 0;
}

/* 朱砂节点 */
.timeline-item::before {
  content: "";
  position: absolute;
  left: -5px;
  top: 4px;
  width: 9px;
  height: 9px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-bg-default);
}

.timeline-year {
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: var(--font-size-lg);
  color: var(--color-primary);
  letter-spacing: 0.04em;
}

.timeline-title {
  font-family: var(--font-display);
  font-weight: var(--weight-semibold);
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-2);
}

.timeline-desc {
  margin: 0;
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

/* ---------- 右侧栏 ---------- */
.about-aside {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  position: sticky;
  top: var(--space-8);
}

/* 极轻卡片：默认无阴影，hover 才上浮 + shadow-sm */
.card {
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6) var(--space-5);
  transition:
    transform var(--motion-normal) var(--ease-standard),
    box-shadow var(--motion-normal) var(--ease-standard);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

/* 作者卡 */
.author-card {
  text-align: center;
}

.author-avatar-wrap {
  position: relative;
  width: 76px;
  height: 76px;
  margin: 0 auto var(--space-3);
}

.author-avatar {
  width: 76px;
  height: 76px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 1px solid var(--color-border-default);
  background-color: var(--color-bg-subtle);
}

/* 朱砂作者印 */
.author-seal {
  position: absolute;
  right: -2px;
  bottom: -2px;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: var(--font-size-sm);
  display: grid;
  place-items: center;
}

.author-name {
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: var(--font-size-xl);
  letter-spacing: 0.06em;
  margin: 0 0 var(--space-2);
}

.author-bio {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
  margin: 0 0 var(--space-4);
}

.author-links {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
}

.author-links a {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  transition:
    border-color var(--motion-fast) var(--ease-standard),
    transform var(--motion-fast) var(--ease-standard);
}

.author-links a:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.author-links img {
  width: 18px;
  height: 18px;
  object-fit: contain;
}

/* 暗色下让深色 PNG 图标提亮 */
/* 整段写进 :global()，否则 scoped 编译器会把 `:global(html.dark) .xxx img`
   塌缩成 `html.dark`，导致 invert 滤镜误加到整个 <html>，全站昼夜反相。 */
:global(html.dark .author-links img),
:global(html.dark .contact-card img) {
  filter: invert(0.9) brightness(1.1);
}

/* 联系卡 */
.aside-title {
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: var(--font-size-base);
  letter-spacing: 0.1em;
  margin: 0 0 var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.aside-title .mark-dot {
  width: 5px;
  height: 5px;
}

.contact-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.contact-item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border-subtle);
}

.contact-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.contact-item:first-child {
  padding-top: 0;
}

.contact-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.contact-value {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-align: right;
  word-break: break-all;
  transition: color var(--motion-fast) var(--ease-standard);
}

.contact-value:hover {
  color: var(--color-primary);
}

/* ---------- 响应式 ---------- */
@media (max-width: 1024px) {
  .about-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-6);
  }

  .about-aside {
    position: static;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .card {
    flex: 1 1 280px;
  }
}

@media (max-width: 768px) {
  .hero {
    padding: var(--space-7) var(--space-4) var(--space-6);
  }

  .hero-title {
    font-size: var(--font-size-4xl);
  }

  .hero-sub {
    font-size: var(--font-size-lg);
  }

  .about-layout {
    padding: var(--space-6) var(--space-4) var(--space-7);
  }

  .about-aside {
    flex-direction: column;
  }

  .timeline-item {
    grid-template-columns: 52px minmax(0, 1fr);
    gap: var(--space-3);
  }
}
</style>
