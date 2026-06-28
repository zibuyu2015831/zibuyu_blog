<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { posts } from "@/content/data/posts.js";

defineOptions({ name: "SearchPalette" });

// 站内搜索命令面板（⌘K / Ctrl+K 打开）。
// 当前全站演示数据、无后端，故走纯客户端过滤：对 posts.js 的
// 标题 / 摘要 / 分类做忽略大小写匹配。日后接后端可把 source 换成接口结果。
// 桌面顶栏与移动端菜单复用同一实例逻辑，避免两套搜索行为分叉。

const router = useRouter();

const visible = ref(false);
const keyword = ref("");
const activeIndex = ref(0);
const inputRef = ref(null);

// 过滤结果：空关键词时展示全部（内容少，等同“最近文章”一览）。
const results = computed(() => {
  const q = keyword.value.trim().toLowerCase();
  if (!q) return posts;
  return posts.filter((p) =>
    [p.title, p.abstract, p.category]
      .filter(Boolean)
      .some((f) => f.toLowerCase().includes(q))
  );
});

// 将命中片段拆成 [{text, hit}]，用于高亮（朱砂底）。无关键词则整段不高亮。
function segments(text) {
  const q = keyword.value.trim();
  if (!q || !text) return [{ text: text || "", hit: false }];
  const lower = text.toLowerCase();
  const ql = q.toLowerCase();
  const out = [];
  let i = 0;
  let at = lower.indexOf(ql);
  while (at !== -1) {
    if (at > i) out.push({ text: text.slice(i, at), hit: false });
    out.push({ text: text.slice(at, at + q.length), hit: true });
    i = at + q.length;
    at = lower.indexOf(ql, i);
  }
  if (i < text.length) out.push({ text: text.slice(i), hit: false });
  return out;
}

function open() {
  visible.value = true;
  activeIndex.value = 0;
  nextTick(() => inputRef.value?.focus());
}

function close() {
  visible.value = false;
  keyword.value = "";
}

function toggle() {
  visible.value ? close() : open();
}

function onKeywordInput() {
  // 关键词变化后把高亮选项复位到第一条，避免越界
  activeIndex.value = 0;
}

function move(step) {
  const n = results.value.length;
  if (!n) return;
  activeIndex.value = (activeIndex.value + step + n) % n;
}

function go(post) {
  if (!post) return;
  close();
  router.push(`/article/${post.id}`);
}

function onEnter() {
  go(results.value[activeIndex.value]);
}

// 全局快捷键：⌘K / Ctrl+K 切换；面板内 ↑↓ 导航、Enter 打开、Esc 关闭。
function onGlobalKeydown(e) {
  const isToggle = (e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K");
  if (isToggle) {
    e.preventDefault();
    toggle();
    return;
  }
  if (!visible.value) return;
  if (e.key === "Escape") {
    e.preventDefault();
    close();
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    move(1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    move(-1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    onEnter();
  }
}

onMounted(() => window.addEventListener("keydown", onGlobalKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onGlobalKeydown));

// 供顶栏 / 移动端菜单调用
defineExpose({ open, close, toggle });
</script>

<template>
  <Teleport to="body">
    <Transition name="palette-fade">
      <div v-if="visible" class="palette-overlay" @click.self="close">
        <div
          class="palette"
          role="dialog"
          aria-modal="true"
          aria-label="站内搜索"
        >
          <!-- 输入区 -->
          <div class="palette-head">
            <svg
              class="palette-search-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.2-4.2" />
            </svg>
            <input
              ref="inputRef"
              v-model="keyword"
              class="palette-input"
              type="text"
              placeholder="搜索文章标题、摘要、分类…"
              autocomplete="off"
              spellcheck="false"
              @input="onKeywordInput"
            />
            <kbd class="palette-esc" @click="close">esc</kbd>
          </div>

          <!-- 结果区 -->
          <ul v-if="results.length" class="palette-list">
            <li
              v-for="(post, i) in results"
              :key="post.id"
              class="palette-item"
              :class="{ active: i === activeIndex }"
              @mouseenter="activeIndex = i"
              @click="go(post)"
            >
              <span class="palette-cat">{{ post.category }}</span>
              <div class="palette-texts">
                <p class="palette-title">
                  <template v-for="(s, si) in segments(post.title)" :key="si">
                    <mark v-if="s.hit" class="hit">{{ s.text }}</mark>
                    <template v-else>{{ s.text }}</template>
                  </template>
                </p>
                <p class="palette-excerpt">
                  <template v-for="(s, si) in segments(post.abstract)" :key="si">
                    <mark v-if="s.hit" class="hit">{{ s.text }}</mark>
                    <template v-else>{{ s.text }}</template>
                  </template>
                </p>
              </div>
              <span class="palette-date">{{ post.date }}</span>
            </li>
          </ul>

          <div v-else class="palette-empty">
            未找到与「{{ keyword }}」相关的文章
          </div>

          <!-- 底部按键提示 -->
          <div class="palette-foot">
            <span class="palette-hint"><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
            <span class="palette-hint"><kbd>⏎</kbd> 打开</span>
            <span class="palette-hint"><kbd>esc</kbd> 关闭</span>
            <span class="palette-foot-spacer"></span>
            <span class="palette-count">{{ results.length }} 篇</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.palette-overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal, 1100);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 12vh 16px 16px;
  background: rgba(var(--shadow-color, 43, 38, 32), 0.38);
  backdrop-filter: blur(2px);
}

.palette {
  width: 100%;
  max-width: 600px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-xl, 16px);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* ↓ 输入区 ↓ */
.palette-head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border-subtle);
}

