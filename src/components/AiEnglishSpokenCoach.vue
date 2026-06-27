<script setup>
import useDeviceInfo from "@/stores/deviceInfo";
import useAiEnglish from "@/stores/aiEnglish";
import useUserInfo from "@/stores/userInfo";
import { sanitizeAIResponse } from "@/utils/sanitize";
import { handleUnauthorized } from "@/utils/auth";

import { storeToRefs } from "pinia";
import { ref, computed, reactive, nextTick, onMounted } from "vue";
import { ElMessage } from "element-plus";

import InputBar from "@/content/InputBar.vue";
import MenuButton from "@/content/MenuButton.vue";
import { Marked } from "marked";
import hljs from "highlight.js";
import { markedHighlight } from "marked-highlight";
import "highlight.js/styles/atom-one-dark-reasonable.css";

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

const aiEnglishStore = useAiEnglish();
const deviceInfoStore = useDeviceInfo();
const userInfoStore = useUserInfo();

const { isEnglishWebShowLeft } = storeToRefs(deviceInfoStore);

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ markdown文本渲染 ↓ // // // // // // // // // //

const marked = new Marked();

marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "shell";
      return hljs.highlight(code, { language }).value;
    },
  })
);

// // // // // // // // // // ↑ markdown文本渲染 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 关于CSS布局的常量 ↓ // // // // // // // // // //

const messageAreaRef = ref(null);

// 聊天框中，消息的下间距
const messageMarginBottom = ref(8);

// 标题高度
const titleHeight = computed(() => {
  return 55;
});

// // // // // // // // // // ↑ 关于CSS布局的常量 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 消息下方的按钮 ↓ // // // // // // // // // //

// 显示按钮
function show_button(event) {
  const buttonElement = event.target.nextElementSibling;
  if (buttonElement && buttonElement.classList.contains("react_content_button")) {
    buttonElement.style.display = "block";
  }
}

// 隐藏按钮
function hide_button(event) {
  const buttonElement = event.target.querySelector(".react_content_button");
  if (buttonElement && buttonElement.classList.contains("react_content_button")) {
    buttonElement.style.display = "none";
  }
}

// 显示文本
function showText(event, text_id) {
  if (event.target.classList.contains("hidden_text")) {
    aiEnglishStore.english_messages.data[text_id].isHidden = false;
    event.target.classList.remove("hidden_text");
  }
}

// 隐藏文本
function hiddenText(event, text_id) {
  aiEnglishStore.english_messages.data[text_id].isHidden = !aiEnglishStore
    .english_messages.data[text_id].isHidden;
}

// 刷新回答
function renew_answer(event, text_id) {
  aiEnglishStore.removeEnglishMessagesByIndex(text_id);
  handleConversation();
}

// 复制文本
const copyText = async (textToCopy) => {
  try {
    await navigator.clipboard.writeText(textToCopy);
    ElMessage({
      message: "复制成功",
      type: "success",
    });
  } catch (err) {
    try {
      const tempInput = document.createElement("input");
      tempInput.value = textToCopy;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      ElMessage({
        message: "复制成功",
        type: "success",
      });
    } catch (err) {
      ElMessage.error("复制失败");
    }
  }
};

// // // // // // // // // // ↑ 消息下方的按钮 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 配置弹出框 ↓ // // // // // // // // // //

// 弹出框的显示
const botSettingVisible = ref(false);

// 切换显示状态
function showSetting(role) {
  if (role === "assistant") {
    botSettingVisible.value = true;
  }
}

const botSetting = reactive({
  translate: false, // 是否开启翻译（用户发送中文时，给出英文表达）
  grammarCheck: false, // 是否开启语法检测（用户发送英文时，给出语法检测）
  voiceEvaluate: false, // 是否开启语音评测
  answerExample: false, // 是否给出回答示例
  collectWord: false, // 是否自动收集重难点单词
  hiddenWord: false, // 是否隐藏文本
  autoAudio: false, // 是否自动播放音频
});

// // // // // // // // // // ↑ 配置弹出框 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 消息交互 ↓ // // // // // // // // // //

const canSendMessage = ref(true);

// 将消息加入队列
function addMessage(role, content) {
  aiEnglishStore.english_messages.data.push({
    content: content,
    role: role,
    isHidden: false,
  });
}

// 处理用户输入
const handleInput = async (content) => {
  if (!content) {
    ElMessage.error("内容为空");
    return;
  }

  if (!canSendMessage.value) {
    ElMessage.error("AI正在回复, 请稍等~");
    return;
  }

  // 将用户发送到消息加入队列
  addMessage("user", content);

  // 将聊天框拉到最下面
  nextTick(() => {
    messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;
  });

  handleConversation();
};

