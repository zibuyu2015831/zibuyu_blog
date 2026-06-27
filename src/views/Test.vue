<script setup>
import useDeviceInfo from "@/stores/deviceInfo";
import { ref, onMounted, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import AiEnglishLeftMenu from "@/components/AiEnglishLeftMenu.vue";
import InputBar from "@/content/InputBar.vue";


const deviceInfoStore = useDeviceInfo();

const { screenHeight, screenWidth, isEnglishWebShowLeft } = storeToRefs(deviceInfoStore);

const words = [
  "fortune",
  "forward",
  "found",
  "foundation",
  "frame",
  "frank",
  "free",
  "freedom",
  "freeze",
  "frequent",
  "fresh",
  "friend",
  "frighten",
  "front",
  "fruit",
  "fuel",
  "grass",
  "grateful",
  "grave",
  "gravity",
  "gray",
  "great",
  "greedy",
  "green",
  "greet",
  "grief",
  "grin",
  "end",
  "endure",
  "enemy",
  "energy",
  "enforce",
  "engage",
  "engine",
  "enhance",
  "enjoy",
  "enlarge",
  "enormous",
  "ensure",
];

var colors = [
  //备选颜色
  "#eccc68",
  "#ffa502",
  "#7bed9f",
  "#a4b0be",
  "#70a1ff",
  "#ff6b81",
];

const leftRef = ref(null);
const rightRef = ref(null);
const wordAreaRef = ref(null);
const texts = [];

function draw() {
  if (texts.length < 50) {
    //背景文字数量少于50则插入新背景文字

    texts.push({
      str: words[parseInt(Math.random() * words.length)], //随机选择菜名
      sx: Math.random() * rightRef.value.offsetWidth + leftRef.value.offsetWidth, //随机起始位置
      sy: Math.random() * rightRef.value.offsetHeight,
      vy: -Math.random(), //随机位移速度
      color: colors[parseInt(Math.random() * colors.length)], //随机选择颜色
      size: Math.random() * 30 + 25, //文字尺寸范围为20-40
      age: Math.random() * 20, //起始生命值为0-20
    });
  }

  // 清空 rightRef 内容
  if (rightRef.value) {
    wordAreaRef.value.innerHTML = "";
  }

  for (let i = 0; i < texts.length; i++) {
    //根据背景文字数组绘制元素
    const text = texts[i];
    const span = document.createElement("span");
    span.style.position = "absolute";
    span.style.top = text.sy + "px";
    span.style.left = text.sx + "px";
    span.style.color = text.color;
    span.style.fontSize = text.size + "px";
    span.style.opacity = 1 - text.age / 100; //渐变透明度

    span.innerHTML = text.str;

    if (rightRef.value) {
      wordAreaRef.value.appendChild(span); //添加进背景
    }
    text.sy += text.vy; //位移
    text.age++; //增加生命值
    if (text.age > 100) {
      //大于100则从数组中删除
      texts.splice(i, 1);
      i--; // 调整索引
    }
  }
}

// 画布动画定时器：本组件是路由页面（/test），离开后须清理，否则仍持续重绘（#05）
let drawTimer = null;
onMounted(() => {
  drawTimer = setInterval(draw, 100); // 每100ms调用一次draw函数
});

onBeforeUnmount(() => {
  if (drawTimer) clearInterval(drawTimer);
});

</script>

<template>
  <div class="page" :style="{ height: screenHeight + 'px', width: screenWidth + 'px' }">
    <div class="left" v-if="isEnglishWebShowLeft" ref="leftRef">
      <AiEnglishLeftMenu></AiEnglishLeftMenu>
    </div>
    <div class="right" ref="rightRef">
      <div class="word_area" ref="wordAreaRef"></div>

      <div class="input_area">
        <InputBar> </InputBar>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  
  display: flex;
  background-color: var(--english_page_bg);
  overflow: hidden; /* 确保页面不出现滚动条 */
}

.left {
  flex-grow: 0;
  height: 100vh;
}

.right {
  flex-grow: 1;
  height: 100vh;
  background-color: var(--english_right_bg);
  align-items: center;
  overflow: hidden; /* 确保右侧区域不出现滚动条 */

  display: flex;
  flex-direction: column;
}

.word_area {
  flex-wrap: 1;
  flex-shrink: 1;
  height: 90vh;
  overflow: hidden; /* 确保页面不出现滚动条 */
}

.input_area {
  width: 80%;
  max-width: 800px;
  flex-wrap: 1;
  flex-shrink: 1;
}
</style>
