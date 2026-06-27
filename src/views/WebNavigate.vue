<script setup>
import { computed, ref } from "vue";
import useDeviceInfo from "@/stores/deviceInfo.js";
import { storeToRefs } from "pinia";
import { Search } from "@element-plus/icons-vue";

import WebSite from "@/components/WebSite.vue";
import { recommendedSites, groupedSites, categories } from "@/content/data/webSites.js";

defineOptions({ name: "WebNavigate" });

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

// 执行函数，拿到Store
const deviceInfoStore = useDeviceInfo();

// 读取状态
const { isShowHeaderNavigate, isShowBottomMenu, isShowFooterComponent } = storeToRefs(
  deviceInfoStore
);

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 搜索与筛选 ↓ // // // // // // // // // //

// 关键词搜索（实时过滤 title + desc，忽略大小写）
const keyword = ref("");

// 当前选中的分类，"" 表示「全部」
const activeCategory = ref("");

// 是否处于「全部」分类（未限定具体分类）
const isAllCategory = computed(() => activeCategory.value === "");

// 单条站点是否命中关键词（标题或描述）
function matchKeyword(site) {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return true;
  return (
    (site.title && site.title.toLowerCase().includes(kw)) ||
    (site.desc && site.desc.toLowerCase().includes(kw))
  );
}

// 过滤后的推荐站点：仅在「全部」分类下展示，且受关键词约束
const filteredRecommended = computed(() => {
  if (!isAllCategory.value) return [];
  return recommendedSites.filter(matchKeyword);
});

// 过滤后的分组：先按分类，再按关键词（AND 叠加），剔除空分组
const filteredGroups = computed(() =>
  groupedSites
    .filter((group) => isAllCategory.value || group.category === activeCategory.value)
    .map((group) => ({
      category: group.category,
      sites: group.sites.filter(matchKeyword),
    }))
    .filter((group) => group.sites.length > 0)
);

// 是否完全没有任何匹配结果（用于空状态）
const hasResults = computed(
  () => filteredRecommended.value.length > 0 || filteredGroups.value.length > 0
);

function selectCategory(category) {
  activeCategory.value = category;
}

// // // // // // // // // // ↑ 搜索与筛选 ↑ // // // // // // // // // //
</script>

<template>
  <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
  <SmallScreenMenu v-if="isShowBottomMenu"></SmallScreenMenu>

  <div class="nav-page">
    <div class="nav-page__inner">
      <!-- 搜索框 -->
      <div class="nav-page__search">
        <el-input
          v-model="keyword"
          class="nav-search__input"
          placeholder="搜索站点名称或描述…"
          :prefix-icon="Search"
          clearable
          aria-label="搜索站点"
        />
      </div>

      <!-- 分类筛选 -->
      <div class="nav-page__chips" role="tablist" aria-label="分类筛选">
        <button
          type="button"
          class="nav-chip"
          :class="{ 'is-active': isAllCategory }"
          :aria-pressed="isAllCategory"
          @click="selectCategory('')"
        >
          全部
        </button>
        <button
          v-for="category in categories"
          :key="category"
          type="button"
          class="nav-chip"
          :class="{ 'is-active': activeCategory === category }"
          :aria-pressed="activeCategory === category"
          @click="selectCategory(category)"
        >
          {{ category }}
        </button>
      </div>

      <!-- 空状态 -->
      <div v-if="!hasResults" class="nav-empty">
        <p class="nav-empty__title">未找到匹配的站点</p>
        <p class="nav-empty__hint">换个关键词或分类再试试</p>
      </div>

      <template v-else>
        <!-- 推荐分区（仅「全部」分类下展示） -->
        <section
          v-if="filteredRecommended.length"
          class="nav-section"
          aria-label="推荐站点"
        >
          <h2 class="nav-section__title">
            <span class="nav-section__dot"></span>推荐
          </h2>
          <div class="nav-grid">
            <WebSite
              v-for="site in filteredRecommended"
              :key="`reco-${site.url}`"
              :title="site.title"
              :desc="site.desc"
              :url="site.url"
              :favicon="site.favicon"
              :category="site.category"
              :highlight="keyword"
            />
          </div>
        </section>

        <!-- 全部（按分类分组） -->
        <section v-if="filteredGroups.length" class="nav-section" aria-label="全部站点">
          <h2 class="nav-section__title">
            <span class="nav-section__dot"></span>{{ isAllCategory ? "全部" : activeCategory }}
          </h2>

          <div v-for="group in filteredGroups" :key="group.category" class="nav-group">
            <h3 v-if="isAllCategory" class="nav-group__title">{{ group.category }}</h3>
            <div class="nav-grid">
              <WebSite
                v-for="site in group.sites"
                :key="site.url"
                :title="site.title"
                :desc="site.desc"
                :url="site.url"
                :favicon="site.favicon"
                :highlight="keyword"
              />
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>

  <Footer v-if="isShowFooterComponent"></Footer>
