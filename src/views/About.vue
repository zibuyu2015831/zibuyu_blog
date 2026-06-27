<script setup>
import useDeviceInfo from "@/stores/deviceInfo";

import { storeToRefs } from "pinia";
import { ref, onMounted, onBeforeUnmount, createApp, h } from "vue";

import InputBar from "@/content/InputBar.vue";

const deviceInfoStore = useDeviceInfo();
const {
  isShowHeaderComponent,
  isShowFooterComponent,
  isShowHeaderNavigate,
  isShowBottomMenu,
} = storeToRefs(deviceInfoStore);

// // // // // // // // // // ↓ 测试代码 ↓ // // // // // // // // // //

const message = "这是一个打字机效果的文本示例。";
const displayText = ref("");
const typingIndex = ref(0);
const isTyping = ref(true); // 用于控制光标闪烁

// 打字机与光标定时器：本组件是路由页面，离开后须清理，否则定时器仍在后台触发（#05）
let typeTimer = null;
let cursorTimer = null;

const typeText = () => {
  if (typingIndex.value < message.length) {
    displayText.value += message[typingIndex.value];
    typingIndex.value++;
    typeTimer = setTimeout(typeText, 500); // 每个字符显示的间隔时间（毫秒）
  } else {
    typeTimer = setTimeout(() => {
      displayText.value = "";
      typingIndex.value = 0;
      typeText();
    }, 3000); // 全部文本显示完后的停留时间（毫秒）
  }
};

onMounted(() => {
  typeText();
  cursorTimer = setInterval(() => {
    isTyping.value = !isTyping.value; // 切换光标状态
  }, 500); // 光标闪烁的间隔时间
});

onBeforeUnmount(() => {
  if (typeTimer) clearTimeout(typeTimer);
  if (cursorTimer) clearInterval(cursorTimer);
});

// // // // // // // // // // ↑ 测试代码 ↑ // // // // // // // // // //

onMounted(() => {
  const imageVNode = h(ElImage, {
    src: "https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg",
    class: "image-class", // 设置类名
    image_name: "example", // 自定义属性
    "preview-src-list": [
      "https://fuss10.elemecdn.com/2/11/6535bcfb26e4c79b48ddde44f4b6fjpeg.jpeg",
    ],
    onError: () => {
      console.log("Image failed to load!");
    },
  });

  const container = document.querySelector(".container");

  const buttonApp = createApp({
    render() {
      return imageVNode;
    },
  });

  if (container) {
    console.log(13213);
    // 动态创建一个 div 元素作为按钮的挂载点
    const buttonContainer = document.createElement("div");
    container.appendChild(buttonContainer);

    // 挂载 Vue 应用实例到动态创建的 div 上
    buttonApp.mount(buttonContainer);
  }
});

const handler = (content)=>{
  console.log('用户输入的是：',content)
}
</script>

<template>
  <Header v-if="isShowHeaderComponent"></Header>
  <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
  <SmallScreenMenu v-if="isShowBottomMenu"></SmallScreenMenu>

  <h2 class="box">about界面</h2>

  <div >
    <InputBar :handle-submit="handler">  </InputBar>

  </div>

<br>
<br>
<br>
  <div>
    <div class="typewriter">
      <span>{{ displayText }}</span
      ><span v-if="isTyping">|</span>
    </div>
  </div>

  <Footer v-if="isShowFooterComponent"></Footer>
</template>

<style scoped>
/* ↓ 代码块 ↓ */
.title_select{
  background-color: red;
  border-radius: 15px;
}

.el-select__selection{
  background-color: red;
}

 .dropdown {
  cursor: pointer;
  color: black;
  display: flex;
  align-items: center;
}




.box {
  height: 100px;
  width: 100%;
  color: black;
}

/* ↑ 代码块 ↑ */

.typewriter {
  font-family: monospace;
  white-space: pre;
  overflow: hidden;
  display: inline-block;
}
</style>
