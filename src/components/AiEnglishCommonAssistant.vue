<script setup>
import useDeviceInfo from "@/stores/deviceInfo";
import useAiEnglish from "@/stores/aiEnglish";

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
    aiEnglishStore.assistant_messages.data[text_id].isHidden = false;
    event.target.classList.remove("hidden_text");
  }
}

// 隐藏文本
function hiddenText(event, text_id) {
  aiEnglishStore.assistant_messages.data[text_id].isHidden = !aiEnglishStore
    .assistant_messages.data[text_id].isHidden;
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

// 控制配置弹出框的出现
const botSettingVisible = ref(false);

// 弹出框的配置元素
const setting_items = ref(null);
const settingUrlParentEL = ref(null);

function showSetting(role) {
  if (role === "assistant") {
    botSettingVisible.value = true;
  }
}

const botSetting = reactive({
  open: false, // 开启自定义的接口
  url: "", // 自定义接口地址
  key: "", // 接口密钥
  model: "", // 模型名称
  temperature: 50, // 温度，控制回复的随机性
  top_p: 50, // 控制回复的随机性
  max_tokens: 2048, // 最大输出tokens
  with_history: true, // 是否携带历史会话
  history_count: 10,
});

// 控制页面显示范围 0~1
const formatTooltip = (val) => {
  return val / 100;
};

function cancelSetting() {
  botSettingVisible.value = false;
}

function commitSetting() {
  if (!botSetting.open) {
    botSettingVisible.value = false;
    ElMessage({
      message: "使用默认模型进行AI交互",
      type: "warning",
    });
    return;
  } else {
    const isUrlOK = isValidUrl(botSetting.url);
    const isMaxTokensOk = isPositiveInteger(botSetting.max_tokens);
    const isHistoryCountOK = isPositiveInteger(botSetting.history_count);

    if (isUrlOK && isMaxTokensOk && isHistoryCountOK) {
      botSettingVisible.value = false;

      if (botSetting.temperature == 0) {
        botSetting.temperature = 0.1;

        ElMessage({
          message: "temperature不能为0，修正为0.1",
          type: "warning",
        });
      }

      if (botSetting.top_p == 0) {
        botSetting.top_p = 0.1;

        ElMessage({
          message: "top_p不能为0，修正为0.1",
          type: "warning",
        });
      }

      ElMessage({
        message: "配置保存成功",
        type: "success",
      });
    } else {
      if (!isUrlOK && !botSetting.url) {
        settingUrlParentEL.value.classList.add("wrong_input");
        ElMessage.error("接口地址为必填项！");
      } else {
        ElMessage.error("配置信息不正确，请修改错误项~");
      }
    }
  }
}

// 判断字符串是否为url
function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
}

// 判断字符串是否为正整数
function isPositiveInteger(str) {
  const positiveIntegerPattern = /^\d+$/;
  return positiveIntegerPattern.test(str);
}

function remove_wrong(event) {
  const parentElement = event.target.closest(".setting_right");
  if (parentElement && parentElement.classList.contains("wrong_input")) {
    parentElement.classList.remove("wrong_input");
  }
}

function checkUrl(event) {
  const checkResult = isValidUrl(botSetting.url);

  if (!checkResult) {
    ElMessage.error("接口地址格式不正确！");

    const parentElement = event.target.closest(".setting_right");
    if (parentElement) {
      parentElement.classList.add("wrong_input");
    }
  }
}

function checkInt(event, msg, num) {
  const checkResult = isPositiveInteger(num);

  if (!checkResult) {
    ElMessage.error(msg);
    const parentElement = event.target.closest(".setting_right");
    if (parentElement) {
      parentElement.classList.add("wrong_input");
    }
  }
}

// // // // // // // // // // ↑ 配置弹出框 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 消息交互 ↓ // // // // // // // // // //

const canSendMessage = ref(true);

// const url = "/api/conversation/";
const url = "https://api.freegpt.art/v1/chat/completions";

const headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer sk-VFtuc5lBPaGIcGwX291bD2578e8e4b838fAd50B267B4A126",
};

// 将消息加入队列
function addMessage(role, content) {
  aiEnglishStore.assistant_messages.data.push({
    content: content,
    role: role,
    isHidden: false,
  });
}

// 处理用户输入
const handleInput = async (content) => {
  if (!content || !canSendMessage.value) {
    return;
  }

  // 将用户发送到消息加入队列
  addMessage("user", content);

  await nextTick();
  // 将聊天框拉到最下面
  messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;

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
  }
};

async function conversation() {
  addMessage("assistant", "");

  const lastData =
    aiEnglishStore.assistant_messages.data[
      aiEnglishStore.assistant_messages.data.length - 1
    ];

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      messages: aiEnglishStore.assistant_messages.data.slice(0, -1),
      model: "gpt-3.5-turbo",
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: 1,
      temperature: 0.5,
      stream: true,
    }),
  });

  if (!response.ok) {
    lastData.content = "AI回复获取失败0.0";

    // 将滚动条拉到最后
    await nextTick();
    messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;
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

    // reserveText += chunkString;
    // lastData.content = marked.parse(reserveText);
    // messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight+200;

    const lines = chunkString.split("\n").filter((line) => line.trim() !== "");

    for (const line of lines) {
      if (line.startsWith("data:")) {
        const jsonLine = line.slice(5).trim();

        if (jsonLine === "[DONE]") {
          break;
        }

        if (jsonLine) {
          const jsonData = JSON.parse(jsonLine);

          const content = jsonData.choices[0].delta.content;
          if (content) {
            reserveText += content;
            lastData.content = marked.parse(reserveText);

            // 将滚动条拉到最后
            await nextTick();
            messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;
          }
        }
      }
    }
  }
}

