<script setup>
import { ref, reactive } from "vue";
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

// 表单引用与校验规则（#12 输入校验）
const suggestionFormRef = ref(null);
const suggestionRules = {
  note: [
    { required: true, message: "您好像忘记填写反馈内容了 0.0", trigger: "blur" },
    { max: 500, message: "反馈内容请控制在 500 字以内", trigger: "blur" },
  ],
  contact: [{ max: 100, message: "联系方式太长了", trigger: "blur" }],
};

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

async function submitUserSuggestion() {
  if (!suggestionFormRef.value) return;
  const valid = await suggestionFormRef.value.validate().catch(() => false);
  if (!valid) return;

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
  <el-card :style="{ 'max-width': cardWidth }" class="card">
    <template #header>
      <div class="card-header">
        <span class="title">意见反馈</span>
      </div>
    </template>

    <el-form
      ref="suggestionFormRef"
      :label-position="'top'"
      label-width="auto"
      :model="userSuggestion"
      :rules="suggestionRules"
      style="max-width: 600px"
    >
      <el-form-item label="联系方式" prop="contact">
        <el-input v-model="userSuggestion.contact" placeholder="微信 / QQ / 邮箱皆可" />
      </el-form-item>
      <el-form-item label="建议反馈" prop="note">
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
  box-shadow: 1px 2px 2px 2px var(--home_hover_shadow);
  transform: scale(1.02);
  transition: transform 0.3s;
}

.title {
  font-size: 20px;
  font-weight: 800;
}

/* ↑ 代码块 ↑ */
</style>
