<script setup>
import useDeviceInfo from "@/stores/deviceInfo";
import { storeToRefs } from "pinia";
import { ref, onMounted, computed, onBeforeUpdate, onBeforeUnmount } from "vue";

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

const deviceInfoStore = useDeviceInfo();

const { isEnglishWebShowLeft, isEnglishButtonSmall } = storeToRefs(deviceInfoStore);

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 布局常量 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 布局常量 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 响应式布局 ↓ // // // // // // // // // //

const inputBottom = 25 // 输入区域距离底部的位置（单位px）


const titleHeight = computed(() => {
  return deviceInfoStore.userScreenWidth < 500 ? 40 : 55;
});

const chatAreaRef = ref(null); // 聊天区域

const titleAreaRef = ref(null); // 标题行区域
const messageAreaRef = ref(null); // 消息栏区域
const inputAreaRef = ref(null); // 输入区域区域

const textareaRef = ref(null); // 文本输入框区域
const chatTitleRef = ref(null); // 标题行

// 文本输入框自动调整行数
const handlerHeight = () => {
  if (textareaRef.value) {
    // Reset height to auto to get the correct scroll height
    textareaRef.value.style.height = "auto";
    let height = textareaRef.value.scrollHeight;

    // Set max height
    if (height > 100) {
      height = 100;
    }
    textareaRef.value.style.height = `${height}px`;

    inputAreaRef.value.style.height = `${height + 20}px`;

    resetChatAreaSize();
  }
};

function resetChatAreaSize() {
  resetChatAreaHeight();
  resetChatAreaWidth();
}

function resetChatAreaHeight() {
  if (inputAreaRef.value && titleAreaRef.value) {
    let inputHeight = inputAreaRef.value.offsetHeight;

    const height = deviceInfoStore.userScreenHeight - inputHeight - titleHeight.value -inputBottom -30;

    // 确定中间聊天框的高度
    messageAreaRef.value.style.height = `${height}px`;
  }
}

function resetChatAreaWidth() {

console.log('chatAreaRef.value.offsetWidth ',chatAreaRef.value.offsetWidth)
console.log('chatAreaRef.value.clientWidth ',chatAreaRef.value.clientWidth)
console.log('chatAreaRef.value.scrollWidth ',chatAreaRef.value.scrollWidth)

  // 确定输入区域的宽度
  inputAreaRef.value.style.width = `${chatAreaRef.value.offsetWidth}px`;

  // 确定标题区域的宽度
  titleAreaRef.value.style.width = `${chatAreaRef.value.offsetWidth}px`;

  // 确定标题区域中，标题部分的宽度
  if (isEnglishWebShowLeft.value) {
    chatTitleRef.value.style.width = `${chatAreaRef.value.offsetWidth}px`;
  } else {
    chatTitleRef.value.style.width = `${chatAreaRef.value.offsetWidth - 45}px`;
  }
}

onMounted(() => {
  resetChatAreaSize();
});

const buttonSize = computed(() => {
  return isEnglishButtonSmall.value ? "default" : "large";
});

// 挂载组件时添加屏幕尺寸变化监听函数
onMounted(() => {
  window.addEventListener("resize", resetChatAreaSize, { passive: true });
});

// 卸载组件时移除屏幕尺寸变化监听函数
onBeforeUnmount(() => {
  window.removeEventListener("resize", resetChatAreaSize, { passive: true });
});

const isFocused = ref(false);

function changeBorder() {
  isFocused.value = true;
}

function removeBorder() {
  isFocused.value = false;
}

// // // // // // // // // // ↑ 响应式布局 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 聊天记录获取 ↓ // // // // // // // // // //

const chatHistory = ref({
  hasPrevious: true,

  data: [
    {
      content: "用户发送的内容",
      role: "user",
    },
    {
      content: "ai发送的内容",
      role: "ai",
    },
    {
      content: "用户发送的内容",
      role: "user",
    },
    {
      content: "ai发送的内容",
      role: "ai",
    },
    {
      content: "用户发送的内容",
      role: "user",
    },
    {
      content: "ai发送的内容",
      role: "ai",
    },
    {
      content: "用户发送的内容",
      role: "user",
    },
    {
      content: "ai发送的内容",
      role: "ai",
    },
    {
      content: "用户发送的内容",
      role: "user",
    },
    {
      content: "ai发送的内容",
      role: "ai",
    },
    {
      content: "用户发送的内容",
      role: "user",
    },
    {
      content:
        "ai发送的内容ai发送的内容ai发送的内容ai发送的内容ai发送的内容ai发送的内容ai发送的内容ai发送的内容",
      role: "ai",
    },
    {
      content: "用户发送的内容",
      role: "user",
    },
    {
      content: "ai发送的内容",
      role: "ai",
    },
    {
      content:
        "用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容",
      role: "user",
    },
    {
      content: "ai发送的内容",
      role: "ai",
    },
    {
      content: "用户发送的内容",
      role: "user",
    },
    {
      content: "ai发送的内容",
      role: "ai",
    },
  ],
});

