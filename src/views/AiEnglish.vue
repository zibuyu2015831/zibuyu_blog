<script setup>
import useDeviceInfo from "@/stores/deviceInfo";

import { storeToRefs } from "pinia";

import AiEnglishLeftMenu from "@/components/AiEnglishLeftMenu.vue";
import AiEnglishSpokenCoach from "@/components/AiEnglishSpokenCoach.vue";

// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

const deviceInfoStore = useDeviceInfo();

const { isEnglishWebShowLeft } = storeToRefs(deviceInfoStore);

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //
</script>

<template>
  <div class="page" :style="{ height: deviceInfoStore.userScreenHeight + 'px' }">
    <div class="left" v-if="isEnglishWebShowLeft">
      <AiEnglishLeftMenu> </AiEnglishLeftMenu>
    </div>

    <div class="right">
      <AiEnglishSpokenCoach> </AiEnglishSpokenCoach>
    </div>
  </div>
</template>

<style scoped>
/* ↓ 整体布局 ↓ */

.page {
  background-color: var(--english_page_bg);
  display: flex;
}

/* ↑ 整体布局 ↑ */

/* ↓ 右侧布局 ↓ */

.right {
  flex-grow: 1;
  height: 100%;
  background-color: var(--english_right_bg);
}

/* ↑ 右侧布局 ↑ */
</style>
