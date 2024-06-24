<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import useDeviceInfo from "@/stores/deviceInfo.js";
import { storeToRefs } from "pinia";

// // // // // // // // // // ↓ 测试代码 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 测试代码 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 首页标语-打字机效果 ↓ // // // // // // // // // //

const header_slogen = "你好，欢迎来到我的博客";
const displayText = ref("");
const typingIndex = ref(0);
const isTyping = ref(true); // 用于控制光标闪烁

// 生成随机数字（1~4）
function randomNumber() {
  return Math.floor(Math.random() * 4) + 1;
}

const typeText = () => {
  if (typingIndex.value < header_slogen.length) {
    displayText.value += header_slogen[typingIndex.value];
    typingIndex.value++;

    setTimeout(typeText, 300); // 每个字符显示的间隔时间（毫秒）
  } else {
    setTimeout(() => {
      displayText.value = "";
      typingIndex.value = 0;
      isTyping.value = false;
      typeText();
    }, 3000); // 全部文本显示完后的停留时间（毫秒）
  }
};

onMounted(() => {
  typeText();
  setInterval(() => {
    isTyping.value = !isTyping.value; // 切换光标状态
  }, 500); // 光标闪烁的间隔时间
});

// // // // // // // // // // ↑ 首页标语-打字机效果 ↑ // // // // // // // // // //

// // // // // ↓ 根据视口高度，修改首图高度 ↓ // // // // //

const deviceInfo = useDeviceInfo(); // 执行函数，拿到Store

const { homeImageHeight } = storeToRefs(deviceInfo); // 读取状态

const currentImage =
  deviceInfo.theme === "dark"
    ? "../assets/image/header_night.jpg"
    : "../assets/image/header_day.jpg";

console.log(currentImage);

// // // // // ↑ 根据视口高度，修改首图高度 ↑ // // // // //
</script>

<template>
  <el-row>
    <el-col class="blog_header" :style="{ height: homeImageHeight + 'px' }">
      <div class="typewriter header_slogen">
        <span>{{ displayText }}</span
        ><span v-if="isTyping">|</span>
      </div>
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
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: var(--header_slogen_font,white);
  font-size: 2em;
  font-weight: 800;
  text-align: center;
}

.typewriter {
  font-family: monospace;
  white-space: pre;
  overflow: hidden;
  display: inline-block;
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
