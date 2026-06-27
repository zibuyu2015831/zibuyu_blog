<script setup>
import useAiEnglish from "@/stores/aiEnglish";
import useDeviceInfo from "@/stores/deviceInfo";
import useUserInfo from "@/stores/userInfo";

// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //
const foldMenuWidth = 40;
// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

const aiEnglishStore = useAiEnglish();
const deviceInfoStore = useDeviceInfo();
const userInfoStore = useUserInfo();

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

// 切换主题颜色
function changeTheme(theme) {
  deviceInfoStore.theme = theme;
}

// 切换菜单命令
const changeCommand = (command) => {
  aiEnglishStore.currentConmand = command;
};

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //
</script>

<template>
  <div class="unFold" v-if="!deviceInfoStore.isEnglishFoldMenu">
    <div class="top">
      <span class="text">思维兵工厂</span>
    </div>

    <div class="middle">
      <div
        class="function_item"
        :class="{
          function_item_active: key === aiEnglishStore.currentConmand,
          function_item_unactive: key !== aiEnglishStore.currentConmand,
        }"
        v-for="(value, key) in aiEnglishStore.commands"
        :key="key"
        @click="changeCommand(key)"
      >
        {{ key }}
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
      <div class="bottom_icon">
        <span
          class="iconfont icon-jiantou"
          @click="deviceInfoStore.isEnglishFoldMenu = true"
        ></span>
      </div>
    </div>
  </div>

  <div class="Fold" v-if="deviceInfoStore.isEnglishFoldMenu">
    <div class="fole_bottom_icon">
      <span
        class="iconfont icon-jiantou"
        @click="deviceInfoStore.isEnglishFoldMenu = false"
      ></span>
    </div>
  </div>
</template>

<style scoped>
/* ↓ 整体布局 ↓ */

.Fold {
  width: calc(v-bind(foldMenuWidth) * 1px);
  height: 100%;
  background-color: var(--english_left_bg);
  position: relative;
}

.Fold .fole_bottom_icon {
  position: absolute;
  bottom: 20px;
  left: calc(v-bind(foldMenuWidth/6) * 1px);
  transform: rotate(180deg);
  cursor: pointer;
}

.fole_bottom_icon spam {
  margin: 0 auto;
}

.fole_bottom_icon span:hover {
  color: var(--english_left_menu_fold_icon);
}

.unFold {
  width: 280px;
  height: 100%;
  background-color: var(--english_left_bg);
  display: flex;
  flex-direction: column;
}

/* ↑ 整体布局 ↑ */

/* ↓ 顶部样式 ↓ */

.top {
  width: 100%;
  height: 6vh;
  min-height: 60px;
  font-size: clamp(28px, 3vh, 38px);
  text-align: center;
  margin-top: 12px;
  position: relative;
}

.unFold .top::after {
  content: "";
  position: absolute;
  bottom: 2px;
  left: 7%;
  width: 80%;
  border-bottom: 1px solid var(--english_left_menu_split_line);
}

.top .text {
  line-height: 6vh;
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--color-text-primary);
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

/* ↑ 顶部样式 ↑ */

/* ↓ 中间样式 ↓ */

.middle {
  width: 100%;
  height: 72vh;

  text-align: center;
  display: inline-block;
  overflow-y: auto;
}

.middle .function_item {
  font-size: 22px;
  width: 90%;
  height: 50px;
  line-height: 50px;
  margin: 16px 10px;
  border-radius: 10px;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color var(--motion-fast) ease, outline-color var(--motion-fast) ease,
    background-color var(--motion-fast) ease;
}

.function_item_active {
  outline: 2px solid var(--english_left_funtion_item_hover);
  background-color: var(--english_left_funtion_item_active);
  color: var(--color-primary);
  font-weight: 600;
}

.function_item_unactive {
  background-color: var(--english_left_funtion_item_unactive);
}

.middle .function_item:hover {
  outline: 2px solid var(--english_left_funtion_item_hover);
  color: var(--color-text-primary);
}

/* ↑ 中间样式 ↑ */

/* ↓ 底部样式 ↓ */

.bottom {
  width: 100%;
  height: 25vh;
  min-height: 200px;
  position: relative;
}

.bottom .content {
  margin-top: 20px;
  margin-left: 30px;
  text-align: left;
  display: flex;
  flex-direction: column;
}

.bottom .content .bottom_item {
  margin: 8px 0;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color var(--motion-fast) ease;
}

.bottom .content .bottom_item:hover {
  color: var(--color-primary);
}

.bottom .content .bottom_item a {
  color: inherit;
  text-decoration: none;
}

.bottom .content span {
  margin-right: 15px;
}

/* ↑ 底部样式 ↑ */

/* ↓ 底部收展按钮 ↓ */

.bottom_icon {
  position: absolute;
  right: 30px;
  bottom: 20px;
  cursor: pointer;
}

.bottom_icon span:hover {
  color: var(--english_left_menu_fold_icon);
}

/* ↑ 底部收展按钮 ↑ */
</style>