.palette-search-icon {
  flex: none;
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
}

.palette-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: var(--font-body);
  font-size: var(--font-size-lg);
  color: var(--color-text-primary);
}

.palette-input::placeholder {
  color: var(--color-text-tertiary);
}

.palette-esc {
  flex: none;
  cursor: pointer;
  padding: 2px 8px;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  background: var(--color-bg-inset);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
}

/* ↓ 结果列表 ↓ */
.palette-list {
  margin: 0;
  padding: var(--space-2);
  list-style: none;
  overflow-y: auto;
}

.palette-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--motion-fast) var(--ease-standard);
}

.palette-item.active {
  background: var(--color-primary-subtle);
}

.palette-cat {
  flex: none;
  align-self: flex-start;
  margin-top: 2px;
  padding: 1px var(--space-2);
  font-size: var(--font-size-xs);
  letter-spacing: 0.04em;
  color: var(--color-primary);
  background: var(--color-bg-subtle);
  border-radius: var(--radius-full);
}

.palette-item.active .palette-cat {
  background: var(--color-bg-elevated);
}

.palette-texts {
  flex: 1;
  min-width: 0;
}

.palette-title {
  margin: 0 0 2px;
  font-family: var(--font-display);
  font-weight: var(--weight-bold, 700);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.palette-excerpt {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.palette-date {
  flex: none;
  align-self: flex-start;
  margin-top: 2px;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

/* 命中高亮：朱砂浅底 */
.hit {
  padding: 0 1px;
  color: var(--color-primary);
  background: var(--color-primary-subtle);
  border-radius: 2px;
}

.palette-empty {
  padding: var(--space-7) var(--space-5);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-sm);
}

/* ↓ 底部提示 ↓ */
.palette-foot {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-5);
  border-top: 1px solid var(--color-border-subtle);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.palette-foot-spacer {
  flex: 1;
}

.palette-foot kbd,
.palette-esc {
  font-family: var(--font-mono);
}

.palette-foot kbd {
  display: inline-grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  margin-right: 2px;
  padding: 0 4px;
  font-size: 11px;
  color: var(--color-text-secondary);
  background: var(--color-bg-inset);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
}

/* ↓ 进出场动画（尊重 reduce-motion 由全局 reset 接管） ↓ */
.palette-fade-enter-active,
.palette-fade-leave-active {
  transition: opacity var(--motion-normal) var(--ease-standard);
}

.palette-fade-enter-from,
.palette-fade-leave-to {
  opacity: 0;
}

.palette-fade-enter-active .palette,
.palette-fade-leave-active .palette {
  transition: transform var(--motion-normal) var(--ease-out);
}

.palette-fade-enter-from .palette,
.palette-fade-leave-to .palette {
  transform: translateY(-8px) scale(0.98);
}

@media (max-width: 768px) {
  .palette-overlay {
    padding: 8vh 12px 12px;
  }
  .palette-date {
    display: none;
  }
  /* 触屏无物理键，隐藏 ↑↓/⏎/esc 提示，仅留结果计数 */
  .palette-hint {
    display: none;
  }
}
</style>
