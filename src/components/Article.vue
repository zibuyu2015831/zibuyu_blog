<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { Marked } from "marked";
import hljs from "highlight.js";
import { getArticle } from "@/api/getArticle";
import { markedHighlight } from "marked-highlight";
import "highlight.js/styles/atom-one-dark-reasonable.css";
import { v4 as uuidv4 } from "uuid";

const toc = [];
const article = ref("");
const tocItems = ref([]);

const marked = new Marked();

marked.use({
  pedantic: false,
  gfm: true,
  renderer: {
    heading: function heading(text, depth) {
      let slug = uuidv4();
      let depth_class = "";

      switch (depth) {
        case 1:
          depth_class = "toc_first";
          break;

        case 2:
          depth_class = "toc_second";
          break;

        case 3:
          depth_class = "toc_third";
          break;
      }

      toc.push({ text, slug, depth_class });

      return `<h${depth} id="${slug}">${text}</h${depth}>`;
    },
  },
});

marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "shell";
      return hljs.highlight(code, { language }).value;
    },
  })
);

// 根据元素ID值实现页面跳转
const scrollToAnchor = (slug) => {
  const element = document.getElementById(slug);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

const generateTOC = () => {
  return toc.map((item) => ({
    text: item.text,
    slug: item.slug,
    depth_class: item.depth_class,
  }));
};

onMounted(async () => {
  const markdownTEXT = await getArticle(132156);
  article.value = marked.parse(markdownTEXT);
  tocItems.value = generateTOC();
});

// 监听页面下滑，更改导航栏背景色
const scrollTop = ref(0);

const isfixed = computed(() => {
  return scrollTop.value > 640 ? true : false;
});

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

function handleScroll() {
  scrollTop.value = document.documentElement.scrollTop;
}

function backToTop() {
  window.scrollTo({
    top: 400,
    behavior: "smooth",
  });
}

function backToButton() {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: "smooth",
  });
}

// 评论输入框
const textarea = ref();
const TextareaColor = ref("#F2F3F5");

function textOnBlur() {
  TextareaColor.value = "#F2F3F5";
}

function textOnFocus() {
  TextareaColor.value = "#FFF";
}
</script>

<template>
  <el-row class="main">
    <el-col :span="11" :offset="4" class="left">
      <el-row justify="center">
        <div class="title"><span>我是标题</span></div>
      </el-row>
      <el-row justify="center">
        <div class="date">我是日期</div>
      </el-row>
      <el-row justify="center">
        <div class="tag">我是标签</div>
      </el-row>

      <el-divider />

      <div v-html="article" class="markdown-body"></div>

      <el-divider />

      <div class="comment_input" :style="{ backgroundColor: TextareaColor }">
        <el-row>
          <el-input
            class="comment_input_area"
            v-model="textarea"
            :rows="6"
            type="textarea"
            placeholder="留下您宝贵的评论"
            resize="none"
            @blur="textOnBlur"
            @focus="textOnFocus"
          />
          <el-button type="primary" class="comment_submit">提 交 评 论</el-button>
        </el-row>
      </div>
    </el-col>

    <el-col :span="5" class="right" :offset="1" :class="{ isfixed: isfixed }">
      <el-card style="max-width: 480px" class="right_card author_info">
        <template #header>
          <div class="card-header">
            <span class="right_title">作者信息</span>
          </div>
        </template>

        <div class="card_item">子不语</div>
        <div class="card_item">全栈开发工程师</div>
        <div class="card_item">现居广州</div>
      </el-card>

      <el-card style="max-width: 480px" class="right_card right_toc">
        <template #header>
          <div class="card-header">
            <span class="right_title">文章目录</span>
          </div>
        </template>
        <div class="toc">
          <div
            v-for="item in tocItems"
            :key="item.slug"
            :class="item.depth_class"
            @click="() => scrollToAnchor(item.slug)"
          >
            {{ item.text }}
          </div>
        </div>
        <el-divider />
        <div class="toc_icon">
          <!-- 由于SVG图标默认不携带任何属性 -->
          <!-- 你需要直接提供它们 -->
          <el-tooltip
            class="box-item"
            effect="dark"
            content="AI问答"
            placement="top-start"
          >
            <el-icon class="ai_chat"><ChatDotRound /></el-icon>
          </el-tooltip>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="我来评论两句"
            placement="top-start"
          >
            <el-icon class="comment"><Comment /></el-icon>
          </el-tooltip>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="点赞+收藏"
            placement="top-start"
          >
            <el-icon class="star"><Star /> </el-icon>
          </el-tooltip>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="返回底部"
            placement="top-start"
          >
            <el-icon class="share" @click="backToButton"> <Bottom /></el-icon>
          </el-tooltip>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="返回开头"
            placement="top-start"
          >
            <el-icon class="top" @click="backToTop"> <Top /> </el-icon>
          </el-tooltip>
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped>

/* 用户评论样式 */

.comment_input {
  background-color: #ffffff;
  padding: 20px;
  border: 2px solid green;
  margin-bottom: 50px;
  border-radius: 15px;
  position: relative;
}

.comment_input .comment_submit {
  position: absolute;
  right: 20px;
  bottom: 10px;
  margin-top: 20px;
}

/* 右侧文章目录下方按钮样式 */

.toc_icon {
  font-size: 25px;
  display: flex;
  justify-content: space-evenly;
}

.right_card {
  margin-bottom: 20px;
}

.isfixed {
  width: 395px;
  position: fixed;
  right: 240px;
  top: 100px;
}

.toc {
  margin-left: 20px;
}

.toc .toc_first {
  color: red;
}

.toc .toc_second {
  color: gray;
  margin-top: 10px;
  margin-left: 20px;
}

.toc .toc_third {
  color: green;
  margin-top: 10px;
  margin-left: 40px;
}

/* 文章主题样式 */

.markdown-body {
  background-color: #c0cad5; /* 自定义背景颜色 */
  padding: 30px;
  border-radius: 10px;
  font-size: 18px;
  margin-bottom: 20px;
}

/* 右侧板块设置 */

.right_card {
  margin-top: 20px;
}

/* 页面标题设置 */

.title {
  font-size: 40px;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 10px;
}

.title span{
  background:linear-gradient(to right,#538dcb,#cb1ccb ) no-repeat right bottom;
  background-size: 0 3px;
  transition: background-size 1000ms;
}

.title span:hover{
  background-position-x: left;
  background-size: 100% 3px;
}

</style>
