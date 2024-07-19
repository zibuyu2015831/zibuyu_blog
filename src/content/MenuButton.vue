<script setup>
import { ref } from "vue";
import useDeviceInfo from "@/stores/deviceInfo";
import useUserInfo from "@/stores/userInfo";
// // // // // // // // // // ↓ 读取状态 ↓ // // // // // // // // // //

const deviceInfoStore = useDeviceInfo();
const userInfoStore = useUserInfo();

// 切换主题颜色
function changeTheme(theme) {
  deviceInfoStore.theme = theme;
}

// // // // // // // // // // ↑ 读取状态 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 组件属性定义 ↓ // // // // // // // // // //

const props = defineProps({
  title: {
    type: String,
    default: "",
  },

  size: {
    type: String,
    default: "60%",
  },

  iconSize: {
    type: Number,
    default: 16,
  },

  direction: {
    type: String,
    default: "ltr",
  },
});

const withHeater = ref(false);

// 检查是否传入了标题
if (props.title) {
  withHeater.value = true;
}

// 检查是否正确传入了方向
const directions = ["rtl", "ltr", "ttb", "btt"];
if (!directions.includes(props.direction)) {
  props.direction = "ttb";
}

// 计算图标大小
const iconSize = props.iconSize || 16;

// // // // // // // // // // ↑ 组件属性定义 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

// 下拉框是否出现
const drawer = ref(false);

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //
</script>

<template>
  <span class="iconfont icon-daohang menu_icon" @click="drawer = true"></span>

  <el-drawer
    v-model="drawer"
    :with-header="withHeater"
    :size="props.size"
    :direction="props.direction"
  >
    <template #header>
      <h2>{{ title }}</h2>
    </template>

    <template #default>
      <div class="nav">
        <div class="menu">
          <div class="menu_item">
            <span class="icon-user iconfont"></span>
            <span v-if="userInfoStore.isLogin">个人中心</span>
            <span
              v-if="!userInfoStore.isLogin"
              @click="deviceInfoStore.isShowLoginDialog = true"
              >登录账号</span
            >
          </div>

          <div class="menu_item">
            <span class="icon-chess-one iconfont"></span>
            <router-link to="/home">
              <span>前往博客</span>
            </router-link>
          </div>

          <div class="menu_item" @click="deviceInfoStore.isShowReawrdDialog = true">
            <span class="icon-link iconfont"></span>

            <span>打赏作者</span>
          </div>

          <div
            v-if="deviceInfoStore.webTheme === 'light'"
            @click="changeTheme('dark')"
            class="menu_item"
          >
            <span class="icon-night iconfont"></span>

            <span>深色主题</span>
          </div>

          <div
            v-if="deviceInfoStore.webTheme === 'dark'"
            @click="changeTheme('light')"
            class="menu_item"
          >
            <span class="icon-daytime-mode iconfont"></span>

            <span>浅色主题</span>
          </div>
        </div>

        <div>
          <el-divider />

          <div >
            <div class="intro">
              这是一个公益项目，没有收费；但出于运行压力的考虑，有聊天次数限制；有建议可以在 <span style="color: rgb(226, 144, 144);">【打赏】</span> 界面里留言~
            </div>
            <div class="author">(子不语)</div>
          </div>
        </div>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
/* ↓ 菜单项目样式 ↓ */

.nav{
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.intro{
  font-size: 13px;
  line-height: 24px;
}

.author{
  font-size: 12px;
  line-height: 24px;
  margin-top: 5px;
}


.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
}



.menu_item {
  width: 50vw;
  text-align: center;
  margin: 0 0 clamp(10px, 1.3vh, 25px);
  padding: 5px;
  font-size: clamp(18px, 3.5vh, 35px);
  font-weight: 400;
  border-radius: 20px;
  cursor: pointer;
}

.menu_item:hover {
  background-color: var(--menu_button_activate_bg);
}

.menu span.iconfont {
  font-size: clamp(18px, 3vh, 20px);
  margin-right: 15px;
}

/* ↑ 菜单项目样式 ↑ */

/* ↓ 菜单图标样式 ↓ */

.menu_icon {
  color: var(--english_top_menu_icon);
  font-size: calc(v-bind(iconSize) * 1px);
}

/* ↑ 菜单图标样式 ↑ */

/* ↓ 弹出框中图片样式 ↓ */
.card_item {
  display: flex;
  justify-content: space-around;
}

.card_item .block {
  margin: 5px 30px;
  display: inline-block;
  text-align: center;
}

.card_item img {
  width: 120px;
  height: 120px;
}

/* ↑ 弹出框中图片样式 ↑ */
</style>
