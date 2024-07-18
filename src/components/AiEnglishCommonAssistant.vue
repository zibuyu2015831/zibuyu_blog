<script setup>
import useDeviceInfo from "@/stores/deviceInfo";
import useAiEnglish from "@/stores/aiEnglish";

import { storeToRefs } from "pinia";
import { ref, computed, nextTick, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";

import { Marked } from "marked";
import hljs from "highlight.js";
import InputBar from "@/content/InputBar.vue";
import MenuButton from "@/content/MenuButton.vue";
import { markedHighlight } from "marked-highlight";
import "highlight.js/styles/atom-one-dark-reasonable.css";

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

const aiEnglishStore = useAiEnglish();
const deviceInfoStore = useDeviceInfo();

const { isEnglishWebShowLeft } = storeToRefs(deviceInfoStore);
const {
  requestUrl,
  requestKey,
  requestModel,
  requestTemperature,
  requestTop_p,
  requestMax_tokens,
  requestHistoryCount,
} = storeToRefs(aiEnglishStore);

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

// // // // // // // // // // ↓ 全局相关 ↓ // // // // // // // // // //

// 聊天消息区域
const messageAreaRef = ref(null);

// 聊天框中，消息的下间距
const messageMarginBottom = ref(8);

// 标题高度
const titleHeight = computed(() => {
  return 55;
});

// 处理用户自定义信息（从localStorage中获取或写入）
function handleCustomizedInfos(action) {
  const itemKey = "customized_infos";

  if (action == "store") {
    // 序列化 customized_infos并且将序列化后的数据存入 localStorage
    const serializedCustomizedInfos = JSON.stringify(aiEnglishStore.customized_infos);
    localStorage.setItem(itemKey, serializedCustomizedInfos);
  } else if (action == "get") {
    const info = localStorage.getItem(itemKey);

    if (!info) {
      return;
    }

    try {
      const parsedInfo = JSON.parse(info);

      const requiredKeys = [
        "name", // 配置名称
        "url",
        "key",
        "model",
        "temperature",
        "top_p",
        "max_tokens",
        "history_count",
      ];

      const validateCustomizedInfo = (info) => {
        if (!Array.isArray(info)) {
          return false;
        }

        for (const item of info) {
          if (typeof item !== "object" || item === null) {
            return false;
          }

          for (const key of requiredKeys) {
            if (!(key in item)) {
              return false;
            }
          }
        }

        return true;
      };

      if (validateCustomizedInfo(parsedInfo)) {
        aiEnglishStore.customized_infos = parsedInfo;
      }
    } catch (error) {
      console.error("Failed to parse customized_info:", error);
    }
  } else if (action == "delete") {
    localStorage.removeItem(itemKey);
  }
}

// 切换功能菜单
const changeCommand = (command) => {
  aiEnglishStore.currentConmand = command;
};

onMounted(async () => {
  await nextTick();

  if (messageAreaRef.value) {
    messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;
  }

  // 从本地存储中获取自定义配置信息
  handleCustomizedInfos("get");
  downloadCurrentSetting();
});

function renew_conversation() {
  aiEnglishStore.assistant_messages.data = [];
}
// // // // // // // // // // ↑ 全局相关 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 消息下方的按钮 ↓ // // // // // // // // // //

// 显示按钮（鼠标移入时）
function show_button(event) {
  const buttonElement = event.target.nextElementSibling;
  if (buttonElement && buttonElement.classList.contains("react_content_button")) {
    buttonElement.style.display = "block";
  }
}

// 隐藏按钮（鼠标移出时）
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

function renew_answer(event, text_id) {
  aiEnglishStore.removeAssistantMessagesByIndex(text_id);
  handleConversation();
}

// 复制文本
const copyText = async (textToCopy) => {
  try {
    await navigator.clipboard.writeText(textToCopy);
    ElMessage({
      message: "复制成功",
      type: "success",
      offset: 700,
    });
  } catch (err) {
    ElMessage.error("复制失败");
  }
};

// // // // // // // // // // ↑ 消息下方的按钮 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 用户配置弹出框 ↓ // // // // // // // // // //

// 控制配置弹出框的出现
const userSettingVisible = ref(false);

// // // // // // // // // // ↑ 用户配置弹出框 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ AI配置弹出框 ↓ // // // // // // // // // //

// 控制配置弹出框的出现
const botSettingVisible = ref(false);

// 弹出框的配置元素
const setting_items = ref(null);
const settingUrlParentEL = ref(null);

function showSetting(role) {
  if (role === "assistant") {
    botSettingVisible.value = true;
  } else {
    userSettingVisible.value = true;
  }
}

// 控制页面显示范围 0~1
function formatTooltip(val) {
  return val / 100;
}

function commitSetting() {
  if (!aiEnglishStore.useCustomizedInfo) {
    botSettingVisible.value = false;
    ElMessage({
      message: "使用默认模型进行AI交互",
      type: "warning",
    });
    return;
  } else {
    const isUrlOK = isValidUrl(
      aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex].url
    );
    const isMaxTokensOk = isPositiveInteger(
      aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex].max_tokens
    );
    const isHistoryCountOK = isPositiveInteger(
      aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex].history_count
    );

    if (isUrlOK && isMaxTokensOk && isHistoryCountOK) {
      botSettingVisible.value = false;

      if (
        aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex].temperature ==
        0
      ) {
        aiEnglishStore.customized_infos[
          aiEnglishStore.currentSettingIndex
        ].temperature = 0.1;

        ElMessage({
          message: "temperature不能为0, 修正为0.1",
          type: "warning",
        });
      }

      if (
        aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex].top_p == 0
      ) {
        aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex].top_p = 0.1;

        ElMessage({
          message: "top_p不能为0, 修正为0.1",
          type: "warning",
        });
      }

      handleCustomizedInfos("store");

      ElMessage({
        message: "配置保存成功",
        type: "success",
      });
    } else {
      if (
        !isUrlOK &&
        !aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex].url
      ) {
        settingUrlParentEL.value.classList.add("wrong_input");
        ElMessage.error("接口地址为必填项！");
      } else {
        ElMessage.error("配置信息不正确, 请修改错误项~");
      }
    }
  }
}

