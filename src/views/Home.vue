<script setup>
import { ref, reactive } from "vue";
import { getNews } from "@/api/getNews";
import { ElNotification } from "element-plus";
import useDeviceInfo from "@/stores/deviceInfo.js";
import { storeToRefs } from "pinia";
import useUserInfo from "@/stores/userInfo";

import postSuggestion from "@/content/postSuggestion.vue";
import Advertising from "@/content/Advertising.vue";
import RewardList from "@/content/RewardList.vue";
import MyInfo from "@/content/MyInfo.vue";
// // // // // // // // // // ↓ 测试代码块 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 测试代码块 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

// 执行函数，拿到Store
const deviceInfoStore = useDeviceInfo();
const userInfoStore = useUserInfo();

// 读取状态
const {
  isShowHeaderNavigate,
  isShowBottomMenu,
  isShowHeaderComponent,
  isShowFooterComponent,
  isShowRightBox,
  isPaginationmall,
  isShowArticleImageInSmallScreen,
  isBigScreen,
} = storeToRefs(deviceInfoStore);

const { username } = storeToRefs(userInfoStore); // 读取状态

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 新闻轮播图 ↓ // // // // // // // // // //
const news_num = ref(0);

function carouselChange(num) {
  news_num.value = num;
}
// // // // // // // // // // ↑ 新闻轮播图 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 异步获取顶部新闻 ↓ // // // // // // // // // //

let news = ref([
  {
    name: "",
    title: "正在获取网络新闻...",
    link: "#",
    titleTag: "",
  },
]);

setTimeout(() => {
  getNews().then((res) => {
    news.value = res;
  }, 0);
});

// // // // // // // // // // ↑ 异步获取顶部新闻 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 右侧打赏列表 ↓ // // // // // // // // // //

const rewardTableData = [
  {
    count: "5",
    name: "小明",
    note: "博主有源码吗？",
  },
  {
    count: "9",
    name: "小红",
    note: "太喜欢这个样式了",
  },
  {
    count: "24",
    name: "小黑",
    note: "很棒~支持",
  },
];

// // // // // // // // // // ↑ 右侧打赏列表 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 右侧板块：意见反馈 ↓ // // // // // // // // // //

const userSuggestion = reactive({
  note: "",
  contact: "",
});

function resetUserSuggestion() {
  userSuggestion.note = "";
  userSuggestion.contact = "";

  ElNotification({
    title: "意见反馈",
    message: "已重置反馈信息",
    position: "bottom-right",
    type: "info",
  });
}

function submitUserSuggestion() {
  if (!userSuggestion.note) {
    ElNotification({
      title: "意见反馈",
      message: "您好像忘记填写反馈内容了 0.0",
      position: "bottom-right",
      type: "warning",
    });

    return;
  }

  console.log("意见反馈-联系方式：", userSuggestion.contact);
  console.log("意见反馈-具体内容：", userSuggestion.note);

  userSuggestion.note = "";
  userSuggestion.contact = "";

  ElNotification({
    title: "意见反馈",
    message: "您的意见反馈已提交",
    position: "bottom-right",
    type: "success",
  });
}

// // // // // // // // // // ↑ 右侧板块：意见反馈 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 右侧板块：用户打赏 ↓ // // // // // // // // // //

const userRewardDialogVisible = ref(false); // 打赏提示框

const userRewardMessage = reactive({
  name: "",
  note: "",
  contact: "",
});

function resetUserRewardMessage() {
  userRewardDialogVisible.value = false;
  userRewardMessage.name = "";
  userRewardMessage.note = "";
  userRewardMessage.contact = "";
}

function submitUserRewardMessage() {
  userRewardDialogVisible.value = false;

  console.log(userRewardMessage.name);
  console.log(userRewardMessage.note);
  console.log(userRewardMessage.contact);
  console.log("submit!");

  userRewardMessage.name = "";
  userRewardMessage.note = "";
  userRewardMessage.contact = "";
}

// // // // // // // // // // ↑ 右侧板块：用户打赏 ↑ // // // // // // // // // //
</script>

