<script setup>
import useDeviceInfo from "@/stores/deviceInfo";
import useAiEnglish from "@/stores/aiEnglish";

import { storeToRefs } from "pinia";
import { ref, computed, reactive } from "vue";
import { ElMessage } from "element-plus";

import InputBar from "@/content/InputBar.vue";
import MenuButton from "@/content/MenuButton.vue";

// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

const aiEnglishStore = useAiEnglish();
const deviceInfoStore = useDeviceInfo();

const { isEnglishWebShowLeft } = storeToRefs(deviceInfoStore);

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 关于CSS布局的常量 ↓ // // // // // // // // // //

const messageMarginBottom = ref(12);

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
    chatHistory.value.data[text_id].isHidden = false;
    event.target.classList.remove("hidden_text");
  }
}

// 隐藏文本
function hiddenText(text_id) {
  console.log("text_id", text_id);
  chatHistory.value.data[text_id].isHidden = true;
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
    ElMessage.error("复制失败");
  }
};

// // // // // // // // // // ↑ 消息下方的按钮 ↑ // // // // // // // // // //

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
  hiddenWord: false, // 是否自动收集重难点单词
  autoAudio: false, // 是否自动收集重难点单词
});

// // // // // // // // // // ↑ 配置弹出框 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 聊天记录获取 ↓ // // // // // // // // // //

const chatHistory = ref({
  hasPrevious: true,

  data: {
    1: {
      content: "ai发送的内容",
      role: "ai",
      isHidden: false,
    },
    2: {
      content: "用户发送的内容",
      role: "user",
      isHidden: false,
    },
    3: {
      content: "ai发送的内容",
      role: "ai",
      isHidden: false,
    },
    4: {
      content:
        "用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容",
      role: "user",
      isHidden: false,
    },
    5: {
      content:
        "ai发送的内容ai发送的内容ai发送的内容ai发送的内容ai发送的内容ai发送的内容ai发送的内容ai发送的内容",
      role: "ai",
      isHidden: true,
    },
    6: {
      content: "用户发送的内容",
      role: "user",
      isHidden: false,
    },
    7: {
      content: "ai发送的内容",
      role: "ai",
      isHidden: false,
    },
    8: {
      content: "用户发送的内容",
      role: "user",
      isHidden: false,
    },
    9: {
      content: "ai发送的内容",
      role: "ai",
      isHidden: false,
    },
    10: {
      content:
        "用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容",
      role: "user",
      isHidden: false,
    },
    11: {
      content:
        "ai发送的内容ai发送的内容ai发送的内容ai发送的内容ai发送的内容ai发送的内容ai发送的内容ai发送的内容",
      role: "ai",
      isHidden: true,
    },
    12: {
      content: "用户发送的内容",
      role: "user",
      isHidden: false,
    },
  },
});

// // // // // // // // // // ↑ 聊天记录获取 ↑ // // // // // // // // // //

// 切换功能菜单
const changeCommand = (command) => {
  aiEnglishStore.currentConmand = command;
};

// 处理用户输入
const handleInput = (content) => {
  resetChatAreaSize();
  console.log("用户输入的是：", content);
};
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

    <div class="message_area">
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
            <div :id="index" class="content">
              <span
                @click="showText($event, index)"
                :class="{ hidden_text: item.role === 'ai' && item.isHidden }"
                >{{ item.content }}</span
              >
            </div>
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
              <span class="icon-refresh iconfont"></span>
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
              <span @click="hiddenText(index)" class="icon-a-juxing2221 iconfont"></span>
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

    <div class="input_area">
      <InputBar :handle-submit="handleInput"> </InputBar>

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

  flex-grow: 1;
  flex-shrink: 1;
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
  right: -40px;
  top: 12px;
  background-size: contain;
  background-image: url("@/assets/image/user_avatar.png");
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