function deleteCustomizedInfos() {
  handleCustomizedInfos("delete");
  aiEnglishStore.customized_infos = [
    {
      name: "默认配置", // 配置名称
      url: "", // 自定义接口地址
      key: "", // 接口密钥
      model: "", // 模型名称
      temperature: 50, // 温度，控制回复的随机性
      top_p: 50, // 控制回复的随机性
      max_tokens: 2048, // 最大输出tokens
      history_count: 10,
    },
  ];

  setTimeout(() => {
    aiEnglishStore.currentSettingIndex = 0;
    downloadCurrentSetting();
  }, 0);
}

function remove_wrong(event) {
  const parentElement = event.target.closest(".setting_right");
  if (parentElement && parentElement.classList.contains("wrong_input")) {
    parentElement.classList.remove("wrong_input");
  }
}

function checkUrl(event) {
  const checkResult = isValidUrl(
    aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex].url
  );

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

// 功能函数：判断字符串是否为url
function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch (_) {
    return false;
  }
}

// 功能函数：判断字符串是否为正整数
function isPositiveInteger(str) {
  const positiveIntegerPattern = /^\d+$/;
  return positiveIntegerPattern.test(str);
}

// // // // // // // // // // ↑ AI配置弹出框 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 显示配置 ↓ // // // // // // // // // //

const currentUrl = ref("");
const currentKey = ref("");
const currentModel = ref("");
const currentTemperature = ref("");
const currentTop_p = ref("");
const currentMaxTokens = ref("");
const currentHistoryCount = ref("");

watch(currentUrl, (newVal, oldVal) => {
  aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex].url = newVal;
});

watch(currentKey, (newVal, oldVal) => {
  aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex].key = newVal;
});

watch(currentModel, (newVal, oldVal) => {
  aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex].model = newVal;
});

watch(currentTemperature, (newVal, oldVal) => {
  if (newVal == 0) {
    newVal = 0.1;
  }

  aiEnglishStore.customized_infos[
    aiEnglishStore.currentSettingIndex
  ].temperature = newVal;
});

watch(currentTop_p, (newVal, oldVal) => {
  if (newVal == 0) {
    newVal = 0.1;
  }

  aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex].top_p = newVal;
});

watch(currentMaxTokens, (newVal, oldVal) => {
  aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex].max_tokens = newVal;
});

watch(currentHistoryCount, (newVal, oldVal) => {
  aiEnglishStore.customized_infos[
    aiEnglishStore.currentSettingIndex
  ].history_count = newVal;
});

// // // // // // // // // // ↑ 显示配置 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 添加新配置 ↓ // // // // // // // // // //

const newSettingName = ref(""); // 新配置名称
const isAddNewSetting = ref(false);

const ConfirmNewSetting = () => {
  aiEnglishStore.customized_infos.push({
    name: newSettingName.value || `配置${aiEnglishStore.customized_infos.length + 1}`, // 配置名称
    url: "", // 自定义接口地址
    key: "", // 接口密钥
    model: "", // 模型名称
    temperature: 50, // 温度，控制回复的随机性
    top_p: 50, // 控制回复的随机性
    max_tokens: 2048, // 最大输出tokens
    history_count: 10,
  });

  aiEnglishStore.currentSettingIndex = aiEnglishStore.customized_infos.length - 1;
  newSettingName.value = "";
  isAddNewSetting.value = false;

  downloadCurrentSetting();
  handleCustomizedInfos("store");
};