</template>

<style scoped>
.nav-page {
  width: 100%;
  background-color: var(--color-bg-default);
}

.nav-page__inner {
  max-width: 1180px;
  margin: 0 auto;
  /* 顶部为固定顶栏(60px)再留一段呼吸空间，避免搜索框紧贴导航条 */
  padding: calc(var(--space-8) + var(--space-7)) var(--space-6) var(--space-7);
}

/* 搜索框 */
.nav-page__search {
  max-width: 640px;
  margin: 0 auto var(--space-5);
}

/* 自建搜索输入：暖纸底、圆角、朱砂聚焦边框 */
.nav-search__input {
  width: 100%;
}

.nav-search__input :deep(.el-input__wrapper) {
  background-color: var(--color-bg-inset);
  border-radius: var(--radius-full);
  padding: var(--space-2) var(--space-5);
  box-shadow: 0 0 0 1px var(--color-border-default) inset;
  transition: box-shadow var(--motion-fast) var(--ease-standard);
}

.nav-search__input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px var(--color-border-default) inset;
}

.nav-search__input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--color-primary) inset;
}

.nav-search__input :deep(.el-input__inner) {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
}

.nav-search__input :deep(.el-input__inner::placeholder) {
  color: var(--color-text-tertiary);
}

.nav-search__input :deep(.el-input__prefix),
.nav-search__input :deep(.el-input__suffix) {
  color: var(--color-text-tertiary);
}

/* ---------- 分类筛选 chips ---------- */
.nav-page__chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-2);
  max-width: 760px;
  margin: 0 auto var(--space-8);
}

.nav-chip {
  padding: var(--space-1) var(--space-4);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-full);
  background-color: transparent;
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: var(--font-size-sm);
  letter-spacing: 0.04em;
  cursor: pointer;
  transition:
    background-color var(--motion-fast) var(--ease-standard),
    border-color var(--motion-fast) var(--ease-standard),
    color var(--motion-fast) var(--ease-standard);
}

.nav-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.nav-chip.is-active {
  background-color: var(--color-primary-subtle);
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: var(--weight-semibold);
}

/* ---------- 空状态 ---------- */
.nav-empty {
  padding: var(--space-8) var(--space-4);
  text-align: center;
}

.nav-empty__title {
  margin: 0 0 var(--space-2);
  font-family: var(--font-display);
  font-weight: var(--weight-semibold);
  font-size: var(--font-size-xl);
  color: var(--color-primary);
}

.nav-empty__hint {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

/* ---------- 分区 ---------- */
.nav-section + .nav-section {
  margin-top: var(--space-8);
}

.nav-section__title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: 0 0 var(--space-5);
  font-family: var(--font-display);
  font-weight: var(--weight-bold);
  font-size: var(--font-size-2xl);
  letter-spacing: 0.04em;
  color: var(--color-text-primary);
}

/* 朱砂小圆点 */
.nav-section__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
}

/* ---------- 分组 ---------- */
.nav-group + .nav-group {
  margin-top: var(--space-6);
}

.nav-group__title {
  margin: 0 0 var(--space-4);
  font-family: var(--font-display);
  font-weight: var(--weight-semibold);
  font-size: var(--font-size-lg);
  letter-spacing: 0.04em;
  color: var(--color-text-secondary);
}

/* ---------- 卡片网格：自适应列 ---------- */
.nav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-4);
}

/* ---------- 响应式 ---------- */
@media (max-width: 768px) {
  .nav-page__inner {
    padding: var(--space-6) var(--space-4) var(--space-6);
  }

  .nav-page__search {
    margin-bottom: var(--space-6);
  }

  .nav-section__title {
    font-size: var(--font-size-xl);
  }

  /* 双列自适应：窄屏下最小列宽放宽 */
  .nav-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: var(--space-3);
  }
}

@media (max-width: 420px) {
  /* 极窄屏单列 */
  .nav-grid {
    grid-template-columns: 1fr;
  }
}
</style>
