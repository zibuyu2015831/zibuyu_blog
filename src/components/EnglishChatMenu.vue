<script setup>
import { ref } from "vue";

import useEnglishChat from "@/stores/englishChat";
import useDeviceInfo from "@/stores/deviceInfo";
import useUserInfo from "@/stores/userInfo";
import { storeToRefs } from "pinia";

// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

const englishChatStore = useEnglishChat();
const deviceInfoStore = useDeviceInfo();
const userInfoStore = useUserInfo();

const { isEnglishWebShowLeft } = storeToRefs(deviceInfoStore);

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //
  
// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

// 切换主题颜色
function changeTheme(theme) {
  deviceInfoStore.theme = theme;
}

const changeCommand = (command) => {
  console.log(command)
  englishChatStore.currentConmand = command;
};

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //
  
</script>

<template>
  <div class="left" v-if="isEnglishWebShowLeft">
    <div class="top"><span class="text">思维兵工厂</span></div>

    <div class="middle">
      <div class="split_line"></div>

      <div class="content">
        <div
          class="function_item"
          :class="{
            function_item_active: key === englishChatStore.currentConmand,
            function_item_unactive: key !== englishChatStore.currentConmand,
          }"
          v-for="value,key in englishChatStore.commands"
          @click="changeCommand(key)"
        >
          {{ key }}
        </div>
      </div>
    </div>

    <div class="bottom">
      <div class="content">
        <div class="bottom_item">
          <span class="icon-user iconfont"></span>
          <span v-if="userInfoStore.isLogin">个人中心</span>
          <span
            v-if="!userInfoStore.isLogin"
            @click="deviceInfoStore.isShowLoginDialog = true"
            >登录账号</span
          >
        </div>

        <div class="bottom_item">
          <span class="icon-chess-one iconfont"></span>
          <router-link to="/home">
            <span>前往博客</span>
          </router-link>
        </div>

        <div class="bottom_item" @click="deviceInfoStore.isShowReawrdDialog = true">
          <span class="icon-link iconfont"></span>

          <span>打赏作者</span>
        </div>

        <div
          v-if="deviceInfoStore.webTheme === 'light'"
          @click="changeTheme('dark')"
          class="bottom_item"
        >
          <span class="icon-night iconfont"></span>

          <span>深色主题</span>
        </div>

        <div
          v-if="deviceInfoStore.webTheme === 'dark'"
          @click="changeTheme('light')"
          class="bottom_item"
        >
          <span class="icon-daytime-mode iconfont"></span>

          <span>浅色主题</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  
/* ↓ 代码块 ↓ */ 

.left {
  width: 280px;
  height: 100%;
  background-color: var(--english_left_bg);
  display: flex;
  flex-direction: column;
  vertical-align: top;
}

.left .top {
  width: 100%;
  height: 6vh;
  min-height: calc(v-bind(titleHeight) * 1px);
  font-size: clamp(28px, 3vh, 38px);
  text-align: center;
  margin-top: 12px;
  filter: contrast(30);
}

.left .top .text {
  line-height: 6vh;
  animation: showup 3s forwards;
}

@keyframes showup {
  from {
    letter-spacing: -50px;
    filter: blur(10px);
  }

  to {
    letter-spacing: 10px;
    filter: blur(0px);
  }
}

.left .top span {
  line-height: calc(v-bind(titleHeight) * 1px);
}

.left .middle {
  width: 100%;
  height: 72vh;
  text-align: center;
}

.left .middle .content {
  display: inline-block;
  width: 100%;
  overflow-y: auto;
}

.middle .split_line {
  display: inline-block;
  width: 90%;
  border-bottom: 1px solid var(--english_left_spilit_line);
}

.left .middle .content .function_item {
  font-size: 22px;
  width: 90%;
  height: 50px;
  line-height: 50px;
  margin: 12px 10px;
  border-radius: 10px;
}

.function_item_active {
  border: 3px solid var(--english_left_funtion_item_hover);
  background-color: var(--english_left_funtion_item_active);
}

.function_item_unactive {
  background-color: var(--english_left_funtion_item_unactive);
}

.left .middle .content .function_item:hover {
  border: 3px solid var(--english_left_funtion_item_hover);
}

.left .bottom {
  width: 100%;
  height: 25vh;
  min-height: 200px;
  bottom: 0;
}

.left .bottom .content {
  margin-top: 20px;
  margin-left: 30px;
  display: inline-block;
  text-align: left;
}

.left .bottom .content .bottom_item {
  margin: 18px 0;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
}

.left .bottom .content span {
  margin-right: 15px;
}

/* ↑ 代码块 ↑ */
  
</style>
