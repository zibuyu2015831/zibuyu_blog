<script setup>
import { reactive } from "vue";
import { ElNotification } from "element-plus";
// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

const props = defineProps({
  width: {
    type: [Number, String],
    default: 480,
    validator(value) {
      // 尝试将字符串转换为数字
      const num = Number(value);
      if (!isNaN(num)) {
        return true;
      }
      // 如果无法转换为数字，则使用默认值
      this.width = 480;
      return false;
    },
  },
});

const cardWidth = `${props.width}px`;

const userSuggestion = reactive({
  note: "",
  contact: "",
});

function resetUserSuggestion() {
  userSuggestion.note = "";
  userSuggestion.contact = "";

  ElNotification({
    title: "意见反馈",
    message: "已重置反馈信息",
    position: "bottom-right",
    type: "info",
  });
}

function submitUserSuggestion() {
  if (!userSuggestion.note) {
    ElNotification({
      title: "意见反馈",
      message: "您好像忘记填写反馈内容了 0.0",
      position: "bottom-right",
      type: "warning",
    });

    return;
  }

  console.log("意见反馈-联系方式：", userSuggestion.contact);
  console.log("意见反馈-具体内容：", userSuggestion.note);

  userSuggestion.note = "";
  userSuggestion.contact = "";

  ElNotification({
    title: "意见反馈",
    message: "您的意见反馈已提交",
    position: "bottom-right",
    type: "success",
  });
}

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //
</script>

<template>
  <el-card :style="{ 'max-width': cardWidth }"  class="card">
    <template #header>
      <div class="card-header">
        <span class="title">意见反馈</span>
      </div>
    </template>

    <el-form
      :label-position="'top'"
      label-width="auto"
      :model="userSuggestion"
      style="max-width: 600px"
    >
      <el-form-item label="联系方式">
        <el-input v-model="userSuggestion.contact" placeholder="微信 / QQ / 邮箱皆可" />
      </el-form-item>
      <el-form-item label="建议反馈">
        <el-input
          v-model="userSuggestion.note"
          type="textarea"
          placeholder="请输入反馈内容"
          resize="none"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitUserSuggestion">提交</el-button>
        <el-button @click="resetUserSuggestion">重置</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
/* ↓ 代码块 ↓ */

.card:hover {
  box-shadow: 1px 2px 2px 2px #7a7374;
  transform: scale(1.02);
  transition: transform 0.3s;
}

.title {
  font-size: 20px;
  font-weight: 800;
}

.card:hover {
  box-shadow: 1px 2px 2px 2px #7a7374;
  transform: scale(1.02);
}

/* ↑ 代码块 ↑ */
</style>
