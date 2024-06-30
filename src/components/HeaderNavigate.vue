<script setup>
import { ElMessage } from "element-plus";
import { ref, reactive } from "vue";
import useDeviceInfo from "@/stores/deviceInfo.js";
import useUserInfo from "@/stores/userInfo";
import { setLocalStorageWithExpiration } from "@/utils/uselocalStorage";
import { storeToRefs } from "pinia";

// // // // // ↓ 状态管理 ↓ // // // // //

const deviceInfoStore = useDeviceInfo(); // 执行函数，拿到Store
const userInfoStore = useUserInfo(); // 执行函数，拿到Store

const { TextColor } = storeToRefs(deviceInfoStore); // 读取状态
const { username, isLogin } = storeToRefs(userInfoStore); // 读取状态

// // // // // ↑ 状态管理 ↑ // // // // //

// // // // // // // // // // ↓ 登录功能 ↓ // // // // // // // // // //

// 退出登录
function resetLogin() {
  // 从localStorage移除token
  localStorage.removeItem("login_token");
  userInfoStore.isLogin = false;
  userInfoStore.username = "";

  ElMessage({
    message: "您已经退出登录~",
    type: "info",
  });
}

// // // // // // // // // // ↑ 登录功能 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 登录状态下，顶栏右侧菜单栏的处理 ↓ // // // // // // // // // //

const handleCommand = (command) => {
  if (command === "restLogin") {
    resetLogin();
  }
};

// // // // // // // // // // ↑ 登录状态下，右侧菜单栏的处理 ↑ // // // // // // // // // //
</script>

<template>
  <el-row
    class="nav_container"
    :class="{ nav_background: deviceInfoStore.isShowNavBackground }"
  >
    <el-col span="12" class="nav_left">
      <router-link to="/home" class="text_logo">
        <span class="text">思维兵工厂</span>
      </router-link>

      <router-link to="/home">
        <el-text type="danger" size="large" tag="b">首页</el-text>
      </router-link>

      <router-link to="/about">
        <el-text type="danger" size="large" tag="b">关于</el-text>
      </router-link>

      <router-link to="/english_chat">
        <el-text type="danger" size="large" tag="b">英语自习室</el-text>
      </router-link>

      <router-link to="/web_site">
        <el-text type="danger" size="large" tag="b">好站收藏</el-text>
      </router-link>

      <router-link to="/test">
        <el-text type="danger" size="large" tag="b">测试</el-text>
      </router-link>

      <router-link to="/article/1231">
        <el-text type="danger" size="large" tag="b">官方文档</el-text>
      </router-link>
    </el-col>

    <el-col span="12" class="nav_right" :style="{ color: TextColor }">
      <div class="theme">
        <el-radio-group
          v-model="deviceInfoStore.theme"
          size="small"
          fill="#3170a7"
          text-color="#fff"
        >
          <el-radio-button label="&#xe71c;&nbsp;夜晚" value="dark" class="iconfont" />
          <el-radio-button label="&#xe60d;&nbsp;白天" value="light" class="iconfont" />
        </el-radio-group>
      </div>

      <div class="not_login" v-if="!isLogin">
        <el-button
          type="warning"
          round
          size="large"
          class="login_button button"
          @click="deviceInfoStore.isShowLoginDialog = true"
        >
          登录
        </el-button>

        <el-button
          type="info"
          round
          size="large"
          class="register_button button"
          @click="deviceInfoStore.isShowRegisterDialog = true"
        >
          注册
        </el-button>
      </div>

      <div class="has_login" v-if="isLogin">
        <div class="greeting">
          <el-text type="success" size="large">欢迎您 {{ username }}</el-text>
        </div>

        <el-dropdown @command="handleCommand">
          <el-avatar src="/elem/0/88/03b0d39583f48206768a7534e55bcpng.png"> </el-avatar>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                ><el-icon><UserFilled /></el-icon><span>个人中心</span></el-dropdown-item
              >
              <el-dropdown-item
                ><el-icon><Bell /></el-icon><span>我的消息</span></el-dropdown-item
              >
              <el-dropdown-item
                ><el-icon><Share /></el-icon><span>邀请码</span></el-dropdown-item
              >

              <el-dropdown-item divided command="restLogin"
                ><el-icon><Promotion /></el-icon><span>退出登录</span></el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped>
/* ↓ 导航栏右侧 ↓ */

.has_login {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.greeting {
  display: inline-block;
  margin-right: 20px;
}

/* ↑ 导航栏右侧 ↑ */

.nav_container {
  top: 0;
  width: 100%;
  position: fixed;
  transition: all 0.3s;
  z-index: 999;
}

.nav_container a {
  line-height: 60px;
  margin-right: 30px;
  font-size: 16px;
  text-decoration: none;
  cursor: pointer;
}

.nav_background {
  background-color: var(--header_background, #ffffff);
  opacity: 0.9;
}

.nav_left {
  color: var(--header_font);
  margin: 0 auto;
  line-height: 60px;
}

.nav_left .text_logo {
  font-size: 25px;
  display: inline-block;
  margin: auto 20px;

  margin-bottom: auto;
  margin-left: 20px;
  margin-right: 50px;
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

.nav_left .text_logo .text {
  animation: showup 3s forwards;
}

.nav_right {
  margin: auto;
  text-align: center;
  right: 0;
  display: flex;
  justify-content: end;
}

.nav_right .theme {
  margin-right: 40px;
  margin-top: 18px;
}

.button {
  margin-top: 10px;
  margin-right: 10px;
  font-size: 15px;
}

.button:hover {
  color: black;
}
</style>
