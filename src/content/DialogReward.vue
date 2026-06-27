<script setup>
import { ElMessage } from "element-plus";
import useDeviceInfo from "@/stores/deviceInfo";

// 执行函数，拿到Store
const deviceInfoStore = useDeviceInfo();

// // // // // // ↓ 打赏弹出框 ↓ // // // // // //

function resetUserRewardMessage() {
  deviceInfoStore.isShowReawrdDialog = false;

  deviceInfoStore.userRewardInfo.name = "";
  deviceInfoStore.userRewardInfo.note = "";
  deviceInfoStore.userRewardInfo.contact = "";
}

function submitUserRewardMessage() {
  deviceInfoStore.isShowReawrdDialog = false;

  console.log(deviceInfoStore.userRewardInfo.note);
  console.log(deviceInfoStore.userRewardInfo.contact);
  console.log("submit!");

  deviceInfoStore.userRewardInfo.name = "";
  deviceInfoStore.userRewardInfo.note = "";
  deviceInfoStore.userRewardInfo.contact = "";

  ElMessage({
    message: "留言成功",
    type: "success",
  });
}

// // // // // // ↑ 打赏弹出框 ↑ // // // // // //
</script>

<template>
  <el-dialog
    v-model="deviceInfoStore.isShowReawrdDialog"
    :width="deviceInfoStore.dialogWidth"
    :lock-scroll="false"
    class="auth-dialog"
  >
    <template #header>
      <div class="auth-head">
        <span class="auth-seal">赏</span>
        <h2 class="auth-title">谢谢您的喜欢</h2>
      </div>
    </template>

    <div class="auth-qr auth-qr--pair">
      <div class="auth-qr__item">
        <img src="@/assets/image/reward_code_wechat.jpg" alt="微信收款码" />
        <div class="auth-qr__label">微信</div>
      </div>
      <div class="auth-qr__item">
        <img src="@/assets/image/reward_code_alipay.jpg" alt="支付宝收款码" />
        <div class="auth-qr__label">支付宝</div>
      </div>
    </div>

    <el-form
      :label-position="'top'"
      label-width="auto"
      :model="deviceInfoStore.userRewardInfo"
      style="max-width: 500px"
    >
      <el-form-item label="您的昵称">
        <el-input
          v-model="deviceInfoStore.userRewardInfo.name"
          placeholder="少侠，留下你的昵称呗"
        />
      </el-form-item>
      <el-form-item label="您的留言">
        <el-input
          v-model="deviceInfoStore.userRewardInfo.note"
          type="textarea"
          placeholder="期待与少侠交流"
          resize="none"
        />
      </el-form-item>
      <el-form-item label="您的联系方式">
        <el-input
          v-model="deviceInfoStore.userRewardInfo.contact"
          placeholder="少侠，留下你的联系方式呗"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog_footer is-end">
        <el-button class="auth-btn-ghost" @click="resetUserRewardMessage">取消</el-button>
        <el-button class="auth-btn-primary" @click="submitUserRewardMessage"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<!-- 弹窗主题样式见全局 src/assets/css/auth-dialog.css（.auth-dialog 命名空间） -->
