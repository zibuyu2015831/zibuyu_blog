<script setup>
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
  username.value = deviceInfoStore.userRewardInfo.name;

  console.log(username.value);
  console.log(deviceInfoStore.userRewardInfo.note);
  console.log(deviceInfoStore.userRewardInfo.contact);
  console.log("submit!");

  deviceInfoStore.userRewardInfo.name = "";
  deviceInfoStore.userRewardInfo.note = "";
  deviceInfoStore.userRewardInfo.contact = "";
}

// // // // // // ↑ 打赏弹出框 ↑ // // // // // //
</script>

<template>
  <el-dialog
    v-model="deviceInfoStore.isShowReawrdDialog"
    title="谢谢您的喜欢~"
    width="500"
    :lock-scroll="false"
  >
    <div class="card_item">
      <div class="block">
        <img clsaa="card_img" src="@/assets/image/reward_code_wechat.jpg" />
        <div class="card_img_title">微信</div>
      </div>
      <div class="block">
        <img clsaa="card_img" src="@/assets/image/reward_code_alipay.jpg" />
        <div class="card_img_title">支付宝</div>
      </div>
    </div>

    <el-form
      :label-position="'top'"
      label-width="auto"
      :model="deviceInfoStore.userRewardInfo"
      style="max-width: 600px"
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
      <div class="dialog-footer">
        <el-button @click="resetUserRewardMessage">取消</el-button>
        <el-button type="primary" @click="submitUserRewardMessage"> 确定 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
/* ↓ 打赏弹出框样式 ↓ */

.card_item {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.card_item .block {
  margin: 5px 30px;
  display: inline-block;
  text-align: center;
}

.card_item img {
  display: block;
  width: 120px;
  height: 120px;
}

/* ↑ 打赏弹出框样式 ↑ */
</style>
