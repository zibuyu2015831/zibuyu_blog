<script setup>
import useDeviceInfo from "@/stores/deviceInfo";
import { storeToRefs } from "pinia";
import { ref, onMounted, computed, reactive, onBeforeUnmount } from "vue";
import { ElMessage } from "element-plus";
// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 打赏弹出框 ↓ // // // // // // // // // //

const userRewardDialogVisible = ref(false); // 打赏提示框

// // // // // // // // // // ↑ 打赏弹出框 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 交互信息的按钮功能 ↓ // // // // // // // // // //

const copyText = async (textToCopy) => {
  try {
    await navigator.clipboard.writeText(textToCopy);
    ElMessage({
      message: "复制成功",
      type: "success",
    });
    console.log("");
  } catch (err) {
    ElMessage.error("复制失败");
  }
};

// // // // // // // // // // ↑ 交互信息的按钮功能 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 关于CSS布局的常量 ↓ // // // // // // // // // //
const messageMarginBottom = ref(12);
// // // // // // // // // // ↑ 关于CSS布局的常量 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 文字按钮的出现与隐藏 ↓ // // // // // // // // // //

function show_button(event) {
  const buttonElement = event.target.nextElementSibling;
  console.log(buttonElement);
  if (buttonElement && buttonElement.classList.contains("react_content_button")) {
    buttonElement.style.display = "block";
  }
}

function hide_button(event) {
  const buttonElement = event.target.querySelector(".react_content_button");
  if (buttonElement && buttonElement.classList.contains("react_content_button")) {
    buttonElement.style.display = "none";
  }
}

// // // // // // // // // // ↑ 文字按钮的出现与隐藏 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

const deviceInfoStore = useDeviceInfo();

const { isEnglishWebShowLeft, isEnglishButtonSmall } = storeToRefs(deviceInfoStore);

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //

// 切换主题颜色
function changeTheme(theme) {
  deviceInfoStore.theme = theme;
}

// // // // // // // // // // ↓ 配置弹出框 ↓ // // // // // // // // // //

// 配置弹出框
const botSettingVisible = ref(false);

function showSetting(role) {
  if (role === "ai") {
    botSettingVisible.value = true;
  }
}

const botSetting = reactive({
  translate: false, // 是否开启翻译（用户发送中文时，给出英文表达）
  grammarCheck: false, // 是否开启语法检测（用户发送英文时，给出语法检测）
  voiceEvaluate: false, // 是否开启语音评测
  answerExample: false, // 是否给出回答示例
  collectWord: false, // 是否自动收集重难点单词
});

// // // // // // // // // // ↑ 配置弹出框 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 响应式布局 ↓ // // // // // // // // // //

const inputBottom = 25; // 输入区域距离底部的位置（单位px）

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

    const height =
      deviceInfoStore.userScreenHeight -
      inputHeight -
      titleHeight.value -
      inputBottom -
      30;

    // 确定中间聊天框的高度
    messageAreaRef.value.style.height = `${height}px`;
  }
}

