<script setup>
import useDeviceInfo from "@/stores/deviceInfo";

import { storeToRefs } from "pinia";

import EnglishChatMenu from "@/components/EnglishChatMenu.vue";
import EnglishSpokenCoach from "@/components/EnglishSpokenCoach.vue";

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
      <EnglishChatMenu> </EnglishChatMenu>
    </div>

    <div class="right">
      <EnglishSpokenCoach> </EnglishSpokenCoach>
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