// // // // // // // // // // ↑ 聊天记录获取 ↑ // // // // // // // // // //
</script>

<template>
  <div class="page" :style="{ height: deviceInfoStore.userScreenHeight + 'px' }">
    <div class="left" v-if="isEnglishWebShowLeft">
      <div class="top"><span>思维兵工厂</span></div>

      <div class="middle">
        <div class="content">
          <div class="split_line"></div>
          <div class="function_item">口语陪练</div>
          <div class="function_item">作文批改</div>
          <div class="function_item">百科问答</div>
        </div>
      </div>

      <div class="bottom">
        <div class="content">
          <div>
            <span class="icon-user iconfont"></span>
            <span>个人中心</span>
          </div>
          <div>
            <span class="icon-chess-one iconfont"></span>

            <span>前往博客</span>
          </div>
          <div>
            <span class="icon-link iconfont"></span>

            <span>来个打赏</span>
          </div>
        </div>
      </div>
    </div>

    <div class="right">
      <div class="chat_area" ref="chatAreaRef">
        <div class="title_area" ref="titleAreaRef">
          <div class="right_icon" v-if="!isEnglishWebShowLeft">
            <span class="iconfont icon-caidan_"></span>
          </div>

          <div class="title" ref="chatTitleRef" >
            <span >我是标题</span>
          </div>
        </div>

        <div class="message_area" ref="messageAreaRef">
          <div
            :class="{
              react_content_user: item.role === 'user',
              react_content_ai: item.role === 'ai',
            }"
            v-for="(item, index) in chatHistory.data"
            :key="index"
          >
            <div>{{ item.content }}</div>
          </div>
        </div>

        <div class="input_area" ref="inputAreaRef" >
          <form action="" class="input_form" :class="{ focused: isFocused }">
            <textarea
              rows="1"
              ref="textareaRef"
              @input="handlerHeight"
              placeholder="请输入问题"
              autofocus
              @focus="changeBorder"
              @blur="removeBorder"
            ></textarea>
            <span class="iconfont icon-deshengyinvoice21 audio"></span>
            <el-button type="success" round class="submit_buttom" :size="buttonSize"
              >发 送</el-button
            >
          </form>
          <div class="tip">交互内容由AI生成，请注意鉴别</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ↓ 整体布局 ↓ */

.page {
  background-color: var(--english_page_bg);
  display: flex;
}

.left,
.right {
  vertical-align: top;
}

/* ↑ 整体布局 ↑ */

/* ↓ 左侧布局 ↓ */

.left {
  width: 280px;
  height: 100%;
  background-color: var(--english_left_bg);
  display: flex;
  flex-direction: column;
}

.left .top {
  width: 100%;
  height: 6vh;
  min-height: calc(v-bind(titleHeight) * 1px);
  font-size: clamp(28px, 3vh, 38px);
  text-align: center;
}

.left .top span {
  line-height: calc(v-bind(titleHeight) * 1px);
}

.left .middle {
  width: 100%;
  height: 72vh;
  text-align: center;
}

.left .middle .content {
  display: inline-block;
  width: 100%;
}

.left .middle .content .split_line {
  display: inline-block;
  width: 90%;
  border-bottom: 1px solid var(--english_left_spilit_line);
}

.left .middle .content .function_item {
  font-size: 22px;
  width: 90%;
  height: 50px;
  line-height: 50px;
  margin: 12px 10px;
  border-radius: 10px;
  background-color: var(--english_left_funtion_item);
}

.left .middle .content .function_item:hover {
  border: 3px solid var(--english_left_funtion_item_hover);
}

.left .bottom {
  width: 100%;
  height: 22vh;
  min-height: 180px;
  bottom: 0;
}

.left .bottom .content {
  margin-top: 20px;
  margin-left: 30px;
  display: inline-block;
  text-align: left;
}

.left .bottom .content div {
  margin: 18px 0;
  font-size: 18px;
  font-weight: 600;
}

.left .bottom .content span {
  margin-right: 15px;
}

