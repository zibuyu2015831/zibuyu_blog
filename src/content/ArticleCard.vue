<script setup>
defineOptions({ name: "ArticleCard" });

defineProps({
  post: {
    type: Object,
    required: true,
  },
  // 小屏可隐藏封面占位，保持紧凑
  showCover: {
    type: Boolean,
    default: true,
  },
});
</script>

<template>
  <a :href="`/article/${post.id}`" class="article_card">
    <div v-if="showCover" class="cover" :aria-hidden="true">
      <span class="cover_mark">{{ post.category?.slice(0, 1) || "文" }}</span>
    </div>

    <div class="intro">
      <h3 class="title">{{ post.title }}</h3>
      <p class="abstract">{{ post.abstract }}</p>

      <div class="meta">
        <span class="category">{{ post.category }}</span>
        <span class="meta_item">
          <el-icon><Clock /></el-icon>{{ post.date }}
        </span>
        <span class="meta_item">
          <el-icon><View /></el-icon>{{ post.views }}
        </span>
        <span class="meta_item like">
          <el-icon><StarFilled /></el-icon>{{ post.likes }}
        </span>
      </div>
    </div>
  </a>
</template>

<style scoped>
.article_card {
  display: flex;
  gap: var(--space-4);
  align-items: stretch;
  padding: var(--space-4);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: transform var(--motion-normal) var(--ease-out),
    box-shadow var(--motion-normal) var(--ease-out),
    border-color var(--motion-normal) var(--ease-out);
}

.article_card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-border-default);
}

.article_card:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* 封面占位：暖纸底 + 朱砂分类首字（诚实占位，非假照片） */
.cover {
  flex: 0 0 132px;
  display: grid;
  place-items: center;
  background-color: var(--color-bg-inset);
  border-radius: var(--radius-md);
}

.cover_mark {
  font-family: var(--font-display);
  font-size: var(--font-size-3xl);
  font-weight: var(--weight-bold);
  color: var(--color-primary);
  opacity: 0.55;
}

.intro {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.title {
  margin: 0;
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-tight);
  color: var(--color-text-primary);
  /* hover 下划线从右向左生长（方向 A 签名） */
  background: linear-gradient(to right, var(--color-primary), var(--color-primary))
    no-repeat right bottom;
  background-size: 0 2px;
  transition: background-size var(--motion-slow) var(--ease-standard);
  width: fit-content;
}

.article_card:hover .title {
  background-position-x: left;
  background-size: 100% 2px;
}

.abstract {
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: var(--leading-relaxed);
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.meta {
  margin-top: auto;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.category {
  font-family: var(--font-display);
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  padding: 1px var(--space-2);
}

.meta_item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta_item .el-icon {
  color: var(--color-text-tertiary);
}

.meta_item.like .el-icon {
  color: var(--color-primary);
}

@media (max-width: 768px) {
  .cover {
    flex-basis: 96px;
  }
}
</style>
