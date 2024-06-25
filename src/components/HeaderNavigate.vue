<script setup>
import { ElMessage } from "element-plus";

import { ref, reactive } from "vue";
import useDeviceInfo from "@/stores/deviceInfo.js";
import useUserInfo from "@/stores/userInfo";
import { setLocalStorageWithExpiration } from "@/utils/uselocalStorage";
import { storeToRefs } from "pinia";


// // // // // // // // // // ↓ 切换主题 ↓ // // // // // // // // // //

// 当用户切换主题时，修改html类属性，并将主题写入浏览器本地存储
function themeChange() {
  document.documentElement.className = "";
  document.documentElement.classList.add(deviceInfo.theme);

  setLocalStorageWithExpiration(deviceInfo.theme_store_key, webTheme.value, 8);
}

// // // // // // // // // // ↑ 切换主题 ↑ // // // // // // // // // //

// // // // // ↓ 根据屏幕向下滚动距离更改导航栏背景色 ↓ // // // // //

const deviceInfo = useDeviceInfo(); // 执行函数，拿到Store
const userInfo = useUserInfo(); // 执行函数，拿到Store

const { TextColor, webTheme } = storeToRefs(deviceInfo); // 读取状态
const { username, isLogin } = storeToRefs(userInfo); // 读取状态

// // // // // ↑ 根据屏幕向下滚动距离更改导航栏背景色 ↑ // // // // //

// // // // // // // // // // ↓ 注册功能 ↓ // // // // // // // // // //

const registerDialogVisible = ref(false); // 注册跳出框

const registerInfo = reactive({
  username: "",
  password: "",
  registerCode: "",
});

function cancelRegister() {
  registerDialogVisible.value = false;
}

function commitRegister() {
  registerDialogVisible.value = false;
}

function register_now() {
  loginDialogVisible.value = false;
  registerDialogVisible.value = true;
}

// // // // // // // // // // ↑ 注册功能 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 登录功能 ↓ // // // // // // // // // //

const loginDialogVisible = ref(false); // 登录跳出框

const loginInfo = reactive({
  username: "",
  password: "",
});

// 取消登录
function cancelLogin() {
  loginDialogVisible.value = false;
  loginInfo.username = "";
  loginInfo.password = "";
}

// 退出登录
function resetLogin() {
  // 从localStorage移除token
  localStorage.removeItem("login_token");
  userInfo.isLogin = false;
  userInfo.username = "";

  ElMessage({
    message: "您已经退出登录~",
    type: "info",
  });
}

// 消息提示：登录成功
function loginSuccess() {
  ElMessage({
    message: "登录成功！",
    type: "success",
  });
}

// 消息提示：登录失败
function loginfailed() {
  ElMessage({
    message: "登录失败，请检查用户名或密码！",
    type: "error",
  });
}

function commitLogin() {
  loginDialogVisible.value = false;

  //  模拟登录时写入token
  const user_token = "123456";

  if (user_token) {
    //  将登录状态写入状态管理
    sessionStorage.setItem("login_token", user_token);
    userInfo.userToken = user_token;
    userInfo.username = loginInfo.username;
    userInfo.isLogin = true;

    console.log("useUserInfo.isLogin ", userInfo.isLogin);
    console.log("useUserInfo.username ", userInfo.username);
    console.log("useUserInfo.userToken ", userInfo.userToken);

    loginInfo.username = "";
    loginInfo.password = "";

    // 消息提示：登录成功
    loginSuccess();
  } else {
    // 消息提示：登录失败
    loginfailed();
  }
}

