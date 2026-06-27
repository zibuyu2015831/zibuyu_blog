<script setup>
import useDeviceInfo from "@/stores/deviceInfo.js";
import { storeToRefs } from "pinia";

import WebSite from "@/components/WebSite.vue";
import InputBar from "@/content/InputBar.vue";
import { recommendedSites, groupedSites } from "@/content/data/webSites.js";

defineOptions({ name: "WebNavigate" });

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

// 执行函数，拿到Store
const deviceInfoStore = useDeviceInfo();

// 读取状态
const { isShowHeaderNavigate, isShowBottomMenu, isShowFooterComponent } = storeToRefs(
  deviceInfoStore
);

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //
</script>

<template>
  <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
  <SmallScreenMenu v-if="isShowBottomMenu"></SmallScreenMenu>

  <div class="nav-page">
    <div class="nav-page__inner">
      <!-- 搜索框 -->
      <div class="nav-page__search">
        <InputBar></InputBar>
      </div>

      <!-- 推荐分区 -->
      <section v-if="recommendedSites.length" class="nav-section" aria-label="推荐站点">
        <h2 class="nav-section__title">
          <span class="nav-section__dot"></span>推荐
        </h2>
        <div class="nav-grid">
          <WebSite
            v-for="site in recommendedSites"
            :key="`reco-${site.url}`"
            :title="site.title"
            :desc="site.desc"
            :url="site.url"
            :favicon="site.favicon"
            :category="site.category"
          />
        </div>
      </section>

      <!-- 全部（按分类分组） -->
      <section class="nav-section" aria-label="全部站点">
        <h2 class="nav-section__title">
          <span class="nav-section__dot"></span>全部
        </h2>

        <div v-for="group in groupedSites" :key="group.category" class="nav-group">
          <h3 class="nav-group__title">{{ group.category }}</h3>
          <div class="nav-grid">
            <WebSite
              v-for="site in group.sites"
              :key="site.url"
              :title="site.title"
              :desc="site.desc"
              :url="site.url"
              :favicon="site.favicon"
            />
          </div>
        </div>
      </section>
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
  padding: var(--space-8) var(--space-6) var(--space-7);
}

/* 搜索框 */
.nav-page__search {
  max-width: 640px;
  margin: 0 auto var(--space-8);
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
