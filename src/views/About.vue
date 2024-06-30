<script setup>
import useDeviceInfo from "@/stores/deviceInfo";

import { storeToRefs } from "pinia";
import { ref, onMounted, createApp, h } from "vue";

import EnglishSpokenCoach from "@/components/EnglishSpokenCoach.vue";

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

const typeText = () => {
  if (typingIndex.value < message.length) {
    displayText.value += message[typingIndex.value];
    typingIndex.value++;
    setTimeout(typeText, 500); // 每个字符显示的间隔时间（毫秒）
  } else {
    setTimeout(() => {
      displayText.value = "";
      typingIndex.value = 0;
      typeText();
    }, 3000); // 全部文本显示完后的停留时间（毫秒）
  }
};

onMounted(() => {
  typeText();
  setInterval(() => {
    isTyping.value = !isTyping.value; // 切换光标状态
  }, 500); // 光标闪烁的间隔时间
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

  const buttonVNode = h(
    ElButton,
    {
      type: "primary",
      class: "btn",
      btn_name: "sdsa", // 自定义属性
      onClick: () => {
        console.log("Button clicked!");
      },
    },
    "Click Me"
  );

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

const nav = [
  { url: "/home", content: "主页" },
  { url: "/home", content: "主页" },
  { url: "/home", content: "主页" },
];


const handleReward= ()=>{
  deviceInfoStore.isShowReawrdDialog=true
}

const options  = ref([
  '口语陪练',
  '作文批改',
  '百科问答',
])
</script>

<template>
  <Header v-if="isShowHeaderComponent"></Header>
  <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
  <SmallScreenMenu v-if="isShowBottomMenu"></SmallScreenMenu>

  <h2 class="box">about界面</h2>


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
