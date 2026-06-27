<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import useDeviceInfo from "@/stores/deviceInfo";
import { base64Encode } from "@/utils/encoding";
import { handleError } from "@/utils/errorHandler";

const deviceInfoStore = useDeviceInfo();

// // // // // // // // // // ↓ 注册功能 ↓ // // // // // // // // // //

const registerInfo = reactive({
  username: "",
  password: "",
  again_password: "",
  inviteCode: "",
});

// 表单引用与校验规则（#12 输入校验）
const registerFormRef = ref(null);
const registerRules = {
  username: [
    { required: true, message: "请填写用户名", trigger: "blur" },
    { max: 50, message: "用户名太长了", trigger: "blur" },
  ],
  password: [{ required: true, message: "请填写密码", trigger: "blur" }],
  again_password: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    {
      validator: (rule, value, callback) =>
        value === registerInfo.password
          ? callback()
          : callback(new Error("两次密码输入不一致，请检查")),
      trigger: "blur",
    },
  ],
  inviteCode: [
    { required: true, message: "请填写邀请码", trigger: "blur" },
    { len: 32, message: "【邀请码】格式错误，请检查", trigger: "blur" },
  ],
};

function cancelRegister() {
  deviceInfoStore.isShowRegisterDialog = false;
  registerInfo.username = "";
  registerInfo.password = "";
  registerInfo.again_password = "";
  registerInfo.inviteCode = "";
}

async function commitRegister() {
  if (!registerFormRef.value) return;
  const valid = await registerFormRef.value.validate().catch(() => false);
  if (!valid) return;

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
      handleError(error, { message: "未知错误，注册失败" });
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
    class="auth-dialog"
  >
    <template #header>
      <div class="auth-head">
        <span class="auth-seal">注</span>
        <h2 class="auth-title">注册</h2>
      </div>
    </template>

    <el-form
      ref="registerFormRef"
      :label-position="'top'"
      label-width="auto"
      :model="registerInfo"
      :rules="registerRules"
      style="max-width: 500px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="registerInfo.username" placeholder="请输入用户名" />
      </el-form-item>

      <el-form-item label="密码" prop="password">
        <el-input
          v-model="registerInfo.password"
          type="password"
          placeholder="请输入密码"
        />
      </el-form-item>

      <el-form-item label="再次输入密码" prop="again_password">
        <el-input
          v-model="registerInfo.again_password"
          type="password"
          placeholder="请再次输入密码"
        />
      </el-form-item>

      <el-form-item label="邀请码" prop="inviteCode">
        <el-input
          v-model="registerInfo.inviteCode"
          placeholder="关注公众号【思维兵工厂】，回复“邀请码”"
        />
      </el-form-item>

      <div class="auth-qr">
        <img src="@/assets/image/official_wechat.jpg" alt="思维兵工厂公众号二维码" />
        <div class="auth-qr__cap">
          扫码关注，获取<em>邀请码</em>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog_footer">
        <span>
          <el-button class="auth-btn-text" @click="login_now">
            已有账号？前往登录
          </el-button>
        </span>

        <span>
          <el-button class="auth-btn-ghost" @click="cancelRegister">取消</el-button>
          <el-button class="auth-btn-primary" @click="commitRegister"> 注册 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
</template>

<!-- 弹窗主题样式见全局 src/assets/css/auth-dialog.css（.auth-dialog 命名空间） -->