const clearNewSetting = () => {
  newSettingName.value = "";
  isAddNewSetting.value = false;
};

const downloadCurrentSetting = () => {
  try {
    const setting = aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex];

    currentUrl.value = setting.url;
    currentKey.value = setting.key;
    currentModel.value = setting.model;
    currentTemperature.value = setting.temperature;
    currentTop_p.value = setting.top_p;
    currentMaxTokens.value = setting.max_tokens;
    currentHistoryCount.value = setting.history_count;
  } catch {
    return;
  }
};

const deleteSettingItem = (index) => {
  // 根据index下标删除对应的元素
  aiEnglishStore.removeCustomizedInfoByIndex(index);

  // 如果不将aiEnglishStore.currentSettingIndex的变化放在setTimeout里，则页面不会变化
  // 使用 setTimeout 确保 Vue 检测到数据变化并更新 DOM
  setTimeout(() => {
    aiEnglishStore.currentSettingIndex = Math.max(index - 1, 0);
    downloadCurrentSetting(); // 页面重新加载数据
  }, 0);

  if (aiEnglishStore.customized_infos.length == 0) {
    aiEnglishStore.customized_infos.push({
      name: "默认配置", // 配置名称
      url: "", // 自定义接口地址
      key: "", // 接口密钥
      model: "", // 模型名称
      temperature: 50, // 温度，控制回复的随机性
      top_p: 50, // 控制回复的随机性
      max_tokens: 2048, // 最大输出tokens
      history_count: 10,
    });
  }

  // 序列化 customized_infos并且将序列化后的数据存入 localStorage
  handleCustomizedInfos("store");
};

// // // // // // // // // // ↑ 添加新配置 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 消息交互 ↓ // // // // // // // // // //

const canSendMessage = ref(true);

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
  if (!content) {
    ElMessage.error("内容为空");
    return;
  }

  if (!canSendMessage.value) {
    ElMessage.error("AI正在回复, 请稍等~");
    return;
  }

  if (!requestUrl.value || requestKey.value.length === 7) {
    ElMessage.error({
      message: "代理地址或密钥为空！",
      duration: 5000, // 设置停留时间，单位为毫秒，这里设置为5秒
    });
    return;
  }

  // 将用户发送到消息加入队列
  addMessage("user", content);

  await nextTick();
  // 将聊天框拉到最下面
  messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;
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
    await nextTick();
  }
};

// 确保给定数字是奇数
function ensureOdd(num) {
  // 判断数字是否是奇数
  if (num % 2 === 0) {
    // 如果是偶数，加1使其变成奇数
    return num + 1;
  } else {
    // 如果是奇数，直接返回
    return num;
  }
}

