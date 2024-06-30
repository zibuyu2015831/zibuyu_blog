<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import useUserInfo from "@/stores/userInfo";
import useDeviceInfo from "@/stores/deviceInfo";

const userInfoStore = useUserInfo();
const deviceInfoStore = useDeviceInfo();

// // // // // // // // // // ↓ 登录功能 ↓ // // // // // // // // // //

const loginInfo = reactive({
  username: "",
  password: "",
});

// 取消登录
function cancelLogin() {
  deviceInfoStore.isShowLoginDialog = false;
  loginInfo.username = "";
  loginInfo.password = "";
}

// 消息提示：登录成功
function loginSuccess() {
  ElMessage({
    message: "登录成功！",
    type: "success",
  });
  deviceInfoStore.isShowLoginDialog = false;
}

// 消息提示：登录失败
function loginfailed() {
  ElMessage({
    message: "登录失败，请检查用户名或密码！",
    type: "error",
  });
}

function commitLogin() {
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

function register_now() {
  deviceInfoStore.isShowLoginDialog = false;
  deviceInfoStore.isShowRegisterDialog = true;
}

// // // // // // // // // // ↑ 登录功能 ↑ // // // // // // // // // //
</script>

<template>
  <el-dialog v-model="deviceInfoStore.isShowLoginDialog" :width="deviceInfoStore.dialogWidth" :lock-scroll="false">
    <el-form
      :label-position="'top'"
      label-width="auto"
      :model="loginInfo"
      style="max-width: 500px"
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
</template>

<style scoped>
.dialog_footer {
  display: flex;
  justify-content: space-between;
}
</style>