onMounted(async () => {
  await nextTick();
  if (messageAreaRef.value) {
    messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;
  }
});

// // // // // // // // // // ↑ 消息交互 ↑ // // // // // // // // // //

// 切换功能菜单
const changeCommand = (command) => {
  aiEnglishStore.currentConmand = command;
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

    <div class="message_area" ref="messageAreaRef">
      <div
        class="message_parent clear-fix"
        v-for="(item, index) in aiEnglishStore.assistant_messages.data"
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
                v-html="item.content"
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

    <el-dialog v-model="botSettingVisible" title="设置菜单" width="650" center>
      <div class="setting_items" ref="setting_items">
        <div class="setting_item">
          <div class="setting_left">
            <div class="setting_title">是否使用自定义接口</div>
            <div class="setting_desc">默认使用讯飞星火lite模型</div>
          </div>

          <div class="setting_right">
            <el-tooltip
              class="box-item"
              effect="dark"
              content="自定义代理接口"
              placement="right-start"
            >
              <el-switch
                v-model="botSetting.open"
                inline-prompt
                active-text="是"
                inactive-text="否"
                size="large"
              />
            </el-tooltip>
          </div>
        </div>

        <el-divider />

        <div class="setting_item">
          <div class="setting_left">
            <div class="setting_title">接口地址&#40;url&#41;</div>
            <div class="setting_desc">填入自定义的Openai代理接口</div>
          </div>
          <div class="setting_right" ref="settingUrlParentEL">
            <el-input
              v-model="botSetting.url"
              clearable
              :disabled="!botSetting.open"
              placeholder="示例: https://xxx/v1/chat/completions"
              @focus="remove_wrong"
              @blur="checkUrl"
            />
          </div>
        </div>

        <el-divider />

        <div class="setting_item">
          <div class="setting_left">
            <div class="setting_title">接口密钥&#40;key&#41;</div>
            <div class="setting_desc">填入自定义的接口密钥</div>
          </div>
          <div class="setting_right">
            <el-input
              v-model="botSetting.key"
              placeholder="本站不会存储你的密钥"
              type="password"
              show-password
              :disabled="!botSetting.open"
              clearable
            />
          </div>
        </div>

        <el-divider />

        <div class="setting_item">
          <div class="setting_left">
            <div class="setting_title">模型名称&#40;model&#41;</div>
            <div class="setting_desc">填入自定义的模型名称</div>
          </div>
          <div class="setting_right">
            <el-input
              v-model="botSetting.model"
              :disabled="!botSetting.open"
              placeholder="示例: gpt-3.5-turbo"
              clearable
            />
          </div>
        </div>

        <el-divider />

        <div class="setting_item">
          <div class="setting_left">
            <div class="setting_title">随机性&#40;temperature&#41;</div>
            <div class="setting_desc">数值越大，回复的随机性越高</div>
          </div>
          <div class="setting_right">
            <div class="slider-demo-block">
              <el-slider
                v-model="botSetting.temperature"
                :format-tooltip="formatTooltip"
                :step="10"
                :disabled="!botSetting.open"
              />
            </div>
          </div>
        </div>

        <el-divider />

        <div class="setting_item">
          <div class="setting_left">
            <div class="setting_title">核采样&#40;top_p&#41;</div>
            <div class="setting_desc">与随机性类似;</div>
            <div class="setting_desc">建议核采样、随机性仅修改一个</div>
          </div>
          <div class="setting_right">
            <div class="slider-demo-block">
              <el-slider
                v-model="botSetting.top_p"
                :format-tooltip="formatTooltip"
                :step="10"
                :disabled="!botSetting.open"
              />
            </div>
          </div>
        </div>

        <el-divider />

        <div class="setting_item">
          <div class="setting_left">
            <div class="setting_title">单次回复限制&#40;max_tokens&#41;</div>
            <div class="setting_desc">限制单次交互所用的最大tokens</div>
          </div>
          <div class="setting_right">
            <el-input
              v-model="botSetting.max_tokens"
              :disabled="!botSetting.open"
              placeholder="需要填入整数"
              @focus="remove_wrong"
              @blur="checkInt($event, 'max_tokens 必须为正整数', botSetting.max_tokens)"
            />
          </div>
        </div>

        <el-divider />

        <div class="setting_item">
          <div class="setting_left">
            <div class="setting_title">附带历史消息数</div>
            <div class="setting_desc">此值为0时表示不携带历史</div>
          </div>
          <div class="setting_right">
            <el-input
              v-model="botSetting.history_count"
              :disabled="!botSetting.open"
              placeholder="需要填入整数"
              @focus="remove_wrong"
              @blur="checkInt($event, '历史消息数必须为正整数', botSetting.history_count)"
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelSetting">取消</el-button>
          <el-button type="primary" @click="commitSetting"> 确定 </el-button>
        </div>
      </template>
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
  max-height: 60vh;
  overflow-y: auto;

  display: flex;
  flex-direction: column;
  border: 1px solid black;
  border-radius: 12px;
  padding: 20px;
}

.setting_item {
  margin: 0 auto;
  display: flex;
  width: 100%;
  justify-content: space-between;
}

.setting_right {
  width: 50%;
}

.wrong_input {
  border: 1px solid red;
}

.setting_title {
  font-size: 15px;
  font-weight: 800;
}

.setting_desc {
  margin-top: 5px;
  font-size: 12px;
  font-style: italic;
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

.slider-demo-block {
  max-width: 300px;
  display: flex;
  align-items: center;
}
.slider-demo-block .el-slider {
  margin-top: 0;
  margin-left: 12px;
}

.el-divider--horizontal {
  margin: 14px auto;
}
</style>
