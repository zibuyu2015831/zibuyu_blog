<script setup>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import HeaderNavigate from "@/components/HeaderNavigate.vue";
import SmallScreenMenu from "@/components/SmallScreenMenu.vue";
import useDeviceInfo from "@/stores/deviceInfo";
import { onMounted, onBeforeUnmount, ref, onBeforeMount, computed } from "vue";
import { getLocalStorageValueWithExpiration } from "@/utils/uselocalStorage";
import { storeToRefs } from "pinia";

// // // // // // // // // // ↓ 响应式布局：获取用户屏幕尺寸，添加监听 ↓ // // // // // // // // // //

// 执行函数，拿到Store
const deviceInfoStore = useDeviceInfo();

// 读取状态
const { isShowHeaderNavigate,isShowHeaderAndFooterComponent,isShowBottomMenu} = storeToRefs(deviceInfoStore);

// 实时监控屏幕尺寸，存入状态管理
const updateScreenWidth = () => {
  deviceInfoStore.userScreenWidth = window.innerWidth;
  deviceInfoStore.userScreenHeight = window.innerHeight;
};

// 实时监控用户滚动，存入状态管理
const handleScroll = () => {
  deviceInfoStore.scrollTop = document.documentElement.scrollTop;
  // console.log('向下滚动了： ',deviceInfoStore.scrollTop)
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
  const local_webTheme = getLocalStorageValueWithExpiration(deviceInfoStore.theme_store_key);

  if (local_webTheme && deviceInfoStore.theme_list.includes(local_webTheme)) {
    document.documentElement.classList.add(local_webTheme);
    deviceInfoStore.theme = local_webTheme;
  } else {
    if (isDayTime()) {
      document.documentElement.classList.remove(...document.documentElement.classList);
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove(...document.documentElement.classList);
      document.documentElement.classList.add("dark");
    }
  }
});

// // // // // // // // // // ↑ 页面主题颜色 ↑ // // // // // // // // // //



// // // // // // // // // // ↓ 开屏动画 ↓ // // // // // // // // // //
/*
等待页面组件加载完成，避免出现空白界面的情况
*/
const isShowDoor = ref(true);

// 3秒之后，遮罩真正去除（组件加载完成时只是变透明了）
setTimeout(() => {
  isShowDoor.value = false;
}, 3000);  

const isHeaderReady = ref(false);
const isRouterViewReady = ref(false);
const allReady = computed(() => {
  return isHeaderReady.value && isRouterViewReady.value;
});

const isHeaderViewMounted = () => {
  isHeaderReady.value = true;
};

const isRouterViewMounted = () => {
  isRouterViewReady.value = true;
};

// // // // // // // // // // ↑ 开屏动画 ↑ // // // // // // // // // //
</script>

<template>
  <el-row :gutter="0" class="container" v-if="isShowDoor">
    <el-col :span="12">
      <div class="door left-door" :class="{ 'left-door-dispear': allReady }"></div>
    </el-col>
    <el-col :span="12">
      <div class="door right-door" :class="{ 'right-door-dispear': allReady }"></div>
    </el-col>
  </el-row>

  <Header @vue:mounted="isHeaderViewMounted" v-if="isShowHeaderAndFooterComponent"></Header>
  <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
  <SmallScreenMenu v-if="isShowBottomMenu"></SmallScreenMenu>
  <router-view @vue:mounted="isRouterViewMounted"></router-view>
  <!-- <el-watermark class="common-layout" :font="font" content="思维兵工厂">
    <router-view></router-view>
  </el-watermark> -->

  <Footer v-if="isShowHeaderAndFooterComponent" ></Footer>
</template>

<style scoped>
.container {
  position: fixed;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 9999;
}

.door {
  position: absolute;
  top: 0;
  width: 50%;
  height: 100%;
  background-color: var(--door);
  transition: transform 1s ease-in-out;
}

.left-door {
  left: 0;
  transform-origin: left;
}

.right-door {
  right: 0;
  transform-origin: right;
}

.container-dispear{
  width: 0;
  height: 0;
}

.left-door-dispear {
  transform: perspective(1000px) rotateY(-90deg);
  z-index: 1;
}

.right-door-dispear {
  transform: perspective(1000px) rotateY(90deg);
  z-index: 1;
}
</style>
