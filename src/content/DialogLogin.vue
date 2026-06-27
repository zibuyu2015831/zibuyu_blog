<script setup>
import { ref, reactive } from "vue";

import { ElMessage } from "element-plus";

import useUserInfo from "@/stores/userInfo";
import useDeviceInfo from "@/stores/deviceInfo";
import { base64Encode } from "@/utils/encoding";
import { handleError } from "@/utils/errorHandler";

const userInfoStore = useUserInfo();
const deviceInfoStore = useDeviceInfo();

// // // // // // // // // // ↓ 登录功能 ↓ // // // // // // // // // //

const loginInfo = reactive({
  username: "",
  password: "",
});

// 表单引用与校验规则（#12 输入校验）
const loginFormRef = ref(null);
const loginRules = {
  username: [
    { required: true, message: "请填写用户名！", trigger: "blur" },
    { max: 50, message: "用户名太长了", trigger: "blur" },
  ],
  password: [{ required: true, message: "请填写登录密码！", trigger: "blur" }],
};

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
function loginfailed(msg) {
  ElMessage({
    message: msg,
    type: "error",
  });
}

function generateRandomString(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const numericCharacters = "0123456789";
  let randomString = "";

  for (let i = 0; i < length - 1; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(randomIndex);
  }

  // 确保最后一位是数字
  const randomNumericIndex = Math.floor(Math.random() * numericCharacters.length);
  randomString += numericCharacters.charAt(randomNumericIndex);

  return randomString;
}

function isDigitOdd(randomString) {
  // 获取字符串的最后一位
  const lastChar = randomString.charAt(randomString.length - 1);

  // 将最后一位转换为数字类型
  const lastDigit = parseInt(lastChar, 10);

  // 判断数字是奇数还是偶数
  if (isNaN(lastDigit)) {
    return true;
  } else if (lastDigit % 2 === 0) {
    return false;
  } else {
    return true;
  }
}

async function commitLogin() {
  if (!loginFormRef.value) return;
  const valid = await loginFormRef.value.validate().catch(() => false);
  if (!valid) return;

  const splitChar = generateRandomString(10);
  const encodedUsername = base64Encode(loginInfo.username);
  const encodedPassword = base64Encode(loginInfo.password);

  const user_data = ref("");
  const check_result = isDigitOdd(splitChar);

  if (check_result) {
    user_data.value = `${encodedUsername}${splitChar}${encodedPassword}`;
  } else {
    user_data.value = `${encodedPassword}${splitChar}${encodedUsername}`;
  }

  const headers = {
    "Content-Type": "application/json",
    "User-Agent": navigator.userAgent, // 自动获取 User-Agent
    Origin: window.location.origin, // 自动获取 Origin
    Referer: document.referrer, // 自动获取 Referer
  };

  fetch("/api/account/login/", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      data: user_data.value,
      login_code: splitChar,
    }),
  })
    .then((res) => {

      if (!res.ok) {
        throw new Error("Network response was not ok " + res.statusText);
      }
      return res.json(); // 响应应该是 JSON 格式的
    })
    .then((data) => {
      const code = data.code;

      if (code === 0) {
        // 消息提示：登录成功
        loginSuccess();

        userInfoStore.userToken = data.token;
        userInfoStore.username = data.username;
        userInfoStore.isLogin = true;

        loginInfo.username = "";
        loginInfo.password = "";

        localStorage.setItem('token',data.token)
      } else if (code == 2004) {
        // 消息提示：登录失败
        loginfailed("登录失败，请检查用户名或密码！");
      } else {
        // 消息提示：登录失败
        loginfailed("其他错误，登录失败！");
      }
    })
    .catch((error) => {
      handleError(error, { message: "未知错误，登录失败" });
    });
}

function register_now() {
  deviceInfoStore.isShowLoginDialog = false;
  deviceInfoStore.isShowRegisterDialog = true;
}

function forget_pwd() {
  deviceInfoStore.isShowLoginDialog = false;
  deviceInfoStore.isShowResetPasswordDialog = true;
}

// // // // // // // // // // ↑ 登录功能 ↑ // // // // // // // // // //
</script>

<template>
  <el-dialog
    v-model="deviceInfoStore.isShowLoginDialog"
    :width="deviceInfoStore.dialogWidth"
    :lock-scroll="false"
    class="auth-dialog"
  >
    <template #header>
      <div class="auth-head">
        <span class="auth-seal">登</span>
        <h2 class="auth-title">登录</h2>
      </div>
    </template>

    <el-form
      ref="loginFormRef"
      :label-position="'top'"
      label-width="auto"
      :model="loginInfo"
      :rules="loginRules"
      style="max-width: 500px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="loginInfo.username" autofocus placeholder="忘记用户名？可在公众号【思维兵工厂】，发送【用户名】获取"/>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input v-model="loginInfo.password" type="password" show-password/>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog_footer">
        <span>
          <el-button class="auth-btn-text" @click="register_now">
            注册
          </el-button>
          <el-button class="auth-btn-text" @click="forget_pwd">
            忘记密码
          </el-button>
        </span>

        <span>
          <el-button class="auth-btn-ghost" @click="cancelLogin">取消</el-button>
          <el-button class="auth-btn-primary" @click="commitLogin"> 登录 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
</template>

<!-- 弹窗主题样式见全局 src/assets/css/auth-dialog.css（.auth-dialog 命名空间） -->
