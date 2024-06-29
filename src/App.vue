<script setup>
import useUserInfo from "@/stores/userInfo";
import useDeviceInfo from "@/stores/deviceInfo";
import { onMounted, onBeforeUnmount, ref, onBeforeMount, computed } from "vue";
import { getLocalStorageValueWithExpiration } from "@/utils/uselocalStorage";
import { storeToRefs } from "pinia";

// // // // // // // ↓ 状态管理 ↓ // // // // // // //

// 执行函数，拿到Store
const deviceInfoStore = useDeviceInfo();
const userInfoStore = useUserInfo();

// 读取状态
const { username } = storeToRefs(userInfoStore); // 读取状态

// // // // // // // ↑ 状态管理 ↑ // // // // // // //

// // // // // // // ↓ 响应式布局：获取用户屏幕尺寸，添加监听 ↓ // // // // // // //

// 实时监控屏幕尺寸，存入状态管理
const updateScreenWidth = () => {
  deviceInfoStore.userScreenWidth = window.innerWidth;
  deviceInfoStore.userScreenHeight = window.innerHeight;
};

// 实时监控用户滚动，存入状态管理
const handleScroll = () => {
  deviceInfoStore.scrollTop = document.documentElement.scrollTop;
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

// // // // // // // ↑ 页面主题颜色 ↑ // // // // // // //

// // // // // // // // // // ↓ 开屏动画 ↓ // // // // // // // // // //
/*
等待页面组件加载完成，避免出现空白界面的情况
*/
const isShowDoor = ref(true);

const isRouterViewReady = ref(false);
const allReady = computed(() => {
  if (isRouterViewReady.value) {
    // 动画效果设置为1秒，1秒之后，遮罩真正去除（组件加载完成时只是变透明了）
    setTimeout(() => {
      isShowDoor.value = false;
    }, 1000);
  }

  return isRouterViewReady.value;
});

const isRouterViewMounted = () => {
  isRouterViewReady.value = true;
};

// // // // // // // // // // ↑ 开屏动画 ↑ // // // // // // // // // //

// // // // // // ↓ 打赏弹出框 ↓ // // // // // //

function resetUserRewardMessage() {
  deviceInfoStore.isShowReawrdDialog = false;

  deviceInfoStore.userRewardInfo.name = "";
  deviceInfoStore.userRewardInfo.note = "";
  deviceInfoStore.userRewardInfo.contact = "";
}

function submitUserRewardMessage() {
  deviceInfoStore.isShowReawrdDialog = false;
  username.value = deviceInfoStore.userRewardInfo.name;

  console.log(username.value);
  console.log(deviceInfoStore.userRewardInfo.note);
  console.log(deviceInfoStore.userRewardInfo.contact);
  console.log("submit!");

  deviceInfoStore.userRewardInfo.name = "";
  deviceInfoStore.userRewardInfo.note = "";
  deviceInfoStore.userRewardInfo.contact = "";
}

// // // // // // ↑ 打赏弹出框 ↑ // // // // // //
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

  <router-view @vue:mounted="isRouterViewMounted"></router-view>

  <el-dialog
    v-model="deviceInfoStore.isShowReawrdDialog"
    title="谢谢您的喜欢~"
    width="500"
    :lock-scroll="false"
  >
    <div class="card_item">
      <div class="block">
        <img clsaa="card_img" src="@/assets/image/reward_code_wechat.jpg" />
        <div class="card_img_title">微信</div>
      </div>
      <div class="block">
        <img clsaa="card_img" src="@/assets/image/reward_code_alipay.jpg" />
        <div class="card_img_title">支付宝</div>
      </div>
    </div>

    <el-form
      :label-position="'top'"
      label-width="auto"
      :model="deviceInfoStore.userRewardInfo"
      style="max-width: 600px"
    >
      <el-form-item label="您的昵称">
        <el-input
          v-model="deviceInfoStore.userRewardInfo.name"
          placeholder="少侠，留下你的昵称呗"
        />
      </el-form-item>
      <el-form-item label="您的留言">
        <el-input
          v-model="deviceInfoStore.userRewardInfo.note"
          type="textarea"
          placeholder="期待与少侠交流"
          resize="none"
        />
      </el-form-item>
      <el-form-item label="您的联系方式">
        <el-input
          v-model="deviceInfoStore.userRewardInfo.contact"
          placeholder="少侠，留下你的联系方式呗"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="resetUserRewardMessage">取消</el-button>
        <el-button type="primary" @click="submitUserRewardMessage"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
/* ↓ 打赏弹出框样式 ↓ */

.card_item {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.card_item .block {
  margin: 5px 30px;
  display: inline-block;
  text-align: center;
}

.card_item img {
  display: block;
  width: 120px;
  height: 120px;
}

/* ↑ 打赏弹出框样式 ↑ */

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
