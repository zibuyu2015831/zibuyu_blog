<script setup>
import useDeviceInfo from "@/stores/deviceInfo";
import useUserInfo from "@/stores/userInfo";

import { getLocalStorageValueWithExpiration } from "@/utils/uselocalStorage";
import { throttle } from "@/utils/throttle";

import { onMounted, onBeforeUnmount, ref, onBeforeMount, watch } from "vue";

import DialogLogin from "@/content/DialogLogin.vue";
import DialogReward from "@/content/DialogReward.vue";
import DialogRegister from "@/content/DialogRegister.vue";
import ResetPassword from "@/content/ResetPassword.vue";

// // // // // // // ↓ 状态管理 ↓ // // // // // // //

const userInfoStore = useUserInfo();
userInfoStore.loadTokenFromLocalStorage();

// 执行函数，拿到Store
const deviceInfoStore = useDeviceInfo();

// // // // // // // ↑ 状态管理 ↑ // // // // // // //

// // // // // // // ↓ 响应式布局：获取用户屏幕尺寸，添加监听 ↓ // // // // // // //

// 实时监控屏幕尺寸，存入状态管理（节流，降低拖拽窗口时的高频写入，#10）
const updateScreenWidth = throttle(() => {
  deviceInfoStore.userScreenWidth = window.innerWidth;
  deviceInfoStore.userScreenHeight = window.innerHeight;
}, 100);

// 实时监控用户滚动，存入状态管理（节流）
const handleScroll = throttle(() => {
  deviceInfoStore.scrollTop = document.documentElement.scrollTop;
}, 100);

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

// // // // // // // ↑ 响应式布局：获取用户屏幕尺寸，添加监听 ↑ // // // // // // //

// // // // // // // ↓ 页面主题颜色 ↓ // // // // // // //

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
  const local_webTheme = getLocalStorageValueWithExpiration(
    deviceInfoStore.theme_store_key
  );

  // 已有用户偏好 → 长期沿用；否则首访按时段判断。
  const theme =
    local_webTheme && deviceInfoStore.theme_list.includes(local_webTheme)
      ? local_webTheme
      : isDayTime()
        ? "light"
        : "dark";

  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  // 同步到 store：保持顶栏切换控件状态一致，并经 themePlugin 持久化为长期偏好。
  deviceInfoStore.theme = theme;
});

// // // // // // // ↑ 页面主题颜色 ↑ // // // // // // //

// // // // // // // // // // ↓ 开屏动画 ↓ // // // // // // // // // //
/*
等待页面组件加载完成，避免出现空白界面的情况
*/
const isShowDoor = ref(true);

const isRouterViewReady = ref(false);

// 路由组件挂载完成后，遮罩先变透明（CSS 过渡），1 秒后真正移除 DOM。
// 用 watch 承载副作用，避免在 computed 内写副作用（vue/no-async-in-computed-properties）。
watch(isRouterViewReady, (ready) => {
  if (ready) {
    setTimeout(() => {
      isShowDoor.value = false;
    }, 500);
  }
});

const isRouterViewMounted = () => {
  isRouterViewReady.value = true;
};

// // // // // // // // // // ↑ 开屏动画 ↑ // // // // // // // // // //
</script>

<template>
  <el-row :gutter="0" class="container" v-if="isShowDoor">
    <el-col :span="12">
      <div class="door left-door" :class="{ 'left-door-dispear': isRouterViewReady }"></div>
    </el-col>
    <el-col :span="12">
      <div class="door right-door" :class="{ 'right-door-dispear': isRouterViewReady }"></div>
    </el-col>
  </el-row>

  <router-view @vue:mounted="isRouterViewMounted"></router-view>

  <DialogReward />
  <DialogLogin v-if="!useUserInfo.isLogin" />
  <DialogRegister v-if="!useUserInfo.isLogin" />
  <ResetPassword v-if="!useUserInfo.isLogin" />
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
  transition: transform 0.5s ease-in-out;
}

.left-door {
  left: 0;
  transform-origin: left;
}

.right-door {
  right: 0;
  transform-origin: right;
}

.container-dispear {
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
