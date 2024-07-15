<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import useDeviceInfo from "@/stores/deviceInfo";

const deviceInfoStore = useDeviceInfo();

const { isEnglishButtonSmall } = storeToRefs(deviceInfoStore);

const props = defineProps({
  handleSubmit: {
    type: Function,
  },

  buttonSize: {
    type: String,
    default: "default",
  },

  canSendMessage: {
    type: Boolean,
    default: true,
  },
});

const inputContent = ref("");

// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

// 边框颜色
const borderColor = ref("#333ce1");

// 聚焦时加重边框颜色
function heavierBorder() {
  borderColor.value = "#333ce1";
}

// 失去聚焦时减轻边框颜色
function lighterBorder() {
  borderColor.value = "#989cea";
}
// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //

// 文本输入框自动调整行数
const handlerHeight = (e) => {
  const textarea = e.target;

  // Reset height to auto to get the correct scroll height
  textarea.style.height = "auto";
  let height = textarea.scrollHeight;

  // Set max height
  if (height > 200) {
    height = 200;
  }

  deviceInfoStore.englishInputAreaHeight = height;

  textarea.style.height = `${height}px`;
};

function Submit(){
  props.handleSubmit(inputContent.value); // 提交表单
  inputContent.value = ''
} 

// 处理键盘事件
const handleKeyDown = (e) => {
  if (e.key === "Enter" && !e.ctrlKey) {
    e.preventDefault(); // 阻止默认的换行行为
    props.handleSubmit(inputContent.value); // 提交表单
    inputContent.value = "";
  } else if (e.key === "Enter" && e.ctrlKey) {
    // 阻止默认的换行行为
    e.preventDefault();

    // 手动添加换行符
    inputContent.value += "\n";

    // 调整文本输入框的高度，注意这里使用setTimeout是一种更安全的做法，因为它确保了在浏览器完成所有必要的更新后再进行高度调整。这样可以避免因浏览器尚未更新 DOM 而导致的潜在问题。
    setTimeout(() => {
      handlerHeight(e);
    }, 0);
  }
};
</script>

<template>
  <form action="" class="input_form">
    <textarea
      rows="1"
      @input="handlerHeight"
      placeholder="Enter发送; Ctrl+Enter换行"
      autofocus
      @focus="heavierBorder"
      @blur="lighterBorder"
      v-model="inputContent"
      @keydown="handleKeyDown"
    ></textarea>

    <div class="button">
      <span class="iconfont icon-voice audio_button"></span>
      <span class="iconfont icon-tingzhi1 audio_button" v-if="!props.canSendMessage"></span>

      <el-button
        type="success"
        round
        class="submit_button"
        :size="isEnglishButtonSmall ? 'default' : 'large'"
        @click="Submit"
        v-if="props.canSendMessage"
      >
        发 送
      </el-button>
    </div>
  </form>
</template>

<style scoped>
/* ↓ 整体样式 ↓ */

.input_form {
  position: relative;
  margin: 0 auto;
  width: 90%;
  padding: 2px;
  display: flex;
  justify-content: center;
  border-radius: 25px;
  background-color: var(--english_input_area_bg);
  outline: 2px solid v-bind(borderColor);
}

/* 重置表单元素的默认样式 */
.input_form textarea {
  margin: 0;
  padding: 12px 0 12px 15px;
  background: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  border: none;
  line-height: 28px;

  font-size: clamp(16px, 2vh, 22px);

  resize: none;
  vertical-align: bottom;
  display: inline-block;
  flex-grow: 1;
  flex-shrink: 1;
}
/* ↑ 整体样式 ↑ */

/* ↓ 按钮样式 ↓ */
.button {
  flex-grow: 0;
  flex-shrink: 0;
  margin: auto 12px auto 0;
}

.input_form .audio_button {
  cursor: pointer;
  font-size: 28px;
  margin-right: 15px;
  color: var(--english_audio_icon);
  vertical-align: bottom;
}

.tip {
  font-size: 14px;
  height: 20px;
  color: var(--english_input_area_tip);
  padding: 0;
  line-height: 20px;
  margin-top: 5px;
}

/* ↑ 按钮样式 ↑ */
</style>
