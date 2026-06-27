<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import useDeviceInfo from "@/stores/deviceInfo.js";
import { storeToRefs } from "pinia";

defineOptions({ name: "AppHeader" });

// // // // // // // // // // ↓ 测试代码 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 测试代码 ↑ // // // // // // // // // //

// // // // // ↓ 状态管理 ↓ // // // // //

const deviceInfo = useDeviceInfo(); // 执行函数，拿到Store

const { homeImageHeight } = storeToRefs(deviceInfo); // 读取状态


// // // // // ↑ 状态管理 ↑ // // // // //

// // // // // // // // // // ↓ 首页标语-打字机效果 ↓ // // // // // // // // // //

const header_slogen = "自然选择号，前进四！！！";
const displayText = ref("");
const typingIndex = ref(0);
const isTyping = ref(true); // 用于控制光标闪烁

// 打字机定时器（递归 setTimeout）与光标闪烁定时器，均需在卸载时清理（#05）
let typeTimer = null;
let cursorTimer = null;

const typeText = () => {
  if (typingIndex.value < header_slogen.length) {
    displayText.value += header_slogen[typingIndex.value];
    typingIndex.value++;

    typeTimer = setTimeout(typeText, 300); // 每个字符显示的间隔时间（毫秒）
  } else {
    typeTimer = setTimeout(() => {
      displayText.value = "";
      typingIndex.value = 0;
      isTyping.value = false;
      typeText();
    }, 5000); // 全部文本显示完后的停留时间（毫秒）
  }
};

onMounted(() => {
  typeText();
  cursorTimer = setInterval(() => {
    isTyping.value = !isTyping.value; // 切换光标状态
  }, 500); // 光标闪烁的间隔时间
});

onBeforeUnmount(() => {
  if (typeTimer) clearTimeout(typeTimer);
  if (cursorTimer) clearInterval(cursorTimer);
});

// // // // // // // // // // ↑ 首页标语-打字机效果 ↑ // // // // // // // // // //


</script>

<template>
  <el-row>
    <el-col class="blog_header" :style="{ height: homeImageHeight + 'px' }">
      <div class="typewriter header_slogen">
        <span>{{ displayText }}</span
        ><span class="cursor" v-if="isTyping">|</span>
      </div>
      <!-- 标语可读性遮罩：底部柔和暗纱，保证暖白标语在昼/夜两张 Hero 图上都清晰 -->
      <div class="header_scrim"></div>
      <img
        class="header_img"
        :style="{ height: homeImageHeight + 'px' }"
        src="../assets/image/header_night.jpg"
        alt=""
        :class="{
          'top-image': deviceInfo.theme === 'dark',
          'bottom-image': deviceInfo.theme !== 'dark',
        }"
      />

      <img
        class="header_img"
        :style="{ height: homeImageHeight + 'px' }"
        src="../assets/image/header_day.jpg"
        alt=""
        :class="{
          'top-image': deviceInfo.theme !== 'dark',
          'bottom-image': deviceInfo.theme === 'dark',
        }"
      />
    </el-col>
  </el-row>
</template>

<style scoped>
.blog_header {
  width: 100%;
  position: relative;
}

/* ↓ 标语设置 ↓ */

.blog_header .header_slogen {
  z-index: 999;
  position: absolute;
  top: 58%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* 方向A：衬线展示体 + 暖白，落在底部暗纱上 */
  font-family: var(--font-display, "Noto Serif SC", serif);
  color: var(--header_slogen_font, #fbf7ef);
  font-size: clamp(1.4rem, 4vw, 2.6rem);
  font-weight: 700;
  letter-spacing: 0.06em;
  text-align: center;
  text-shadow: 0 2px 16px rgba(0, 0, 0, 0.55), 0 1px 3px rgba(0, 0, 0, 0.4);
}

/* 打字机光标用朱砂点缀 */
.blog_header .header_slogen .cursor {
  color: var(--color-primary, #c8453b);
  font-weight: 400;
}

.typewriter {
  white-space: pre;
  overflow: hidden;
  display: inline-block;
}

/* 底部暗纱：仅压暗下半幅，不遮挡 Hero 主体，保障标语对比度 */
.blog_header .header_scrim {
  z-index: 998;
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 55%;
  pointer-events: none;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.45) 0%,
    rgba(0, 0, 0, 0.18) 45%,
    rgba(0, 0, 0, 0) 100%
  );
}

/* ↑ 标语设置 ↑ */

.blog_header .header_img {
  width: 100%;
  object-fit: cover;
  position: absolute; /* 设置图片为绝对定位 */
  top: 0;
  left: 0;
  transition: opacity 1.5s; /* 设置过渡效果 */
}

.top-image {
  opacity: 1;
}

.bottom-image {
  opacity: 0; /* 设置图片透明度为50% */
}


</style>
