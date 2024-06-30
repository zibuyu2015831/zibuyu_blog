<script setup>
import { ref, reactive } from "vue";
import { ElMessage } from "element-plus";

import useUserInfo from "@/stores/userInfo";
import useDeviceInfo from "@/stores/deviceInfo";

const userInfoStore = useUserInfo();
const deviceInfoStore = useDeviceInfo();

// // // // // // // // // // ↓ 注册功能 ↓ // // // // // // // // // //

const registerInfo = reactive({
  username: "",
  password: "",
  again_password: "",
  registerCode: "",
});

function cancelRegister() {
  deviceInfoStore.isShowRegisterDialog = false;
}

function commitRegister() {
  deviceInfoStore.isShowRegisterDialog = false;
  console.log(registerInfo.username);
  console.log(registerInfo.password);
  console.log(registerInfo.registerCode);
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
      :model="loginInfo"
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
          v-model="registerInfo.registerCode"
          placeholder="关注公众号【思维兵工厂】，回复“邀请码”"
        />
      </el-form-item>

      <div class="card_item">
        <div class="block">
          <img clsaa="card_img" src="@/assets/image/official_wechat.jpg" />
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
