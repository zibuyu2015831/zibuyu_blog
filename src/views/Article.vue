<script setup>
import { ref, onBeforeMount } from "vue";
import { Marked } from "marked";
import hljs from "highlight.js";
import { getArticle } from "@/api/getArticle";
import { markedHighlight } from "marked-highlight";
import { sanitizeArticleContent } from "@/utils/sanitize";
import "highlight.js/styles/atom-one-dark-reasonable.css";
import "@/assets/css/zibuyu-markdown.css";

import { v4 as uuidv4 } from "uuid";
import useDeviceInfo from "@/stores/deviceInfo.js";
import { storeToRefs } from "pinia";

defineOptions({ name: "ArticleView" });

// // // // // ↓ 状态管理 ↓ // // // // //

const deviceInfo = useDeviceInfo(); // 执行函数，拿到Store

const {
  isShowHeaderNavigate,
  isShowBottomMenu,
  isShowHeaderComponent,
  isShowFooterComponent,

  isArticleRightBlockFixed,
  isArticleShowRightBox,
  webTheme,
} = storeToRefs(deviceInfo); // 读取状态

// // // // // ↑ 状态管理 ↑ // // // // //

// // // // // ↓ markdown渲染 ↓ // // // // //

// 文章是否被当前用户点赞
const userLike = ref(false);

function userLikeArticle() {
  userLike.value = !userLike.value;
}

// 使用正则表达式匹配并替换HTML标签，得到真正文本
function stripHtmlTags(html) {
  return html.replace(/<[^>]*>/g, "");
}

const toc = []; // 存放目录的标题与id
const imageIdList = []; // 存放图片的id与url
const article = ref("");
const tocItems = ref([]);
const marked = new Marked();