function resetChatAreaWidth() {
  console.log("chatAreaRef.value.offsetWidth ", chatAreaRef.value.offsetWidth);
  console.log("chatAreaRef.value.clientWidth ", chatAreaRef.value.clientWidth);
  console.log("chatAreaRef.value.scrollWidth ", chatAreaRef.value.scrollWidth);

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
          <div class="bottom_item">
            <span class="icon-user iconfont"></span>
            <span>个人中心</span>
          </div>

          <div class="bottom_item">
            <span class="icon-chess-one iconfont"></span>
            <router-link to="/home">
              <span>前往博客</span>
            </router-link>
            
          </div>

          <div class="bottom_item" @click="userRewardDialogVisible=true">
            <span class="icon-link iconfont"></span>

            <span>打赏作者</span>
          </div>

          <div
            v-if="deviceInfoStore.webTheme === 'light'"
            @click="changeTheme('dark')"
            class="bottom_item"
          >
            <span class="icon-night iconfont"></span>

            <span>深色主题</span>
          </div>

          <div
            v-if="deviceInfoStore.webTheme === 'dark'"
            @click="changeTheme('light')"
            class="bottom_item"
          >
            <span class="icon-daytime-mode iconfont"></span>

            <span>浅色主题</span>
          </div>
        </div>

        <el-dialog v-model="userRewardDialogVisible" title="谢谢您的喜欢~" width="500">
          <div class="card_item">
            <div class="block">
              <img
                clsaa="card_img"
                src="@/assets/image/reward_code_wechat.jpg"
              />
              <div class="card_img_title">微信</div>
            </div>
            <div class="block">
              <img
                clsaa="card_img"
                src="@/assets/image/reward_code_alipay.jpg"
              />
              <div class="card_img_title">支付宝</div>
            </div>
          </div>

        </el-dialog>

      </div>
    </div>

    <div class="right">
      <div class="chat_area" ref="chatAreaRef">
        <div class="title_area" ref="titleAreaRef">
          <div class="right_icon" v-if="!isEnglishWebShowLeft">
            <span class="iconfont icon-caidan_"></span>
          </div>

          <div class="title" ref="chatTitleRef">
            <span>我是标题</span>
          </div>
        </div>

        <div class="message_area" ref="messageAreaRef">
          <div
            class="message_parent clear-fix"
            v-for="(item, index) in chatHistory.data"
            :key="index"
          >
            <div
              :class="{
                react_content_user: item.role === 'user',
                react_content_ai: item.role === 'ai',
              }"
              @mouseleave="hide_button"
            >
              <div class="avatar" @click="showSetting(item.role)"></div>
              <div @mouseenter="show_button">
                <div class="content">{{ item.content }}</div>
              </div>

              <div class="react_content_button" v-if="item.role === 'ai'">
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="播放"
                  placement="bottom-start"
                >
                  <span class="icon-play-circle-o iconfont"></span>
                </el-tooltip>

                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="刷新"
                  placement="bottom-start"
                >
                  <span class="icon-conmentrefresh iconfont"></span>
                </el-tooltip>

                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="示例"
                  placement="bottom-start"
                >
                  <span class="icon-message iconfont"></span>
                </el-tooltip>

                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="遮盖"
                  placement="bottom-start"
                >
                  <span class="icon-a-juxing2221 iconfont"></span>
                </el-tooltip>

                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="复制"
                  placement="bottom-start"
                >
                  <span
                    class="icon-copy3 iconfont copy_icon"
                    @click="copyText(item.content)"
                  ></span>
                </el-tooltip>
              </div>

              <div class="react_content_button" v-if="item.role === 'user'">
                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="播放"
                  placement="bottom-start"
                >
                  <span class="icon-play-circle-o iconfont"></span>
                </el-tooltip>

                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="语法"
                  placement="bottom-start"
                >
                  <span class="icon-message iconfont"></span>
                </el-tooltip>

                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="评分"
                  placement="bottom-start"
                >
                  <span class="icon-information-o iconfont"></span>
                </el-tooltip>

                <el-tooltip
                  class="box-item"
                  effect="dark"
                  content="复制"
                  placement="bottom-start"
                >
                  <span
                    class="icon-copy3 iconfont copy_icon"
                    @click="copyText(item.content)"
                  ></span>
                </el-tooltip>
              </div>
            </div>
          </div>
        </div>

        <div class="input_area" ref="inputAreaRef">
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

        <el-dialog v-model="botSettingVisible" title="功能开关" width="350">
          <div class="setting_items">
            <div class="setting_item">
              <span class="setting_item_text">是否开启语法检测：</span>

              <el-tooltip
                class="box-item"
                effect="dark"
                content="当输入英文时，将同时进行检测语法"
                placement="right-start"
              >
                <el-switch
                  v-model="botSetting.grammarCheck"
                  inline-prompt
                  active-text="是"
                  inactive-text="否"
                  size="large"
                />
              </el-tooltip>
            </div>

            <div class="setting_item">
              <span class="setting_item_text">是否开启中文翻译：</span>

              <el-tooltip
                class="box-item"
                effect="dark"
                content="当输入中文时，将同时给出对应的英文表达"
                placement="right-start"
              >
                <el-switch
                  v-model="botSetting.translate"
                  inline-prompt
                  active-text="是"
                  inactive-text="否"
                  size="large"
                />
              </el-tooltip>
            </div>

            <div class="setting_item">
              <span class="setting_item_text">是否开启语音评测：</span>

              <el-tooltip
                class="box-item"
                effect="dark"
                content="当输入英文语音时，将同时给出语音评测分数"
                placement="right-start"
              >
                <el-switch
                  v-model="botSetting.voiceEvaluate"
                  inline-prompt
                  active-text="是"
                  inactive-text="否"
                  size="large"
                />
              </el-tooltip>
            </div>

            <div class="setting_item">
              <span class="setting_item_text">是否开启回答提示：</span>

              <el-tooltip
                class="box-item"
                effect="dark"
                content="将同时输出回答提示，防止没有交流思路"
                placement="right-start"
              >
                <el-switch
                  v-model="botSetting.answerExample"
                  inline-prompt
                  active-text="是"
                  inactive-text="否"
                  size="large"
                />
              </el-tooltip>
            </div>

            <div class="setting_item">
              <span class="setting_item_text">是否自动收集单词：</span>

              <el-tooltip
                class="box-item"
                effect="dark"
                content="将自动收集交流过程的重难点单词，方便导出"
                placement="right-start"
              >
                <el-switch
                  v-model="botSetting.collectWord"
                  inline-prompt
                  active-text="是"
                  inactive-text="否"
                  size="large"
                />
              </el-tooltip>
            </div>
          </div>
        </el-dialog>

      </div>
    </div>
  </div>
