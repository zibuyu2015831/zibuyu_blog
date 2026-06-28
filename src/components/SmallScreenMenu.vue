<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import useUserInfo from "@/stores/userInfo";
import useDeviceInfo from "@/stores/deviceInfo";
import { ElDrawer } from "element-plus";
import { storeToRefs } from "pinia";
import { logout } from "@/utils/logout";
import SearchPalette from "@/components/SearchPalette.vue";

// // // // // ↓ 状态读取 ↓ // // // // //

const userInfoStore = useUserInfo(); // 执行函数，拿到Store
const deviceInfoStore = useDeviceInfo(); // 执行函数，拿到Store

const { isLogin } = storeToRefs(userInfoStore); // 读取状态

// // // // // ↑ 状态读取 ↑ // // // // //

// // // // // // // // // // ↓ 路径导航 ↓ // // // // // // // // // //

const router = useRouter();

// 监听元素的点击
function goHomeClick() {
  // 跳转到【首页】
  // router.push("/home")  // 简单写法
  router.push({
    // name: "home"
    path: "/home",
  });
}


// // // // // // // // // // ↑ 路径导航 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 搜索功能 ↓ // // // // // // // // // //

// 复用与桌面顶栏同一套搜索命令面板（原 submintSearch 仅 console.log，已废弃）。
// 移动端点击搜索栏即唤起浮层，行为与桌面 ⌘K 一致。
const searchPaletteRef = ref(null);
const openSearch = () => searchPaletteRef.value?.open();

// // // // // // // // // // ↑ 搜索功能 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 底部菜单：个人中心 ↓ // // // // // // // // // //

// 【我的】弹出框
const isShowMyInfo = ref(false);
function showMyInfo() {
  isShowMyInfo.value = !isShowMyInfo.value;
}

// 【导航】弹出框
const isShowMenu = ref(false);
function showMenu() {
  isShowMenu.value = !isShowMenu.value;
}

// 切换主题
function useDarkTheme() {
  deviceInfoStore.theme = "dark";
}

function useLightTheme() {
  deviceInfoStore.theme = "light";
}
// // // // // // // // // // ↑ 底部菜单：个人中心 ↑ // // // // // // // // // //


</script>

<template>
  <!-- 搜索触发栏：满宽，点击唤起命令面板（与桌面 ⌘K 同一实例）。
       原 el-col span="24" 在此场景收缩成内容宽度（约 126px）居中、又窄又贴图，
       改为普通 div + CSS 满宽，并与 hero 留出上方呼吸空间。 -->
  <div class="search_row">
    <button type="button" class="search_trigger" @click="openSearch">
      <svg
        class="search_trigger_icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.2-4.2" />
      </svg>
      <span>搜索文章…</span>
    </button>
  </div>

  <!-- 站内搜索命令面板（移动端搜索栏复用此实例） -->
  <SearchPalette ref="searchPaletteRef" />

  <div class="bottom_menu">
    <div class="menu_item" @click="showMenu">
      <span class="iconfont icon-a-066_quanbu menu_icon"></span>
      <el-text class="menu_title" type="info">导航</el-text>
    </div>

    <div class="menu_item" @click="goHomeClick">
      <span class="iconfont icon-home2 menu_icon"></span>
      <el-text class="menu_title" type="info">主页</el-text>
    </div>

    <div class="menu_item" @click="showMyInfo">
      <span class="iconfont icon-user menu_icon"></span>
      <el-text class="menu_title" type="info">我的</el-text>
    </div>

    <el-drawer
      v-model="isShowMenu"
      direction="btt"
      :show-close="false"
      size="30%"
      :with-header="false"
    >
      <template #default>
        <div class="bottomMenuItems">
          <div class="bottomMenuItem">导航1</div>
          <div class="bottomMenuItem">导航2</div>
        </div>
      </template>
    </el-drawer>

    <el-drawer
      v-model="isShowMyInfo"
      direction="btt"
      :show-close="false"
      size="30%"
      :with-header="false"
    >
      <template #default>
        <div class="bottomMenuItems" v-if="isLogin">
          <div class="bottomMenuItem">个人中心</div>
          <div class="bottomMenuItem">我的消息</div>
          <div class="bottomMenuItem">邀请码</div>
          <div class="bottomMenuItem" @click="logout">退出</div>
        </div>

        <div class="bottomMenuItems" v-if="!isLogin">
          <div class="bottomMenuItem" @click="deviceInfoStore.isShowLoginDialog = true">
            登录
          </div>
          <div
            class="bottomMenuItem"
            @click="deviceInfoStore.isShowRegisterDialog = true"
          >
            注册
          </div>
          <div
            class="bottomMenuItem"
            v-if="deviceInfoStore.webTheme !== 'dark'"
            @click="useDarkTheme"
          >
            深色主题
          </div>
          <div
            class="bottomMenuItem"
            v-if="deviceInfoStore.webTheme === 'dark'"
            @click="useLightTheme"
          >
            浅色主题
          </div>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<style scoped>
/* ↓ 底部菜单设计 ↓ */

/* ↑ 底部菜单设计 ↑ */

.bottomMenuItems {
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 100%;
}

.bottomMenuItem {
  margin-bottom: 20px;
  text-align: center;
  font-size: 1.5em;
  background-color: var(--small_screen_menu_bg);
  color: var(--small_screen_menu_font);
  border-radius: 30%;
}

.myInfoItem:hover {
  color: var(--small_screen_menu_font_activate);
}

/* ↓ 底部设计 ↓ */

.menu_item {
  margin: 10px auto;
}

.menu_title {
  display: block;
}

.menu_icon {
  display: block;
  font-size: 26px;
}

.bottom_menu {
  height: 60px;
  width: 100%;
  background-color: var(--header_background);
  position: fixed;
  bottom: 0px;
  display: flex;
  justify-content: space-evenly;
  z-index: 100;
}

/* ↑ 底部设计 ↑ */

/* ↓ 顶部设计 ↓ */

.search_row {
  background-color: var(--home_background);
  /* 上方与 hero 拉开呼吸距离；左右用 4px（var(--space-1)）与精选/文章列表
     的侧缩对齐，三者左右一条线，下方略收避免贴着图片 */
  padding: 16px var(--space-1) 8px;
}

/* 搜索触发栏：满宽，外观似输入框，点击唤起命令面板 */
.search_trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: 11px var(--space-4);
  font-family: var(--font-body);
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  text-align: left;
  background: var(--color-bg-inset);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: border-color var(--motion-fast) var(--ease-standard);
}

.search_trigger:hover {
  border-color: var(--color-primary);
}

.search_trigger_icon {
  width: 17px;
  height: 17px;
  flex: none;
}

.top_menu {
  padding-right: 20px;
  margin-top: 3px;
}

/* ↑ 顶部设计 ↑ */
</style>