/* ↑ 左侧布局 ↑ */

/* ↓ 右侧布局 ↓ */

.right {
  flex-grow: 1;
  height: 100%;
  background-color: var(--english_right_bg);
}

.right .chat_area {
  margin: 0 auto;
  height: 100%;
  max-width: 900px;
  position: relative;
}

.chat_area .title_area {
  height: calc(v-bind(titleHeight) * 1px);
  position: fixed;
  top: 0;
  z-index: 999;
}

.chat_area .title_area .right_icon {
  vertical-align: bottom;
  text-align: center;

  display: inline-block;
  height: calc(v-bind(titleHeight) * 1px);
  width: 45px;
  color: black;
}

.chat_area .title_area .right_icon span {
  line-height: calc(v-bind(titleHeight) * 1px);
  height: calc(v-bind(titleHeight) * 1px);
  font-size: clamp(20px, 4vw, 30px); /* 默认字体大小为20px */
}

.chat_area .title_area .title {
  font-size: 22px;
  height: calc(v-bind(titleHeight) * 1px);
  vertical-align: bottom;
  text-align: center;
  display: inline-block;

  width: 85%;
}

.chat_area .title_area .title span {
  line-height: calc(v-bind(titleHeight) * 1px);
}

.chat_area .message_area {
  position: relative;
  top: calc(v-bind(titleHeight) * 1px);

  overflow-y: auto; /* 根据内容溢出自动显示滚动条 */
  margin: 0;
}

.react_content_ai {
  max-width: 65%;
  padding: 10px;
  margin-bottom: 10px;
  margin-left: 50px;

  float: left;
  clear: both;
  position: relative;
  border-radius: 10px;
  background-color: var(--english_reacte_content_ai_bg);
}

.react_content_ai::before {
  content: "";
  position: absolute;
  background-image: url("@/assets/image/ai_avatar.png");
  height: 35px;
  width: 35px;
  background-size: cover; /* 或者使用 contain */

  left: -45px;
  top: 5px;
}

.react_content_user {
  max-width: 65%;

  padding: 10px;
  margin-right: 50px;
  margin-bottom: 10px;

  float: right;
  clear: both;
  position: relative;
  border-radius: 10px;
  background-color: var(--english_reacte_content_user_bg);
}

.react_content_user:after {
  content: "";
  position: absolute;
  background-image: url("@/assets/image/user_avatar.png");
  height: 35px;
  width: 35px;
  background-size: cover; /* 或者使用 contain */

  right: -40px;
  top: 10px;
}

.chat_area .input_area {
  position: fixed;
  bottom: calc(v-bind(inputBottom) * 1px);
  z-index: 999;

  width: 40vw;
  height: 72px;
  text-align: center;
}

.chat_area .input_area .tip {
  font-size: 14px;
  height: 20px;
  color: var(--english_input_area_tip);
  padding: 0;
  line-height: 20px;
  margin-top: 5px;
}

.chat_area .input_area .input_form {
  text-align: center;

  position: relative;
  margin: 0 auto;
  width: 90%;

  display: flex;
  justify-content: center;
  border-radius: 25px;

  background-color: var(--english_input_area_bg);
}

.focused {
  border: 2px solid var(--english_input_area_border_focus);
}

/* 重置表单元素的默认样式 */
.chat_area .input_area .input_form textarea {
  margin: 0;
  padding: 12px 15px;
  background: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  border: none;
  line-height: 28px;
  min-width: 52px;
  font-size: clamp(16px, 2vh, 22px);
  width: 85%;
  resize: none;
  vertical-align: bottom;
  display: inline-block;
}

.chat_area .input_area .input_form .submit_buttom {
  margin: auto 10px;
  vertical-align: bottom;
}
.chat_area .input_area .input_form .audio {
  vertical-align: bottom;

  font-size: 28px;
  margin: auto;
  color: rgb(100, 10, 10);
}

.chat_area .input_area .input_form .audio:hover {
  color: rgb(12, 225, 225);
}

/* ↑ 右侧布局 ↑ */


.message_area::-webkit-scrollbar {
  width: 3px;
  height: 1px;
}

.message_area::-webkit-scrollbar-thumb {
  background:  var( --english_scrollbar);
}

.message_area::-webkit-scrollbar-track {
  background-color: var(--english_scrollbar_bg);
}

.message_area::-webkit-scrollbar-button {
  background-color: var( --english_scrollbar);
}

.message_area::-webkit-scrollbar-button:hover {
  background-color: #999999;
}

</style>
