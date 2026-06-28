<script setup>
import { computed } from "vue";
import { posts } from "@/content/data/posts.js";

defineOptions({ name: "FeaturedPosts" });

// 站内「精选手记」：按点赞数降序取前 3。
// 替换原先拉取第三方热榜外链的轮播——内容自洽、不外链流失、不依赖第三方 API。
// 注：后续若后端提供 featured/置顶标记，可改为按该字段筛选。
const featured = computed(() =>
  [...posts].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 3)
);
</script>

<template>
  <section class="featured" aria-label="精选手记">
    <el-carousel
      height="176px"
      :interval="5000"
      :autoplay="true"
      :pause-on-hover="true"
      indicator-position="outside"
      arrow="hover"
    >
      <el-carousel-item v-for="post in featured" :key="post.id">
        <router-link class="featured-card" :to="`/article/${post.id}`">
          <span class="featured-eyebrow">
            <span class="featured-dot"></span>精选
            <span class="featured-cat">{{ post.category }}</span>
          </span>
          <h3 class="featured-title">{{ post.title }}</h3>
          <p class="featured-excerpt">{{ post.abstract }}</p>
          <span class="featured-meta">
            {{ post.date }}<span class="featured-sep">·</span>阅读 {{ post.views }}
          </span>
        </router-link>
      </el-carousel-item>
    </el-carousel>
  </section>
</template>

<style scoped>
.featured {
  padding-top: var(--space-6);
}

/* 焦点块：纸墨编辑式——左对齐、宋体标题、朱砂细节，去 3D/虚化 */
.featured-card {
  display: flex;
  flex-direction: column;
  /* 卡片是 <router-link>(<a>)，被 reset.css 的 a{all:unset} 把 box-sizing 复位成
     content-box，导致 height:100% + padding + border 超出轮播项(176px)，底边框被
     el-carousel__item 的 overflow:hidden 裁掉。显式声明 border-box 修复。 */
  box-sizing: border-box;
  /* 留 4px 上下内缩，给 hover 的 translateY(-2px) 抬升留出空间，
     否则卡片刚好撑满轮播项、抬升后顶边框会被 overflow:hidden 裁掉。 */
  height: calc(100% - 8px);
  margin: 4px 0;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-6);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  text-decoration: none;
  transition:
    border-color var(--motion-fast) var(--ease-standard),
    transform var(--motion-fast) var(--ease-standard);
}

.featured-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

/* eyebrow：朱砂「精选」+ 分类胶囊 */
.featured-eyebrow {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  letter-spacing: 0.1em;
  color: var(--color-primary);
}

.featured-dot {
  width: 5px;
  height: 5px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
}

.featured-cat {
  padding: 1px var(--space-2);
  border-radius: var(--radius-full);
  background: var(--color-primary-subtle);
  color: var(--color-primary);
  letter-spacing: 0.04em;
}

.featured-title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: clamp(18px, 1.4vw, 22px);
  line-height: 1.4;
  letter-spacing: 0.02em;
  color: var(--color-text-primary);
  /* 标题至多一行，溢出省略，保持焦点块高度稳定 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.featured-excerpt {
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: 1.7;
  color: var(--color-text-secondary);
  /* 摘要至多两行 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.featured-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.featured-sep {
  margin: 0 var(--space-2);
}

/* 朱砂指示点：覆写 Element Plus 默认条状指示器 */
.featured :deep(.el-carousel__indicators) {
  --indicator-gap: var(--space-2);
}

.featured :deep(.el-carousel__indicator) {
  padding: var(--space-3) 5px;
}

.featured :deep(.el-carousel__button) {
  width: 7px;
  height: 7px;
  border-radius: var(--radius-full);
  background: var(--color-text-tertiary);
  opacity: 0.4;
}

.featured :deep(.el-carousel__indicator.is-active .el-carousel__button) {
  background: var(--color-primary);
  opacity: 1;
}
</style>