<template>

  <Header
    v-if="isShowHeaderComponent"
  ></Header>
  <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
  <SmallScreenMenu v-if="isShowBottomMenu"></SmallScreenMenu>



  <el-row class="main" justify="center" v-if="isBigScreen">
    <el-col :span="11" class="left">
      <el-row justify="center">
        <el-col class="news">
          <el-carousel
            height="200px"
            direction="vertical"
            type="card"
            :autoplay="true"
            :loop="true"
            indicator-position="none"
            @change="carouselChange"
          >
            <el-carousel-item
              v-for="(item, index) in news"
              :key="index"
              :class="{
                news_activate: index === news_num,
                news_deactivate: index !== news_num,
              }"
            >
              <h3 text="1xl" justify="center" class="news_content">
                <a
                  target="_blank"
                  :href="item.link"
                  :class="{ news_activate: index === news_num }"
                  :id="index"
                >
                  <span
                    >{{
                      item.name.slice(0, -2) != "B站排"
                        ? "【 " + item.name.slice(0, -2) + " 】"
                        : "【 B站 】"
                    }}{{ item.title }}</span
                  >
                </a>
              </h3>
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>

      <el-divider />

      <el-col class="article_list">
        <el-row justify="center" class="" v-for="movie in 10" :key="movie">
          <el-card class="article_card" :body-style="{ padding: '5px 1px' }">
            <el-image
              class="article_image"
              src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
              fit="fill"
            />

            <div class="article_intro">
              <div class="title">
                <a href="/article/123" class="title_text">
                  <el-text tag="b" size="large" class="mx-1" type="success" truncated
                    >这是一篇博客标题，这是一篇博客标题，标题文本比较长</el-text
                  >
                </a>
              </div>

              <div class="abstract">
                <el-text line-clamp="2" size="default" tag="i">
                  这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长
                </el-text>
              </div>

              <div class="data">
                <div class="category flex gap-2">
                  <el-tag type="warning" effect="dark" round> 文章分类 </el-tag>
                </div>
                <div class="date">
                  <el-icon class="article_icon"><Clock /></el-icon>
                  <el-text class="mx-1" size="small">2024-06-19</el-text>
                </div>
                <div class="view_data">
                  <el-icon class="article_icon"><View /></el-icon>
                  <el-text class="mx-1" size="small">2009</el-text>
                </div>
                <div class="like_data">
                  <el-icon class="article_icon"><StarFilled /></el-icon>
                  <el-text class="mx-1" size="small">2029</el-text>
                </div>
              </div>
            </div>
          </el-card>
        </el-row>
      </el-col>

      <el-col class="article_page">
        <el-row justify="center">
          <div>
            <el-pagination
              background
              layout="prev, pager, next"
              :total="1000"
              :small="isPaginationmall"
            />
          </div>
        </el-row>
      </el-col>
    </el-col>

    <el-col :span="5" :offset="1" class="right">

      <div class="right_card">
        <Advertising>  </Advertising>
      </div>


      <div class="right_card">
        <MyInfo>  </MyInfo>
      </div>

      <div class="right_card">
        <postSuggestion>  </postSuggestion>
      </div>


      <div class="right_card">
        <RewardList>  </RewardList>
      </div>



    </el-col>
  </el-row>

  <div class="main" v-if="!isBigScreen">
    <el-row justify="center">
      <el-col class="news" :span="20">
        <el-carousel
          height="200px"
          direction="vertical"
          type="card"
          :autoplay="true"
          :loop="true"
          indicator-position="none"
          @change="carouselChange"
        >
          <el-carousel-item
            v-for="(item, index) in news"
            :key="index"
            :class="{
              news_activate: index === news_num,
              news_deactivate: index !== news_num,
            }"
          >
            <h3 text="1xl" justify="center" class="news_content">
              <a
                target="_blank"
                :href="item.link"
                :class="{ news_activate: index === news_num }"
                :id="index"
              >
                <span
                  >{{
                    item.name.slice(0, -2) != "B站排"
                      ? "【 " + item.name.slice(0, -2) + " 】"
                      : "【 B站 】"
                  }}{{ item.title }}</span
                >
              </a>
            </h3>
          </el-carousel-item>
        </el-carousel>
      </el-col>
    </el-row>

    <el-row justify="center" style="margin-top: 50px">
      <el-col :span="isShowRightBox ? 14 : 24" class="left">
        <el-col class="article_list">
          <el-row justify="center" class="" v-for="movie in 10" :key="movie">
            <el-card class="article_card" :body-style="{ padding: '5px 1px' }">
              <el-image
                v-if="isShowArticleImageInSmallScreen"
                class="article_image"
                src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
                fit="fill"
              />

              <div class="article_intro">
                <div class="title">
                  <a href="/article/123" class="title_text">
                    <el-text tag="b" size="large" class="mx-1" type="success" truncated
                      >这是一篇博客标题，这是一篇博客标题，标题文本比较长</el-text
                    >
                  </a>
                </div>

                <div class="abstract">
                  <el-text line-clamp="2" size="default" tag="i">
                    这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长这是博客摘要，文本比较长
                  </el-text>
                </div>

                <div class="data">
                  <div class="category flex gap-2">
                    <el-tag type="warning" effect="dark" round> 文章分类 </el-tag>
                  </div>
                  <div class="date">
                    <el-icon class="article_icon"><Clock /></el-icon>
                    <el-text class="mx-1" size="small">2024-06-19</el-text>
                  </div>
                  <div class="view_data">
                    <el-icon class="article_icon"><View /></el-icon>
                    <el-text class="mx-1" size="small">2009</el-text>
                  </div>
                  <div class="like_data">
                    <el-icon class="article_icon"><StarFilled /></el-icon>
                    <el-text class="mx-1" size="small">2029</el-text>
                  </div>
                </div>
              </div>
            </el-card>
          </el-row>
        </el-col>

        <el-col class="article_page">
          <el-row justify="center">
            <div>
              <el-pagination
                background
                layout="prev, pager, next"
                :total="1000"
                :small="isPaginationmall"
              />
            </div>
          </el-row>
        </el-col>
      </el-col>

      <el-col :span="6" class="right" v-if="isShowRightBox">


        <div class="right_card">
          <Advertising>  </Advertising>
        </div>

        <div class="right_card">
          <MyInfo>  </MyInfo>
        </div>
  
        <div class="right_card">
          <postSuggestion>  </postSuggestion>
        </div>
  

        <div class="right_card">
          <RewardList>  </RewardList>
        </div>
  

      </el-col>
    </el-row>
  </div>



  <Footer v-if="isShowFooterComponent"></Footer>
