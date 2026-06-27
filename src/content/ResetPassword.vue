<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";
import useDeviceInfo from "@/stores/deviceInfo";
import { base64Encode } from "@/utils/encoding";
import { handleError } from "@/utils/errorHandler";

const deviceInfoStore = useDeviceInfo();

// // // // // // // // // // ↓ 注册功能 ↓ // // // // // // // // // //

const userInfo = reactive({
  username: "",
  password: "",
  again_password: "",
  authenticateCode: "",
});

// 表单引用与校验规则（#12 输入校验）
const resetFormRef = ref(null);
const resetRules = {
  password: [{ required: true, message: "请填写新的密码！", trigger: "blur" }],
  again_password: [
    { required: true, message: "请再次输入新的密码！", trigger: "blur" },
    {
      validator: (rule, value, callback) =>
        value === userInfo.password
          ? callback()
          : callback(new Error("两次密码输入不一致，请检查")),
      trigger: "blur",
    },
  ],
  authenticateCode: [
    { required: true, message: "请填写授权码！", trigger: "blur" },
    { len: 32, message: "【授权码】格式错误，请检查", trigger: "blur" },
  ],
};

function cancelResetPassword() {
  deviceInfoStore.isShowResetPasswordDialog = false;
  userInfo.password = "";
  userInfo.again_password = "";
  userInfo.authenticateCode = "";
}

async function commitResetPassword() {
  if (!resetFormRef.value) return;
  const valid = await resetFormRef.value.validate().catch(() => false);
  if (!valid) return;

  const data = base64Encode(userInfo.password);

  const headers = {
    "Content-Type": "application/json",
    "User-Agent": navigator.userAgent, // 自动获取 User-Agent
    Origin: window.location.origin, // 自动获取 Origin
    Referer: document.referrer, // 自动获取 Referer
  };

  fetch("/api/account/reset_pwd/", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      data: data,
      authenticate_code: userInfo.authenticateCode,
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
          message: "密码重置成功，即将跳转到登陆界面",
          type: "success",
        });

        userInfo.password = "";
        userInfo.again_password = "";
        userInfo.authenticateCode = "";

        setTimeout(() => {
          deviceInfoStore.isShowResetPasswordDialog = false;
          deviceInfoStore.isShowLoginDialog = true;
        }, 1300);
      } else if (code === 2004) {
        ElMessage({
          message: "授权码已失效",
          type: "error",
        });
      } else if (code === 9001) {
        ElMessage({
          message: "该账号尚未注册，请先注册账号",
          type: "warning",
        });
      } else {
        ElMessage({
          message: "未知错误，重置密码失败",
          type: "error",
        });
      }
    })
    .catch((error) => {
      handleError(error, { message: "未知错误，重置密码失败" });
    });
}

function login_now() {
  deviceInfoStore.isShowLoginDialog = true;
  deviceInfoStore.isShowResetPasswordDialog = false;
}

// // // // // // // // // // ↑ 注册功能 ↑ // // // // // // // // // //
</script>

<template>
  <el-dialog
    v-model="deviceInfoStore.isShowResetPasswordDialog"
    :width="deviceInfoStore.dialogWidth"
    :lock-scroll="false"
    class="auth-dialog"
  >
    <template #header>
      <div class="auth-head">
        <span class="auth-seal">改</span>
        <h2 class="auth-title">重置密码</h2>
      </div>
    </template>

    <el-form
      ref="resetFormRef"
      :label-position="'top'"
      label-width="auto"
      :model="userInfo"
      :rules="resetRules"
      style="max-width: 500px"
    >
      <el-form-item label="新密码" prop="password">
        <el-input
          v-model="userInfo.password"
          type="password"
          placeholder="请输入新的密码"
        />
      </el-form-item>

      <el-form-item label="再次输入密码" prop="again_password">
        <el-input
          v-model="userInfo.again_password"
          type="password"
          placeholder="请再次输入密码"
        />
      </el-form-item>

      <el-form-item label="操作授权码" prop="authenticateCode">
        <el-input
          v-model="userInfo.authenticateCode"
          placeholder="关注公众号【思维兵工厂】，回复“授权码”"
        />
      </el-form-item>

      <div class="auth-qr">
        <img src="@/assets/image/official_wechat.jpg" alt="思维兵工厂公众号二维码" />
        <div class="auth-qr__cap">
          扫码关注，获取<em>授权码</em>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog_footer">
        <span>
          <el-button class="auth-btn-text" @click="login_now">
            前往登录
          </el-button>
        </span>

        <span>
          <el-button class="auth-btn-ghost" @click="cancelResetPassword">取消</el-button>
          <el-button class="auth-btn-primary" @click="commitResetPassword"> 确定 </el-button>
        </span>
      </div>
    </template>
  </el-dialog>
</template>

<!-- 弹窗主题样式见全局 src/assets/css/auth-dialog.css（.auth-dialog 命名空间） -->
