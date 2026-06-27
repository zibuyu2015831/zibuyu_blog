<script setup>
import { ref, computed, nextTick } from "vue";
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

  // 是否启用斜杠快捷命令（默认关闭，保证其它调用方行为不变）
  enableSlashCommands: {
    type: Boolean,
    default: false,
  },
});

// 触发命令动作（如清空会话）；由父组件通过事件实现具体逻辑
const emit = defineEmits(["command"]);

const inputContent = ref("");
const textareaRef = ref(null);

// 边框颜色改由 CSS :focus-within + 设计令牌驱动，无需 JS（见 <style>）。

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

// // // // // // // // // // ↓ 斜杠快捷命令 ↓ // // // // // // // // // //

// 预设命令清单（英语自习室场景）
const slashCommands = [
  { cmd: "/clear", label: "清空对话", desc: "清空当前会话的全部消息", action: "clear" },
  { cmd: "/translate", label: "翻译", desc: "把下面这段中文翻译成地道英文：", prefill: "请把下面这段中文翻译成地道、自然的英文：\n" },
  { cmd: "/grammar", label: "语法检查", desc: "检查下面这段英文的语法", prefill: "请检查下面这段英文的语法并给出修改建议：\n" },
  { cmd: "/polish", label: "润色表达", desc: "让英文表达更地道", prefill: "请帮我润色下面这段英文，使其更地道、更自然：\n" },
  { cmd: "/explain", label: "讲解词汇", desc: "讲解单词或短语用法", prefill: "请讲解下面这个单词/短语的含义、用法与例句：\n" },
  { cmd: "/help", label: "帮助", desc: "查看可用的快捷命令", action: "help" },
];

// 命令浮层显示状态与高亮项
const showCommandMenu = ref(false);
const activeCommandIndex = ref(0);

// 根据当前输入实时过滤命令
const filteredCommands = computed(() => {
  const text = inputContent.value;
  if (!text.startsWith("/")) return [];
  const keyword = text.slice(1).toLowerCase();
  if (!keyword) return slashCommands;
  return slashCommands.filter(
    (c) =>
      c.cmd.slice(1).toLowerCase().startsWith(keyword) ||
      c.label.toLowerCase().includes(keyword)
  );
});

// 是否应展示浮层：启用 + 以 / 开头 + 有匹配项
function refreshCommandMenu() {
  if (!props.enableSlashCommands) {
    showCommandMenu.value = false;
    return;
  }
  const isSlash = inputContent.value.startsWith("/");
  showCommandMenu.value = isSlash && filteredCommands.value.length > 0;
  if (showCommandMenu.value) {
    activeCommandIndex.value = 0;
  }
}

function closeCommandMenu() {
  showCommandMenu.value = false;
}

// 选中某条命令
function selectCommand(command) {
  if (command.action === "clear") {
    emit("command", { action: "clear" });
    inputContent.value = "";
  } else if (command.action === "help") {
    // 帮助：在输入框列出全部命令说明（用户可直接查看后删除）
    const helpText = slashCommands
      .map((c) => `${c.cmd} ${c.label}`)
      .join("  ·  ");
    emit("command", { action: "help", text: helpText });
    inputContent.value = "";
  } else if (command.prefill) {
    // 普通命令：把提示语前缀填入输入框，光标置于末尾
    inputContent.value = command.prefill;
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.focus();
        const len = inputContent.value.length;
        textareaRef.value.setSelectionRange(len, len);
        // 触发一次高度自适应
        textareaRef.value.style.height = "auto";
        textareaRef.value.style.height = `${Math.min(textareaRef.value.scrollHeight, 200)}px`;
      }
    });
  }
  closeCommandMenu();
}

// // // // // // // // // // ↑ 斜杠快捷命令 ↑ // // // // // // // // // //

// 输入事件：调整高度 + 刷新命令浮层
const onInput = (e) => {
  handlerHeight(e);
  refreshCommandMenu();
};

function Submit() {
  // 不发送空白消息（#12 输入校验）
  if (!inputContent.value.trim()) return;
  props.handleSubmit(inputContent.value); // 提交表单
  inputContent.value = "";
  closeCommandMenu();
}

// 处理键盘事件
const handleKeyDown = (e) => {
  // 命令浮层打开时，方向键 / 回车 / Esc 优先用于菜单导航
  if (showCommandMenu.value) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeCommandIndex.value =
        (activeCommandIndex.value + 1) % filteredCommands.value.length;
      return;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeCommandIndex.value =
        (activeCommandIndex.value - 1 + filteredCommands.value.length) %
        filteredCommands.value.length;
      return;
    } else if (e.key === "Enter" && !e.ctrlKey) {
      e.preventDefault();
      const target = filteredCommands.value[activeCommandIndex.value];
      if (target) selectCommand(target);
      return;
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeCommandMenu();
      return;
    }
  }

  if (e.key === "Enter" && !e.ctrlKey) {
    e.preventDefault(); // 阻止默认的换行行为
    Submit(); // 复用提交逻辑（含空白校验）
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
    <!-- 斜杠命令浮层 -->
    <ul
      v-if="showCommandMenu"
      class="slash_menu"
      @mousedown.prevent
    >
      <li
        v-for="(command, index) in filteredCommands"
        :key="command.cmd"
        class="slash_item"
        :class="{ slash_item_active: index === activeCommandIndex }"
        @mouseenter="activeCommandIndex = index"
        @click="selectCommand(command)"
      >
        <span class="slash_cmd">{{ command.cmd }}</span>
        <span class="slash_label">{{ command.label }}</span>
        <span class="slash_desc">{{ command.desc }}</span>
      </li>
    </ul>

    <textarea
      ref="textareaRef"
      rows="1"
      @input="onInput"
      placeholder="Enter发送; Ctrl+Enter换行"
      autofocus
      v-model="inputContent"
      @keydown="handleKeyDown"
      @blur="closeCommandMenu"
    ></textarea>

    <div class="button">
      <span class="iconfont icon-voice audio_button"></span>
      <span class="iconfont icon-tingzhi1 audio_button" v-if="!props.canSendMessage"></span>

      <el-button
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
  outline: 2px solid var(--english_input_area_border);
  transition: outline-color var(--motion-fast, 150ms) var(--ease-standard, ease);
}

/* 聚焦时边框转主色（替代原 JS 硬编码 #333ce1/#989cea） */
.input_form:focus-within {
  outline-color: var(--english_input_area_border_focus);
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

/* ↓ 斜杠命令浮层 ↓ */
.slash_menu {
  position: absolute;
  bottom: calc(100% + var(--space-2));
  left: 0;
  right: 0;
  margin: 0;
  padding: var(--space-1);
  list-style: none;
  max-height: 260px;
  overflow-y: auto;
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  z-index: 10;
  text-align: left;
}

.slash_item {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--motion-fast) var(--ease-standard, ease);
}

.slash_item_active {
  background-color: var(--color-primary-subtle);
}

.slash_cmd {
  flex-shrink: 0;
  font-family: var(--font-mono, monospace);
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--color-primary);
}

.slash_label {
  flex-shrink: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.slash_desc {
  flex: 1;
  min-width: 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* ↑ 斜杠命令浮层 ↑ */

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

/* 发送按钮：方向A 朱砂主操作（替代 Element success 绿） */
.submit_button.el-button {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.submit_button.el-button:hover,
.submit_button.el-button:focus {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  color: var(--color-text-inverse);
}

/* ↑ 按钮样式 ↑ */
</style>
