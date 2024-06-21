<script setup>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import HeaderNavigate from "@/components/HeaderNavigate.vue";
import SmallScreenMenu from "@/components/SmallScreenMenu.vue";
import useDeviceInfo from "@/stores/nav";
import { onMounted, onBeforeUnmount } from "vue";
import {storeToRefs} from "pinia";

// // // // // // // // // // ↓ 响应式布局 ↓ // // // // // // // // // //

// 执行函数，拿到Store
const deviceInfo = useDeviceInfo();

// 读取状态
const {isShowHeaderNavigate} = storeToRefs(deviceInfo)

// 实时监控屏幕尺寸，存入状态管理
const updateScreenWidth = () => {
  deviceInfo.userScreenWidth = window.innerWidth
  deviceInfo.userScreenHeight = window.innerHeight
  
};

// 实时监控用户滚动，存入状态管理
const handleScroll =()=> {
  deviceInfo.scrollTop = document.documentElement.scrollTop;
  // console.log('向下滚动了： ',deviceInfo.scrollTop)
}



// 挂载组件时添加屏幕尺寸变化监听函数
onMounted(() => {
  updateScreenWidth()
  window.addEventListener('resize', updateScreenWidth, { passive: true });
});

// 卸载组件时移除屏幕尺寸变化监听函数
onBeforeUnmount(() => {
  updateScreenWidth()
  window.removeEventListener('resize', updateScreenWidth, { passive: true });
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

</script>

<template>
  <div class="common-layout">

    <Header></Header>
    <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
    <SmallScreenMenu v-if="!isShowHeaderNavigate"></SmallScreenMenu>
    <router-view ></router-view>
    <Footer  v-if="isShowHeaderNavigate"></Footer>

  </div>
</template>

<style scoped>
.common-layout {
  background-color: #f0eeee;
}
</style>
