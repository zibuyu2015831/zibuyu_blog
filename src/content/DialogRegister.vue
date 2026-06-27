<script setup>
import { reactive } from "vue";
import { ElMessage } from "element-plus";
import useDeviceInfo from "@/stores/deviceInfo";
import { base64Encode } from "@/utils/encoding";

const deviceInfoStore = useDeviceInfo();

// // // // // // // // // // ↓ 注册功能 ↓ // // // // // // // // // //

const registerInfo = reactive({
  username: "",
  password: "",
  again_password: "",
  inviteCode: "",
});

function cancelRegister() {
  deviceInfoStore.isShowRegisterDialog = false;
  registerInfo.username = "";
  registerInfo.password = "";
  registerInfo.again_password = "";
  registerInfo.inviteCode = "";
}

function commitRegister() {
  if (
    !registerInfo.username ||
    !registerInfo.password ||
    !registerInfo.again_password ||
    !registerInfo.inviteCode
  ) {
    ElMessage({
      message: "请填写所有字段！",
      type: "error",
    });
    return;
  }

  if (registerInfo.inviteCode.length !== 32) {
    ElMessage({
      message: "【邀请码】格式错误，请检查",
      type: "error",
    });
    return;
  }

  if (registerInfo.username.length > 50) {
    ElMessage({
      message: "用户名太长了",
      type: "error",
    });
    return;
  }

  if (registerInfo.password !== registerInfo.again_password) {
    ElMessage({
      message: "两次密码输入不一致，请检查",
      type: "error",
    });
    return;
  }

  const splitChar = registerInfo.inviteCode.substring(2, 12);
  const encodedUsername = base64Encode(registerInfo.username);
  const encodedPassword = base64Encode(registerInfo.password);
  const data = `${encodedUsername}${splitChar}${encodedPassword}`;

  const headers = {
    "Content-Type": "application/json",
    "User-Agent": navigator.userAgent, // 自动获取 User-Agent
    Origin: window.location.origin, // 自动获取 Origin
    Referer: document.referrer, // 自动获取 Referer
  };

  fetch("/api/account/register/", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      data: data,
      invite_code: registerInfo.inviteCode,
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
        ElMessage({
          message: "注册成功",
          type: "success",
        });
        deviceInfoStore.isShowRegisterDialog = false;

        registerInfo.username = "";
        registerInfo.password = "";
        registerInfo.again_password = "";
        registerInfo.inviteCode = "";
      } else if (code === 2004) {
        ElMessage({
          message: "邀请码错误",
          type: "error",
        });
      } else if (code === 2005) {
        ElMessage({
          message: "该邀请码已经被注册过了！",
          type: "warning",
        });
      } else {
        ElMessage({
          message: "未知错误，注册失败",
          type: "error",
        });
      }
    })
    .catch((error) => {
      ElMessage({
        message: "未知错误，注册失败",
        type: "error",
      });
      console.error("There was a problem with the register fetch operation:", error);
    });
}

function login_now() {
  deviceInfoStore.isShowLoginDialog = true;
  deviceInfoStore.isShowRegisterDialog = false;
}

// // // // // // // // // // ↑ 注册功能 ↑ // // // // // // // // // //
</script>

<template>
  <el-dialog
    v-model="deviceInfoStore.isShowRegisterDialog"
    :width="deviceInfoStore.dialogWidth"
    :lock-scroll="false"
  >
    <el-form
      :label-position="'top'"
      label-width="auto"
      :model="registerInfo"
      style="max-width: 500px"
    >
      <el-form-item label="用户名" :required="true">
        <el-input v-model="registerInfo.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="密码" :required="true">
        <el-input
          v-model="registerInfo.password"
          type="password"
          placeholder="请输入密码"
        />
      </el-form-item>

      <el-form-item label="再次输入密码" :required="true">
        <el-input
          v-model="registerInfo.again_password"
          type="password"
          placeholder="请再次输入密码"
        />
      </el-form-item>

      <el-form-item label="邀请码" :required="true">
        <el-input
          v-model="registerInfo.inviteCode"
          placeholder="关注公众号【思维兵工厂】，回复“邀请码”"
        />
      </el-form-item>

      <div class="card_item">
        <div class="block">
          <img clsaa="card_img" src="@/assets/image/official_wechat.jpg" />
          <div class="card_img_title">
            扫码关注，获取<span style="color: red">邀请码</span>
          </div>
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
</template>

<style scoped>
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
</style>