marked.use({
  pedantic: false,
  gfm: true,
  renderer: {
    heading: function heading(text, depth) {
      let headId = "uuid" + uuidv4().replace(/-/g, "");
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

      const real_text = stripHtmlTags(text);

      toc.push({ real_text, headId, depth_class });

      return `<h${depth} id="${headId}"><span>${text}</span></h${depth}>`;
    },
    image: function image(img_url, second, title) {
      let imageId = "uuid" + uuidv4().replace(/-/g, "");
      let pId = "uuid" + uuidv4().replace(/-/g, "");

      imageIdList.push({
        parentId: pId,
        imageId: imageId,
        imageUrl: img_url,
      });

      return `<p style="text-align:center" id="${pId}" >
        <img id="${imageId}" loading="lazy" style="border-radius: 1%;margin: 0 auto 5px;display: block;" src="${img_url}" alt="图片加载失败">
        <span style="color: gray; font-size: 16px;"> ↑ ${title} ↑ </span>
        </p>`;
    },
    link: function link(content, second, title) {
      return `<a href="${content}" target="_blank">${title}</a>`;
    },
    html: function html(content) {
      console.log("123");
      console.log("123", content);
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

const generateTOC = () => {
  return toc.map((item) => ({
    text: item.real_text,
    headId: item.headId,
    depth_class: item.depth_class,
  }));
};

const generateimageIdList = () => {
  return imageIdList.map((item) => ({
    parentId: item.parentId,
    imageId: item.imageId,
    imageUrl: item.imageUrl,
  }));
};

onBeforeMount(async () => {
  const markdownTEXT = await getArticle(132156);
  // 渲染前做 XSS 净化（保留代码高亮所需标签/类，见 utils/sanitize.js）
  article.value = sanitizeArticleContent(marked.parse(markdownTEXT));
  tocItems.value = generateTOC();
});

// 设置图片点击放大功能
const zoomedImage = ref(null);

const closeZoom = () => {
  zoomedImage.value = null;
};

setTimeout(() => {
  const images = generateimageIdList();

  images.forEach((image) => {
    const imageDOM = document.querySelector(`#${image.imageId}`);
    if (imageDOM) {
      imageDOM.addEventListener("click", () => {
        zoomedImage.value = image.imageUrl;
        console.log(`Image with id ${image.imageId} was clicked! ${image.imageUrl}`);
      });
    }
  });
}, 0);

// // // // // ↑ markdown渲染 ↑ // // // // //

// // // // // ↓ 页面向上、向下跳动按钮 ↓ // // // // //

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

// 根据元素ID值实现页面跳转
const scrollToAnchor = (headId) => {
  const element = document.getElementById(headId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

// // // // // ↑ 页面向上、向下跳动按钮 ↑ // // // // //

// // // // // ↓ 评论输入框 ↓ // // // // //

const textarea = ref();
const TextareaColor = ref("#F2F3F5");

function textOnBlur() {
  TextareaColor.value = "#F2F3F5";
}

function textOnFocus() {
  TextareaColor.value = "#e9d7df";
}

// // // // // ↑ 评论输入框 ↑ // // // // //
</script>

<template>
  <Header v-if="isShowHeaderComponent"></Header>
  <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
  <SmallScreenMenu v-if="isShowBottomMenu"></SmallScreenMenu>

  <el-row class="main" justify="center">
    <el-col :span="isArticleShowRightBox ? 11 : 22" class="left">
      <div class="article_head">
        <el-row justify="center">
          <div class="title"><span>我是标题</span></div>
        </el-row>
        <el-row justify="center">
          <div class="date">我是日期</div>
        </el-row>
        <el-row justify="center">
          <div class="tag">我是标签</div>
        </el-row>
      </div>

      <el-divider />

      <div v-html="article" class="markdown-body article_body" :class="webTheme"></div>

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

    <el-col
      v-if="isArticleShowRightBox"
      class="right"
      :span="5"
      :offset="1"
      :class="{ isfixed: isArticleRightBlockFixed }"
    >
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
            :key="item.headId"
            :class="item.depth_class"
            @click="() => scrollToAnchor(item.headId)"
          >
            {{ item.text }}
          </div>
        </div>
        <el-divider />
        <div class="toc_icon">
          <el-tooltip
            class="box-item"
            effect="dark"
            content="AI问答"
            placement="top-start"
          >
            <span class="iconfont icon-message"></span>
          </el-tooltip>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="我来评论两句"
            placement="top-start"
          >
            <span class="iconfont icon-iconfontconment2"></span>
          </el-tooltip>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="点赞+收藏"
            placement="top-start"
          >
            <span
              class="iconfont"
              :class="{ 'icon-good1': userLike, 'icon-good': !userLike }"
              @click="userLikeArticle"
            ></span>
          </el-tooltip>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="返回底部"
            placement="top-start"
          >
            <span class="iconfont icon-arrow-to-bottom" @click="backToButton"></span>
          </el-tooltip>

          <el-tooltip
            class="box-item"
            effect="dark"
            content="返回开头"
            placement="top-start"
          >
            <span class="iconfont icon-arrow-to-top" @click="backToTop"></span>
          </el-tooltip>
        </div>
      </el-card>
    </el-col>
  </el-row>

  <div>
    <div class="overlay" :class="{ active: zoomedImage }" @click="closeZoom"></div>
    <div v-if="zoomedImage" class="zoomed-image" @click="closeZoom">
      <img :src="zoomedImage" />
    </div>
  </div>

  <Footer v-if="isShowFooterComponent"></Footer>
</template>

<style scoped>
.main {
  background-color: var(--home_background);
}
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
  display: flex;
  justify-content: space-evenly;
}

.toc_icon span {
  font-size: 25px;
}

.toc_icon .icon-good1 {
  color: #cb3f1c;
}

.toc_icon .icon-arrow-to-bottom,
.toc_icon .icon-arrow-to-top {
  font-size: 23px;
}

.right_card {
  margin-bottom: 20px;
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
  padding: 3%;
  border-radius: 10px;
  font-size: 18px;
  margin-bottom: 20px;
  background-color: var(--markdown_article_body_deactivated);
  opacity: 0.9;
}

.markdown-body:hover {
  background-color: var(--markdown_article_body_activated);
}

.article_head {
  color: var(--markdown_article_title);
}

/* 右侧板块设置 */

.right_card {
  margin-top: 20px;
}

.main {
  position: relative;
}

.right {
  position: absolute;
  width: 400px;
  top: 50px;
  right: 80px;
}

.isfixed {
  width: 395px;
  position: fixed;
  right: 80px;
  top: 150px;
}

/* ↓ 页面标题设置 ↓ */

.title {
  font-size: 40px;
  font-weight: 600;
  margin-top: 20px;
  margin-bottom: 10px;
}

.title span {
  background: linear-gradient(to right, #538dcb, #cb1ccb) no-repeat right bottom;
  background-size: 0 3px;
  transition: background-size 1000ms;
}

.title span:hover {
  background-position-x: left;
  background-size: 100% 3px;
}

/* ↑ 页面标题设置 ↑ */

/* ↓ 图片点击之后的样式 ↓ */
.zoomed-image {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: rgb(233, 240, 229);
  padding: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}
.overlay.active {
  display: block;
}
/* ↑ 图片点击之后的样式 ↑ */
</style>