</template>

<style scoped>
/* ↓ 主体设置 ↓ */

.main {
  background-color: var(--home_background);
  padding-bottom: 50px;
}

.dialog_input .input {
  margin-top: 10px;
}

/* ↓ 顶部滚动屏 ↓ */

.news {
  padding-top: 30px;
}

/* ↓ 文章列表设置 ↓ */

.article_list {
  margin: 0 5px;
}

.article_page {
  margin-bottom: 30px;
}

.article_card {
  margin-bottom: 20px;
  /* 设置过渡效果的持续时间为0.3秒 */
  transition: transform 0.3s;
}

.article_card:hover {
  box-shadow: 1px 2px 2px 2px var(--home_hover_shadow);
  transform: scale(1.02);
}

.article_card .article_image {
  width: 160px;
  height: 90px;
  margin-left: 15px;
  border-radius: 10px;
  display: inline-block;
  vertical-align: middle;
}

.article_card .article_intro {
  margin: 10px 20px;
  display: inline-block;
  vertical-align: middle;
}

.article_intro .title {
  max-width: 320px;
  max-height: 30px;
  margin-bottom: 10px;
}

.article_intro .title a {
  all: unset;
  font-size: 25px;
  cursor: pointer;
}

.article_intro .title .title_text {
  background: linear-gradient(to right, #538dcb, #cb1ccb) no-repeat right bottom;
  background-size: 0 2px;
  transition: background-size 500ms;
}

.article_intro .title .title_text:hover {
  background-position-x: left;
  background-size: 100% 2px;
}

.article_intro .data {
  margin-top: 10px;
  display: flex;
  justify-content: space-evenly;
}

.article_intro .abstract {
  max-height: 42px;
  max-width: 500px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.article_intro .date {
  position: relative;
}

.article_intro .article_icon {
  margin-right: 5px;
}

.article_intro .date .article_icon {
  color: red;
  top: 2px;
}

.article_intro .view_data .article_icon {
  color: green;
  top: 2px;
}

.article_intro .like_data .article_icon {
  color: rgb(233, 177, 9);
  top: 2px;
}

/* 右侧板块设置 */

.right_card {
  margin-top: 25px;
}

.right_card:hover {
  box-shadow: 1px 2px 2px 2px #b8b2b3;
  transform: scale(1.02);
}

.right_title {
  font-size: 20px;
  font-weight: 800;
}

.right_sub_title {
  float: right;
}

.card_item {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}

.card_item .block {
  margin: 5px 30px;
  display: inline-block;
  text-align: center;
}

.card_item img {
  display: block;
  width: 120px;
  height: 120px;
}

/* ↓ element 样式 ↓ */

.el-carousel__item h3 {
  opacity: 0.75;
  line-height: 100px;
  margin: 0;
  text-align: center;
}

.el-carousel__item.news_deactivate {
  opacity: 0.3;
  border-radius: 20px;
  font-size: clamp(8px, 3.8vw, 18px); /* 设置字体大小的最小值、自适应值和最大值 */

  background-color: var(--news_deactivate_background);
}

.el-carousel__item.news_activate {
  opacity: 1;
  border-radius: 20px;
  font-size: clamp(10px, 4vw, 20px); /* 设置字体大小的最小值、自适应值和最大值 */
  overflow: hidden; /* 超出部分隐藏 */

  background-color: var(--news_activate_background);
}

.el-carousel__item .news_content {
  color: var(--news_content);
  padding: auto 10px;
  display: inline-block; /* 使span可以设置宽度和高度 */
  word-wrap: break-word; /* 长单词换行 */
  white-space: nowrap; /* 文本不换行 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 使用省略号表示被修剪的文本 */
  width: 100%;
}

.el-divider__text {
  background-color: #f0eeee;
}
</style>