// 发送AI交互请求
async function conversation() {
  // 携带历史会话
  const history = aiEnglishStore.assistant_messages.data.slice(
    -ensureOdd(requestHistoryCount.value)
  );

  addMessage("assistant", "");

  await nextTick();
  // 将聊天框拉到最下面
  messageAreaRef.value.scrollTop = messageAreaRef.value.scrollHeight;

  const lastData =
    aiEnglishStore.assistant_messages.data[
      aiEnglishStore.assistant_messages.data.length - 1
    ];

  const headers = {
    "Content-Type": "application/json",
    Authorization: requestKey.value,
  };

  const response = await fetch(requestUrl.value, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      messages: history,
      model: requestModel.value,
      frequency_penalty: 0,
      presence_penalty: 0,
      top_p: requestTop_p.value,
      temperature: requestTemperature.value,
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

// // // // // // // // // // ↑ 消息交互 ↑ // // // // // // // // // //
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
        v-if="aiEnglishStore.assistant_messages.data.length !== 0"
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
              v-if="index==aiEnglishStore.assistant_messages.data.length-1"
            >
              <span
                class="icon-refresh iconfont"
                @click="renew_answer($event, index)"
              ></span>
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

      <div v-else>
        <div class="react_content_ai">
          <div class="avatar" @click="showSetting('assistant')"></div>
          <div>
            <div class="content">
              <div>你好，有什么可以帮你的吗?</div>
            </div>
          </div>
        </div>
        <div class="final_message clear-fix"></div>
      </div>
      <div class="final_message clear-fix"></div>
      <!-- 对话结束 -->
    </div>

    <div class="input_area">
      <span class="new_message icon-message iconfont" @click="renew_conversation"
        >&nbsp;&nbsp;开启新话题</span
      >
      <InputBar :handle-submit="handleInput" :can-send-message="canSendMessage">
      </InputBar>

      <div class="tip">交互内容由AI生成, 请注意鉴别</div>
    </div>

    <el-dialog v-model="botSettingVisible" width="650" top="50px" center>
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
              placement="top-start"
              style="float: left"
            >
              <el-switch
                v-model="aiEnglishStore.useCustomizedInfo"
                inline-prompt
                active-text="是"
                inactive-text="否"
                size="large"
              />
            </el-tooltip>

            <el-select
              v-model="aiEnglishStore.currentSettingIndex"
              placeholder="Select"
              style="width: 70%; float: right; margin-top: 5px"
              :disabled="!aiEnglishStore.useCustomizedInfo"
              @change="downloadCurrentSetting"
            >
              <el-option
                v-for="(item, index) in aiEnglishStore.customized_infos"
                :key="index"
                :label="item.name || '配置 ' + (index + 1)"
                :value="index"
              >
                <div class="setting_item">
                  <span class="setting_title">{{
                    item.name || "配置 " + (index + 1)
                  }}</span>

                  <span
                    class="iconfont icon-jian_sekuai setting_icon"
                    @click="deleteSettingItem(index)"
                  ></span>
                </div>
              </el-option>

              <template #footer>
                <el-button
                  v-if="!isAddNewSetting"
                  text
                  size="small"
                  @click="isAddNewSetting = true"
                >
                  添加新配置
                </el-button>
                <template v-else>
                  <div class="new_setting">
                    <el-input
                      v-model="newSettingName"
                      class="option-input"
                      placeholder="输入配置名称"
                      size="small"
                      autofocus
                    />

                    <div>
                      <el-button type="primary" size="small" @click="ConfirmNewSetting">
                        确定
                      </el-button>
                      <el-button size="small" @click="clearNewSetting">取消</el-button>
                    </div>
                  </div>
                </template>
              </template>
            </el-select>
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
              v-model="currentUrl"
              clearable
              :disabled="!aiEnglishStore.useCustomizedInfo"
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
              v-model="currentKey"
              placeholder="本站不会存储你的密钥"
              type="password"
              show-password
              :disabled="!aiEnglishStore.useCustomizedInfo"
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
              v-model="currentModel"
              :disabled="!aiEnglishStore.useCustomizedInfo"
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
                v-model="currentTemperature"
                :format-tooltip="formatTooltip"
                :step="10"
                :disabled="!aiEnglishStore.useCustomizedInfo"
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
                v-model="currentTop_p"
                :format-tooltip="formatTooltip"
                :step="10"
                :disabled="!aiEnglishStore.useCustomizedInfo"
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
              v-model="currentMaxTokens"
              :disabled="!aiEnglishStore.useCustomizedInfo"
              placeholder="需填入正整数"
              @focus="remove_wrong"
              @blur="
                checkInt(
                  $event,
                  'max_tokens 必须为正整数',
                  aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex]
                    .max_tokens
                )
              "
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
              v-model="currentHistoryCount"
              :disabled="!aiEnglishStore.useCustomizedInfo"
              placeholder="需填入正整数"
              @focus="remove_wrong"
              @blur="
                checkInt(
                  $event,
                  '历史消息数必须为正整数',
                  aiEnglishStore.customized_infos[aiEnglishStore.currentSettingIndex]
                    .history_count
                )
              "
            />
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="commitSetting"> 确定配置并退出 </el-button>
          <el-button type="danger" @click="deleteCustomizedInfos">
            删除全部配置
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="userSettingVisible" width="650" top="50px" center>
      <div>功能待开发~ 0.0</div>
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
  cursor: pointer;
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

.new_message {
  position: relative;
  top: -20px;
  font-size: 15px;
  border: 1px solid var(--english_page_bg);
  border-radius: 15px;
  padding: 8px 15px;
  background-color: var(--english_page_bg);
  transition: color 0.3s ease, border 0.3s ease; /* 添加过渡效果 */
  cursor: pointer;
}

.new_message:hover {
  color: #007aff;
  border: 1px solid #007aff;
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
  display: flex;
  flex-direction: column;

  max-height: 65vh;
  overflow-y: auto;

  padding: 20px;
  margin: 0 10px;
  border-radius: 12px;
  border: 1px solid black;
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

.option-input {
  width: 100%;
  margin-bottom: 8px;
}

.setting_item {
  display: flex;
}

.setting_item .setting_title {
  flex-grow: 1;
}

.setting_item .setting_icon {
  flex-grow: 0;
}

.icon-bianji4 {
  margin-left: 10px;
}
</style>
