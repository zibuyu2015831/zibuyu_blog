# 05. 内存泄漏修复 - 资源管理优化

**问题严重程度**: 🟠 高危  
**修复优先级**: 短期修复（1-2周）  
**依赖后端**: 否

---

> ### 🔍 复审结论（复核于 2026-06-27）
>
> **成立度**：🔴 **大部分不成立（文件清单错误，需重写）**
>
> - **不成立**：原文点名的 `DialogLogin/DialogRegister/AiEnglishSpokenCoach/...` 中**并无 `keydown` 事件监听器**（全项目 grep 无 keydown），修复方案中的 `handleKeydown` 系凭空虚构；`AbortController` 在项目中也不存在。
> - **已规范**：`App.vue` 的 `resize`/`scroll` 监听器已在 `onUnmounted` 中正确移除（line 46/56）。
> - **真实问题（原文遗漏）**：未清理的 `setInterval` 实际位于 **`Footer.vue:15`、`Header.vue:49`、`About.vue:40`、`Test.vue:121`**——这些才是应修复的对象（`About`/`Test` 在路由离开后定时器仍驻留）。
> - **结论**：方向（清理定时器）有合理内核，但**证据与文件清单错误**，按下方「真实问题」清单重做。


## 问题概述

项目中存在多处内存泄漏风险，包括DOM未正确清理、事件监听器未移除、定时器未清除等，可能导致长时间运行后应用性能下降甚至崩溃。

---

## 涉及文件路径

> ⚠️ 以下为**复审修正后**的真实清单。原文清单（DialogLogin/DialogRegister/AiEnglishSpokenCoach 等含 `keydown` 监听器）经核查并不存在（全项目 `grep keydown`、`grep AbortController` 均为 0 命中），已废弃。

**真实存在「`setInterval` 未清理」的文件（全项目 `clearInterval`/`clearTimeout` 命中数为 0）：**

```
src/components/Footer.vue:15    # 运行时长计时器，每 1s 触发，无 clearInterval（<script setup>，无 onMounted/onUnmounted）
src/components/Header.vue:49    # 打字机光标闪烁，每 0.5s 触发，无 clearInterval（在 onMounted 内创建，无 onUnmounted）
src/views/About.vue:40          # 同上的光标闪烁，路由离开后仍驻留（在 onMounted 内创建，无 onUnmounted）
src/views/Test.vue:121          # 画布动画 setInterval(draw, 100)，无清理（在 onMounted 内创建，无 onUnmounted）
```

**次要项（事件监听器，仅记录，非定时器泄漏）：**

```
src/views/Article.vue:149       # 在 setTimeout 回调内对 imageDOM 循环 addEventListener('click', ...)，组件卸载后未 removeEventListener（影响小，DOM 移除后监听器通常随之回收）
```

**正确范例（counter-example，无需改动）：**

```
src/App.vue:40 / :51            # resize / scroll 监听器分别在 onBeforeUnmount(:44 / :55) 中正确 removeEventListener，passive 选项一致
```

> 说明：`Footer`/`Header` 为常驻组件，整页生命周期内只有一份实例，实际影响小（但仍属不规范）；`About`/`Test` 为**路由页面组件**，路由切换离开后定时器仍在后台运行并持续触发响应式更新，是更应优先修复的对象。
> `App.vue` 的 `resize`/`scroll` 监听器**已规范清理**，可作为本仓库内的标准写法参考，无需改动。

---

## 风险评估

- **风险等级**: 中
- **潜在影响**:
  - 应用性能下降
  - 浏览器内存占用过高
  - 用户体验变差

---

## 修复方案

> 核心动作：**捕获每个 `setInterval` 返回的 id，并在 `onBeforeUnmount`/`onUnmounted` 中 `clearInterval`**。
> 下列改法针对本仓库真实代码，逐文件给出。四个文件均为 `<script setup>`，但仅 `Header.vue`/`About.vue`/`Test.vue` 已 `import { onMounted }`，需要补 `onBeforeUnmount`；`Footer.vue` 当前只 `import { ref }`，需补 `onBeforeUnmount` 并把裸调用包进 `onMounted`。

### 步骤 1: 修复 `src/components/Footer.vue`（line 15）

当前 `setInterval` 在 `<script setup>` 顶层裸调用（组件创建即启动，无 id、无清理）。改为捕获 id 并在卸载时清除：

```vue
<script setup>
// 原: import { ref } from "vue";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { calculateTime } from "@/utils/handle_date";

const createTimeStamp = "1718804766";
let timeString = ref("");

let runtimeTimer = null;          // ← 新增：保存定时器 id
onMounted(() => {
  timeString.value = calculateTime(createTimeStamp);   // 立即渲染一次，避免首帧空白
  runtimeTimer = setInterval(() => {
    timeString.value = calculateTime(createTimeStamp);
  }, 1000);
});

onBeforeUnmount(() => {           // ← 新增：清理
  if (runtimeTimer) clearInterval(runtimeTimer);
});
</script>
```

### 步骤 2: 修复 `src/components/Header.vue`（line 49）

光标闪烁定时器在 `onMounted` 内创建。补 `onBeforeUnmount` 清理（`typeText` 内部的 `setTimeout` 递归链见步骤 5 说明）：

```vue
<script setup>
// 原: import { ref, onMounted } from "vue";
import { ref, onMounted, onBeforeUnmount } from "vue";
// ...省略其余 import / 状态...

let cursorTimer = null;           // ← 新增
onMounted(() => {
  typeText();
  cursorTimer = setInterval(() => {
    isTyping.value = !isTyping.value; // 切换光标状态
  }, 500);
});

onBeforeUnmount(() => {           // ← 新增
  if (cursorTimer) clearInterval(cursorTimer);
});
</script>
```