const handleConversation = async () => {
  try {
    canSendMessage.value = false;
    await nextTick();

    await conversation();
  } catch {
    const lastData =
      aiEnglishStore.assistant_messages.data[
        aiEnglishStore.assistant_messages.data.length - 1
      ];

    if (lastData.role == "assistant") {
      lastData.content = "AI回复获取失败0.0";
    } else {
      addMessage("assistant", "AI回复获取失败0.0");
    }
  } finally {
    canSendMessage.value = true;
    // 将聊天框拉到最下面
    nextTick(() => {
      messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;
    });
  }
};

async function conversation() {
  addMessage("assistant", "");

  // 用户发送的最后一条消息
  const userMessage =
    aiEnglishStore.english_messages.data[aiEnglishStore.english_messages.data.length - 2];

  // AI即将回复的消息
  const lastData =
    aiEnglishStore.english_messages.data[aiEnglishStore.english_messages.data.length - 1];

  if (botSetting.hiddenWord) {
    lastData.isHidden = true;
  }

  // 将滚动条拉到最后
  nextTick(() => {
    messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;
  });

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${userInfoStore.token}`,
  };

  const response = await fetch("/api/english/english_chat/", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      question: userMessage.content,

      translate: botSetting.translate,
      grammarCheck: botSetting.grammarCheck,
      answerExample: botSetting.answerExample,

      voiceEvaluate: botSetting.voiceEvaluate,
      collectWord: botSetting.collectWord,
      autoAudio: botSetting.autoAudio,
    }),
  });

  if (!response.ok) {
    // token 被服务端拒绝（撤销 / 触发监控）：统一清理登录态并提示重新登录
    if (response.status === 401) {
      handleUnauthorized();
    }
    lastData.content = "AI回复获取失败0.0";

    // 将滚动条拉到最后
    nextTick(() => {
      messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;
    });
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let reserveText = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    const chunkString = decoder.decode(value, { stream: true });

    const lines = chunkString.split("\n").filter((line) => line.trim() !== "");

    for (const jsonLine of lines) {
      if (!jsonLine) {
        continue;
      }

      if (jsonLine === "<<<end>>>") {
        break;
      }

      if (jsonLine === "<<<error>>>") {
        break;
      }

      try {
        const jsonData = JSON.parse(jsonLine.trim());
        const content = jsonData.delta;

        if (content) {
          reserveText += content;

          lastData.content = marked.parse(reserveText);

          // 将滚动条拉到最后
          nextTick(() => {
            messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;
          });
        }
      } catch (error) {
        console.log("-----------------");
        console.log(jsonLine);
        console.log("-----------------");

        console.error("出错了:", error);
      }
    }
  }
}

// // // // // // // // // // ↑ 消息交互 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 全局代码 ↓ // // // // // // // // // //

onMounted(() => {
  nextTick(() => {
    if (messageAreaRef.value) {
      messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;
    }
  });
});

// 切换功能菜单
const changeCommand = (command) => {
  aiEnglishStore.currentConmand = command;
};

// // // // // // // // // // ↑ 全局代码 ↑ // // // // // // // // // //
</script>

<template>
  <div class="chat_area">
    <div class="title_area">
      <div class="right_icon" v-if="!isEnglishWebShowLeft">
        <span>
          <MenuButton :iconSize="30"></MenuButton>
        </span>
      </div>

      <div class="title">
        <span class="center_title" v-if="isEnglishWebShowLeft">
          <span>{{ aiEnglishStore.currentConmand }}</span>
        </span>

        <el-dropdown v-if="!isEnglishWebShowLeft">
          <span>
            <span class="dropdown_title">{{ aiEnglishStore.currentConmand }}</span>
            <span class="iconfont icon-down_b title_drawdown_icon"></span>
          </span>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                :disabled="key === aiEnglishStore.currentConmand"
                v-for="(value, key) in aiEnglishStore.commands"
                :key="key"
                @click="changeCommand(key)"
                trigger="click"
                divided
              >
                <span class="dropdown_title_item">{{ key }}</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="message_area" ref="messageAreaRef">
      <div
        class="message_parent clear-fix"
        v-for="(item, index) in aiEnglishStore.english_messages.data"
        :key="index"
      >
        <div
          :class="{
            react_content_user: item.role === 'user',
            react_content_ai: item.role === 'assistant',
          }"
          @mouseleave="hide_button"
        >
          <div class="avatar" @click="showSetting(item.role)"></div>
          <div @mouseenter="show_button">
            <div :id="index" class="content">
              <div
                v-html="sanitizeAIResponse(item.content)"
                :class="{ hidden_text: item.role === 'assistant' && item.isHidden }"
                @click="showText($event, index)"
              ></div>
            </div>
          </div>

          <div class="react_content_button" v-if="item.role === 'assistant'">
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
              v-if="index == aiEnglishStore.english_messages.data.length - 1"
            >
              <span
                class="icon-refresh iconfont"
                @click="renew_answer($event, index)"
              ></span>
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
              <span
                @click="hiddenText($event, index)"
                class="icon-a-juxing2221 iconfont"
              ></span>
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
      <div class="final_message clear-fix"></div>
    </div>

    <div class="input_area">
      <InputBar :handle-submit="handleInput" :can-send-message="canSendMessage">
      </InputBar>

      <div class="tip">交互内容由AI生成，请注意鉴别</div>
    </div>

    <el-dialog v-model="botSettingVisible" title="功能开关" width="350" center>
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

        <div class="setting_item">
          <span class="setting_item_text">是否自动模糊文本：</span>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="开启后将模糊文本，专注练习听力"
            placement="right-start"
          >
            <el-switch
              v-model="botSetting.hiddenWord"
              inline-prompt
              active-text="是"
              inactive-text="否"
              size="large"
            />
          </el-tooltip>
        </div>

        <div class="setting_item">
          <span class="setting_item_text">是否自动播放语音：</span>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="开启后将自动播放语音"
            placement="right-start"
          >
            <el-switch
              v-model="botSetting.autoAudio"
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
</template>

<style scoped>
/* ↓ 右侧布局 ↓ */

.chat_area {
  margin: 0 auto;
  height: 100%;
  max-width: 900px;
  position: relative;
  display: flex;
  flex-direction: column;
}

.chat_area .title_area {
  height: calc(v-bind(titleHeight) * 1px);

  z-index: 999;

  flex-grow: 0;
  flex-shrink: 0;

  display: flex;
}

.chat_area .title_area .right_icon {
  vertical-align: bottom;
  text-align: center;

  display: inline-block;
  height: calc(v-bind(titleHeight) * 1px);

  flex-grow: 0;
  flex-shrink: 0;
}

.chat_area .title_area .right_icon span {
  line-height: calc(v-bind(titleHeight) * 1px);
  height: calc(v-bind(titleHeight) * 1px);
  font-size: clamp(20px, 4vw, 30px); /* 默认字体大小为20px */
  margin-left: 30px;
  color: var(--english_top_menu_icon);
}

.center_title {
  border-radius: 15px;
  padding: 10px 20px;
}

.chat_area .title_area .title {
  font-size: 22px;
  height: calc(v-bind(titleHeight) * 1px);
  vertical-align: bottom;
  text-align: center;
  display: inline-block;
  flex-grow: 1;
  flex-shrink: 1;
}

.chat_area .title_area .title span {
  line-height: calc(v-bind(titleHeight) * 1px);
}

.title_drawdown_icon {
  margin-left: 8px;
  font-size: 20px;
}

.dropdown_title {
  font-size: 22px;
  height: calc(v-bind(titleHeight) * 1px);
}

.dropdown_title_item {
  padding: 5px;
  border-radius: 15px;
  font-size: 18px;
}

.chat_area .message_area {
  overflow-y: auto; /* 根据内容溢出自动显示滚动条 */
  margin: 0;
  font-size: 17px;
  line-height: 28px;
  flex-grow: 1;
  flex-shrink: 1;
}

.react_content_ai {
  max-width: 75%;
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

.hidden_text {
  filter: blur(3px);
}

.react_content_ai .avatar {
  height: 35px;
  width: 35px;
  position: absolute;
  left: -40px;
  top: 12px;
  background-size: cover;
  background-image: url("@/assets/image/ai_avatar.png");
  cursor: pointer;
}

.react_content_user {
  max-width: 75%;
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
  right: -40px;
  top: 12px;
  background-size: contain;
  background-image: url("@/assets/image/user_avatar.png");
}

/* final_message用于调整窗口 */

.final_message {
  height: 20px;
  width: 100%;
  float: left;
  clear: both;
}

.chat_area .input_area {
  z-index: 2;
  padding-top: 15px;
  width: 100%;
  text-align: center;
  flex-grow: 0;
  flex-shrink: 0;
}

.react_content_button span {
  margin-right: 15px;
}

.message_area .react_content_ai .react_content_button {
  position: absolute;
  bottom: -18px;
  left: 20px;
  display: none;
}

.message_area .react_content_user .react_content_button {
  position: absolute;
  bottom: -18px;
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

/* ↑ 右侧布局 ↑ */

/* ↓ 弹出框样式 ↓ */

.setting_items {
  font-size: 17px;
  display: flex;
  flex-direction: column;

  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0,10 Q25,20 50,10 Q75,0 100,10 Z" fill="skyblue"/></svg>');
  background-repeat: no-repeat;
  background-position: bottom;
  background-size: 100% 20px; /* 调整SVG的高度 */
  padding-bottom: 20px; /* 确保内容不会被背景图像遮挡 */
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