</template>

<style scoped>
.clear-fix::after {
  content: "";
  display: block; /* 必须设置为块级元素 */
  clear: both;

  /* 以下是为了兼容其他浏览器 */
  visibility: hidden;
  height: 0;
  line-height: 0; /* 行高为0；*/
  height: 0; /* 高度为0；*/
  font-size: 0; /* 字体大小为0；*/
}

/* ↓ 打赏界面 ↓ */

.card_item{
  display: flex;
  justify-content: space-around;
}

.card_item .block {
  margin: 5px 30px;
  display: inline-block;
  text-align: center;
}

.card_item img {
  width: 120px;
  height: 120px;
}
/* ↑ 打赏界面 ↑ */

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
  margin-top: 12px;
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
  height: 25vh;
  min-height: 200px;
  bottom: 0;
}

.left .bottom .content {
  margin-top: 20px;
  margin-left: 30px;
  display: inline-block;
  text-align: left;
}

.left .bottom .content .bottom_item {
  margin: 18px 0;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
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
  margin-bottom: calc(v-bind(messageMarginBottom) * 1px);
  margin-left: 50px;
  float: left;
  clear: both;
  position: relative;
  border-radius: 10px;
}
.react_content_ai .content {
  position: relative;
  background-color: var(--english_reacte_content_ai_bg);
  padding: 10px;
  border-radius: 15px;
}

.react_content_ai .avatar {
  height: 35px;
  width: 35px;
  position: absolute;
  left: -45px;
  top: 2px;
  background-size: cover;
  background-image: url("@/assets/image/ai_avatar.png");
  cursor: pointer;
}

.react_content_user {
  max-width: 65%;
  padding: 10px;
  margin-right: 60px;
  margin-bottom: calc(v-bind(messageMarginBottom) * 1px);
  float: right;
  clear: both;
  position: relative;
  border-radius: 10px;
}

.react_content_user .content {
  position: relative;
  background-color: var(--english_reacte_content_user_bg);
  padding: 10px;

  border-radius: 15px;
}

.react_content_user .avatar {
  height: 35px;
  width: 35px;
  position: absolute;
  right: -45px;
  top: 2px;
  background-size: contain;
  background-image: url("@/assets/image/user_avatar.png");
}

.chat_area .input_area {
  position: fixed;
  bottom: calc(v-bind(inputBottom) * 1px);
  z-index: 999;

  width: 40vw;
  height: 72px;
  text-align: center;
}

.react_content_button span {
  margin-right: 15px;
}

.message_area .react_content_ai .react_content_button {
  position: absolute;
  bottom: -12px;
  left: 20px;
  display: none;
}

.message_area .react_content_user .react_content_button {
  position: absolute;
  bottom: -12px;
  right: 15px;
  display: none;
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

/* ↓ 弹出框样式 ↓ */

.setting_items {
  font-size: 17px;
  display: flex;
  flex-direction: column;
}

.setting_item {
  margin: 5px auto;
}

.setting_item_text {
  margin-right: 15px;
}

/* ↑ 弹出框样式 ↑ */

/* ↓ 滚动条设置 ↓ */
.message_area::-webkit-scrollbar {
  width: 3px;
  height: 1px;
}

.message_area::-webkit-scrollbar-thumb {
  background: var(--english_scrollbar);
}

.message_area::-webkit-scrollbar-track {
  background-color: var(--english_scrollbar_bg);
}

.message_area::-webkit-scrollbar-button {
  background-color: var(--english_scrollbar);
}

.message_area::-webkit-scrollbar-button:hover {
  background-color: #999999;
}

/* ↑ 滚动条设置 ↑ */
</style>