### 步骤 3: 修复 `src/views/About.vue`（line 40）

与 `Header.vue` 同型（光标闪烁定时器在 `onMounted` 内）。**因 `About` 是路由页面，离开路由后定时器仍驻留，优先级更高**：

```vue
<script setup>
// 原: import { ref, onMounted, createApp, h } from "vue";
import { ref, onMounted, onBeforeUnmount, createApp, h } from "vue";
// ...

let cursorTimer = null;           // ← 新增
onMounted(() => {
  typeText();
  cursorTimer = setInterval(() => {
    isTyping.value = !isTyping.value;
  }, 500);
});

onBeforeUnmount(() => {           // ← 新增
  if (cursorTimer) clearInterval(cursorTimer);
});
</script>
```

> 注意：`About.vue` 中存在两个 `onMounted`（line 38 与 line 47），改动只涉及第一个（打字机那段）。第二个 `onMounted` 与定时器无关，无需改动。

### 步骤 4: 修复 `src/views/Test.vue`（line 121）

画布动画 `setInterval(draw, 100)`，每 100ms 重绘并增删 DOM。**同为路由页面（`/test`），离开后仍持续重绘，优先级高**：

```vue
<script setup>
// 确保从 vue 引入 onBeforeUnmount（若未引入则补上）
import { onMounted, onBeforeUnmount /* , ...其余 */ } from "vue";
// ...

let drawTimer = null;             // ← 新增
onMounted(() => {
  drawTimer = setInterval(draw, 100);
});

onBeforeUnmount(() => {           // ← 新增
  if (drawTimer) clearInterval(drawTimer);
});
</script>
```

### 步骤 5: 处理 `setTimeout` 递归链（Header.vue / About.vue 的 `typeText`）

`Header.vue` 与 `About.vue` 的 `typeText()` 通过 `setTimeout(typeText, ...)` 无限自递归。`clearInterval` 只清掉光标定时器，**`typeText` 的下一次 `setTimeout` 仍会排队执行**。彻底根治需保存最近一次 `setTimeout` id 并在卸载时 `clearTimeout`：

```javascript
let typeTimer = null;
const typeText = () => {
  if (typingIndex.value < message.length) {
    displayText.value += message[typingIndex.value];
    typingIndex.value++;
    typeTimer = setTimeout(typeText, 500);
  } else {
    typeTimer = setTimeout(() => { /* 重置并 typeText() */ }, 3000);
  }
};
// onBeforeUnmount 内追加：if (typeTimer) clearTimeout(typeTimer);
```

> 若仅做最小修复，先清掉 `setInterval`（步骤 1–4）即可消除大部分常驻开销；`typeText` 的 `setTimeout` 链属于进阶清理项。

### 步骤 6（可选）：`src/views/Article.vue` line 149 的点击监听

`Article.vue` 在 `setTimeout(..., 0)` 回调里对每个 `imageDOM` 循环 `addEventListener('click', ...)`。这些监听器绑定在文章内的 `<img>` 上，组件卸载时这些 DOM 一并被移除，监听器通常随之被 GC，**影响很小**。如需规范化，可保存 handler 引用并在 `onBeforeUnmount` 中逐一 `removeEventListener`，或改用模板上的 `@click` 事件委托。

---

## 重要补充说明

### 1. 本仓库已有的「正确范例」

`src/App.vue` 是清理事件监听器的标准写法，可直接对照模仿：

```javascript
// src/App.vue:38-57
onMounted(() => {
  updateScreenWidth();
  window.addEventListener("resize", updateScreenWidth, { passive: true });
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", updateScreenWidth, { passive: true });
});
// scroll 监听同理（:50 / :55），addEventListener 与 removeEventListener 的 options 保持一致
```

### 2. 定时器清理的通用模式（适用于本项目 4 处 setInterval）

```javascript
import { onMounted, onBeforeUnmount } from 'vue'

let timerId = null
onMounted(() => {
  timerId = setInterval(() => { /* ... */ }, 1000)
})
onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
})
```

### 3. 验证清理是否生效

- 在 `clearInterval` 行打断点 / 加临时日志，反复进入和离开 `/about`、`/test` 路由，确认定时器随卸载停止。
- Chrome DevTools → Performance/Memory，反复切换路由后做堆快照对比，观察 detached node 与定时器数量是否回落。

### 4. 第三方库资源清理（本项目暂未涉及，作为通用提醒）

若后续引入需要手动销毁的实例（如富文本编辑器、图表库），同样在 `onBeforeUnmount` 中调用其 `destroy()`/`dispose()`。

---

## 核查流程

### 1. 代码审查

- [ ] 检查所有组件的onUnmounted钩子
- [ ] 确认所有定时器已清除
- [ ] 验证所有事件监听器已移除
- [ ] 检查第三方库的清理逻辑

### 2. 内存分析

- [ ] 使用Chrome DevTools Memory面板
- [ ] 进行堆快照对比
- [ ] 检查Detached DOM树

### 3. 长时间运行测试

- [ ] 运行应用24小时以上
- [ ] 监控内存增长趋势
- [ ] 检查是否存在内存泄漏

---

## 预期收益

- ✅ 消除内存泄漏
- ✅ 提升应用稳定性
- ✅ 改善用户体验

---

## 相关文档

- [架构说明与职责划分](./overview.md) - 前后端分离架构说明
- [README汇总](../README.md) - 所有优化文档索引

---

**文档版本**: 1.0  
**创建日期**: 2026-01-07  
**最后更新**: 2026-01-07
