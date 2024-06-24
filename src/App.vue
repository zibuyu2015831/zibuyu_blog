<script setup>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import HeaderNavigate from "@/components/HeaderNavigate.vue";
import SmallScreenMenu from "@/components/SmallScreenMenu.vue";
import useDeviceInfo from "@/stores/deviceInfo";
import { onMounted, onBeforeUnmount, reactive, onBeforeMount } from "vue";
import { getLocalStorageValueWithExpiration } from "@/utils/uselocalStorage";
import { storeToRefs } from "pinia";

// // // // // // // // // // ↓ 响应式布局 ↓ // // // // // // // // // //

// 执行函数，拿到Store
const deviceInfo = useDeviceInfo();

// 读取状态
const { isShowHeaderNavigate, watermarkColor, webTheme } = storeToRefs(deviceInfo);

// 实时监控屏幕尺寸，存入状态管理
const updateScreenWidth = () => {
  deviceInfo.userScreenWidth = window.innerWidth;
  deviceInfo.userScreenHeight = window.innerHeight;
};

// 实时监控用户滚动，存入状态管理
const handleScroll = () => {
  deviceInfo.scrollTop = document.documentElement.scrollTop;
  // console.log('向下滚动了： ',deviceInfo.scrollTop)
};

// 挂载组件时添加屏幕尺寸变化监听函数
onMounted(() => {
  updateScreenWidth();
  window.addEventListener("resize", updateScreenWidth, { passive: true });
});

// 卸载组件时移除屏幕尺寸变化监听函数
onBeforeUnmount(() => {
  updateScreenWidth();
  window.removeEventListener("resize", updateScreenWidth, { passive: true });
});

// 获取当前页面的 URL
onMounted(() => {
  deviceInfo.currentPath = window.location.pathname;
});

// 挂载组件时添加屏幕滚动变化监听函数
onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
});

// 卸载组件时移除屏幕滚动变化监听函数
onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll, { passive: true });
});

// // // // // // // // // // ↑ 响应式布局 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 页面主题颜色 ↓ // // // // // // // // // //

// 判断当前时间是否在07:00~22:00之间
function isDayTime() {
  // 获取当前时间
  const now = new Date();
  // 获取当前小时
  const currentHour = now.getHours();

  // 定义时间范围
  const startHour = 7; // 开始时间
  const endHour = 22; // 结束时间

  // 判断当前时间是否在指定范围内
  if (currentHour >= startHour && currentHour < endHour) {
    return true; // 在范围内
  } else {
    return false; // 不在范围内
  }
}

onBeforeMount(() => {
  const local_webTheme = getLocalStorageValueWithExpiration(deviceInfo.theme_store_key);

  if (local_webTheme && deviceInfo.theme_list.includes(local_webTheme)) {
    document.documentElement.classList.add(local_webTheme);
    deviceInfo.theme = local_webTheme;

  
  } else {
    if (isDayTime()) {
      document.documentElement.classList.add("light");

    } else {
      document.documentElement.classList.add("dark");
  
    }
  }
});




// // // // // // // // // // ↑ 页面主题颜色 ↑ // // // // // // // // // //

const font = reactive(watermarkColor.value);
</script>

<template>
  <Header></Header>
  <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
  <SmallScreenMenu v-if="!isShowHeaderNavigate"></SmallScreenMenu>
  <router-view></router-view>
  <!-- <el-watermark class="common-layout" :font="font" content="思维兵工厂">
    <router-view></router-view>
  </el-watermark> -->

  <Footer v-if="isShowHeaderNavigate"></Footer>
</template>

<style scoped>
.common-layout {
  background-color: #f0eeee;
}
</style>