function login_now() {
  loginDialogVisible.value = true;
  registerDialogVisible.value = false;
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
  <el-row class="nav_container" :class="{nav_background:deviceInfo.isShowNavBackground}">
    <el-col span="12" class="nav_left">
      <router-link to="/home" class="text_logo">思维兵工厂</router-link>

      <router-link to="/home"
        ><el-text type="danger" size="large" tag="b">首页</el-text></router-link
      >

      <router-link to="/about"
        ><el-text type="danger" size="large" tag="b">关于</el-text></router-link
      >

      <router-link to="/article/1231"
        ><el-text type="danger" size="large" tag="b">官方文档</el-text></router-link
      >
    </el-col>

    <el-col span="12" class="nav_right" :style="{ color: TextColor }">


      <div class="theme">
        <el-radio-group
          v-model="deviceInfo.theme"
          @change="themeChange"
          size="small"
          fill="#3170a7"
          text-color="#fff"
        >
          <el-radio-button label="&#xe71c;&nbsp;夜晚" value="dark" class="iconfont" />
          <el-radio-button label="&#xe60c;&nbsp;白天" value="light" class="iconfont" />
        </el-radio-group>
      </div>

      <div class="not_login" v-if="!isLogin">
        <el-button
          type="warning"
          round
          size="large"
          class="login_button button"
          @click="loginDialogVisible = true"
        >
          登录
        </el-button>

        <el-button
          type="info"
          round
          size="large"
          class="register_button button"
          @click="registerDialogVisible = true"
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

    <el-dialog v-model="loginDialogVisible" width="500">
      <el-form
        :label-position="'top'"
        label-width="auto"
        :model="loginInfo"
        style="max-width: 600px"
      >
        <el-form-item label="用户名" :required="true">
          <el-input v-model="loginInfo.username" />
        </el-form-item>
        <el-form-item label="密码" :required="true">
          <el-input v-model="loginInfo.password" type="password" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog_footer">
          <span>
            <el-button type="warning" class="register_now" @click="register_now">
              没有账号？立刻注册
            </el-button>
          </span>

          <span>
            <el-button @click="cancelLogin">取消</el-button>
            <el-button type="primary" @click="commitLogin"> 登录 </el-button>
          </span>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="registerDialogVisible" width="500">
      <el-form
        :label-position="'top'"
        label-width="auto"
        :model="loginInfo"
        style="max-width: 600px"
      >
        <el-form-item label="用户名" :required="true">
          <el-input v-model="registerInfo.username" />
        </el-form-item>

        <el-form-item label="密码" :required="true">
          <el-input v-model="registerInfo.password" type="password" />
        </el-form-item>

        <el-form-item label="再次输入密码" :required="true">
          <el-input v-model="registerInfo.password" type="password" />
        </el-form-item>

        <el-form-item label="邀请码" :required="true">
          <el-input
            v-model="registerInfo.registerCode"
            placeholder="关注公众号【思维兵工厂】，回复“邀请码”"
          />
        </el-form-item>

        <div class="card_item">
          <div class="block">
            <img
              clsaa="card_img"
              src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
            />
            <div class="card_img_title">扫码关注，获取邀请码</div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog_footer">
          <span>
            <el-button type="warning" class="login_now" @click="login_now">
              已有账号？前往登录
            </el-button>
          </span>
          <span>
            <el-button @click="cancelRegister">取消</el-button>
            <el-button type="primary" @click="commitRegister"> 注册 </el-button>
          </span>
        </div>
      </template>
    </el-dialog>
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

.dialog_footer {
  display: flex;
  justify-content: space-between;
}

.card_item {
  margin: 5px 30px;
  text-align: center;
}

.card_item img {
  display: inline-block;
  width: 100px;
  height: 100px;
}

.card_item .card_img_title {
  margin-top: 10px;
}

.nav_container {
  top: 0;
  width: 100%;
  position: fixed;
  transition: all 0.3s;
  z-index: 999;

  a {
    line-height: 60px;
    margin-right: 30px;
    font-size: 16px;
    text-decoration: none;
    cursor: pointer;
  }
}

.nav_background{
  background-color: var(--header_background,#ffffff);
  opacity: 0.9;
}

.nav_left {
  color: var(--header_font);
  margin: 0 auto;
  line-height: 60px;

  .text_logo {
    font-size: 25px;
    display: inline-block;
    margin: auto 20px;

    margin-bottom: auto;
    margin-left: 20px;
    margin-right: 50px;
  }
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
