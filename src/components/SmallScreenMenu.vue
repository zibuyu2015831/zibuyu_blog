<script setup>
import { ref ,reactive} from "vue";
import { useRouter } from "vue-router";
import { Search } from "@element-plus/icons-vue";
import useUserInfo from "@/stores/userInfo";
import useDeviceInfo from "@/stores/deviceInfo";
import { ElButton, ElDrawer } from "element-plus";

import { storeToRefs } from "pinia";


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

function goBackClick() {
  // 函数写法
  // router.back()
  // router.forward()

  // 数字写法：go(delta)
  // go(1) -> forward()
  // go(-1) -> back()
  router.go(-1);
}

// // // // // // // // // // ↑ 路径导航 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 搜索功能 ↓ // // // // // // // // // //

const search_input = ref("");
const search_option = ref("1");

function submintSearch() {
  console.log("用户输入的搜索关键词是: ", search_input.value);
  console.log("搜索选项", search_option.value);
}

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
  userInfoStore.isLogin = false;
  userInfoStore.username = "";

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
    userInfoStore.userToken = user_token;
    userInfoStore.username = loginInfo.username;
    userInfoStore.isLogin = true;

    console.log("useUserInfo.isLogin ", userInfoStore.isLogin);
    console.log("useUserInfo.username ", userInfoStore.username);
    console.log("useUserInfo.userToken ", userInfoStore.userToken);

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

</script>

<template>
  <el-row justify="center" class="search_row">
    <el-col span="24" class="search_input">
      <el-input
        v-model="search_input"
        style="max-width: 600px"
        placeholder="请输入搜索关键词"
        class="input-with-select"
      >
        <template #prepend>
          <el-select v-model="search_option" placeholder="选项" style="width: 115px">
            <el-option label="文章" value="1" />
            <el-option label="资源" value="2" />
          </el-select>
        </template>
        <template #append>
          <el-button :icon="Search" @click="submintSearch" />
        </template>
      </el-input>
    </el-col>

    <el-col :span="2"> </el-col>
  </el-row>

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

    <el-drawer v-model="isShowMenu" direction="btt" :show-close="false" size="30%" :with-header="false">
      <template #default>
        <div class="bottomMenuItems">
          <div class="bottomMenuItem">导航1</div>
          <div class="bottomMenuItem">导航2</div>
        </div>
      </template>
    </el-drawer>

    <el-drawer v-model="isShowMyInfo" direction="btt" :show-close="false" size="30%" :with-header="false">
      <template #default>
        <div class="bottomMenuItems" v-if="isLogin">
          <div class="bottomMenuItem">个人中心</div>
          <div class="bottomMenuItem">我的消息</div>
          <div class="bottomMenuItem">邀请码</div>
          <div class="bottomMenuItem">退出</div>
        </div>

        <div class="bottomMenuItems" v-if="!isLogin">
          <div class="bottomMenuItem"  @click="loginDialogVisible = true">登录</div>
          <div class="bottomMenuItem"  @click="registerDialogVisible = true">注册</div>
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


  <el-dialog v-model="loginDialogVisible" width="300">
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
      <div class="dialog-footer">
        <span>
          <el-button type="warning" class="register_now" @click="register_now" size="small">
            没有账号？立刻注册
          </el-button>
        </span>

        <span>
          <el-button @click="cancelLogin" size="small">取消</el-button>
          <el-button type="primary" @click="commitLogin" size="small"> 登录 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="registerDialogVisible" width="300">
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

      <el-form-item label="邀请码" :required="true" >
        <el-input
          v-model="registerInfo.registerCode"
          placeholder="关注公众号，回复“邀请码”即可获取"
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
      <div class="dialog-footer">
        <span>
          <el-button type="warning" class="login_now" @click="login_now" size="small">
            已有账号？前往登录
          </el-button>
        </span>
        <span>
          <el-button @click="cancelRegister" size="small">取消</el-button>
          <el-button type="primary" @click="commitRegister" size="small"> 注册 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>

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
color: var( --small_screen_menu_font);
border-radius: 30%;
}

.myInfoItem:hover{
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
}

.search_input {
  margin: 5px 10px;
  margin-left: 15px;
}

.top_menu {
  padding-right: 20px;
  margin-top: 3px;
}

/* ↑ 顶部设计 ↑ */

.dialog-footer {
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
</style>
