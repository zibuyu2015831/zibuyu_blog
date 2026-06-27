<script setup>
import { computed, ref } from "vue";

defineOptions({ name: "WebSite" });

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    default: "",
  },
  url: {
    type: String,
    required: true,
  },
  // 可选：显式指定图标；不传则按域名自动取图
  favicon: {
    type: String,
    default: "",
  },
  // 可选：分类标签，朱砂强调
  category: {
    type: String,
    default: "",
  },
  // 可选：命中关键词，用于标题/描述高亮（朱砂浅底）
  highlight: {
    type: String,
    default: "",
  },
});

// 把文本按关键词（忽略大小写）切成 { text, hit } 片段，供模板高亮渲染。
// 不使用 v-html，避免注入风险。
function toSegments(text) {
  const keyword = props.highlight.trim();
  if (!keyword || !text) return [{ text, hit: false }];
  const lowerText = text.toLowerCase();
  const lowerKey = keyword.toLowerCase();
  const segments = [];
  let from = 0;
  let idx = lowerText.indexOf(lowerKey, from);
  while (idx !== -1) {
    if (idx > from) segments.push({ text: text.slice(from, idx), hit: false });
    segments.push({ text: text.slice(idx, idx + keyword.length), hit: true });
    from = idx + keyword.length;
    idx = lowerText.indexOf(lowerKey, from);
  }
  if (from < text.length) segments.push({ text: text.slice(from), hit: false });
  return segments;
}

const titleSegments = computed(() => toSegments(props.title));
const descSegments = computed(() => toSegments(props.desc));

// 取 URL 主机名，用于自动 favicon
const host = computed(() => {
  try {
    return new URL(props.url).hostname;
  } catch {
    return "";
  }
});

// 优先显式 favicon，否则按域名取 Google s2 图标
const faviconSrc = computed(() => {
  if (props.favicon) return props.favicon;
  if (!host.value) return "";
  return `https://www.google.com/s2/favicons?domain=${host.value}&sz=64`;
});

// 图标加载失败 → 回退首字母色块
const iconFailed = ref(false);
const showIcon = computed(() => !!faviconSrc.value && !iconFailed.value);

// 首字母占位（取标题首个有意义字符）
const initial = computed(() => (props.title ? props.title.trim().charAt(0).toUpperCase() : "?"));

function handleClick() {
  if (!props.url) return;
  window.open(props.url, "_blank", "noopener,noreferrer");
}

function handleKeydown(e) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    handleClick();
  }
}
</script>

<template>
  <div
    class="web-card"
    role="link"
    tabindex="0"
    :aria-label="`打开 ${title}`"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div class="web-card__icon">
      <img
        v-if="showIcon"
        class="web-card__favicon"
        :src="faviconSrc"
        :alt="`${title} 图标`"
        loading="lazy"
        @error="iconFailed = true"
      />
      <span v-else class="web-card__placeholder">{{ initial }}</span>
    </div>

    <div class="web-card__body">
      <div class="web-card__head">
        <h3 class="web-card__title">
          <template v-for="(seg, i) in titleSegments" :key="`t-${i}`">
            <mark v-if="seg.hit" class="web-card__mark">{{ seg.text }}</mark>
            <template v-else>{{ seg.text }}</template>
          </template>
        </h3>
        <span v-if="category" class="web-card__tag">{{ category }}</span>
      </div>
      <p class="web-card__desc">
        <template v-for="(seg, i) in descSegments" :key="`d-${i}`">
          <mark v-if="seg.hit" class="web-card__mark">{{ seg.text }}</mark>
          <template v-else>{{ seg.text }}</template>
        </template>
      </p>
    </div>
  </div>
</template>

<style scoped>
.web-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  width: 100%;
  height: 100%;
  padding: var(--space-4);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  cursor: pointer;
  /* 方向 A：默认无阴影 */
  box-shadow: none;
  transition:
    transform var(--motion-normal) var(--ease-standard),
    box-shadow var(--motion-normal) var(--ease-standard),
    border-color var(--motion-normal) var(--ease-standard);
}

.web-card:hover,
.web-card:focus-visible {
  transform: translateY(-4px);
  box-shadow: var(--shadow-sm);
  border-color: var(--color-border-default);
  outline: none;
}

/* ---------- 图标 ---------- */
.web-card__icon {
  flex: 0 0 auto;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background-color: var(--color-bg-subtle);
  overflow: hidden;
}

.web-card__favicon {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

/* 首字母占位：朱砂浅底 */
.web-card__placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-items: center;
  background-color: var(--color-primary-subtle);
  color: var(--color-primary);
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: var(--font-size-lg);
  line-height: 1;
}

/* ---------- 文本 ---------- */
.web-card__body {
  flex: 1 1 auto;
  min-width: 0;
}

.web-card__head {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.web-card__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: var(--weight-semibold);
  font-size: var(--font-size-base);
  line-height: var(--leading-tight);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 分类标签：朱砂强调 */
.web-card__tag {
  flex: 0 0 auto;
  padding: 1px var(--space-2);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  line-height: 1.6;
  letter-spacing: 0.04em;
}

/* 命中关键词高亮：朱砂浅底 */
.web-card__mark {
  background-color: var(--color-primary-subtle);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  padding: 0 1px;
}

.web-card__desc {
  margin: var(--space-2) 0 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--leading-normal);
  /* 最多两行省略 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
