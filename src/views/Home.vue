<script setup>
import { ref } from "vue";
import { getNews } from "@/api/getNews";
import useDeviceInfo from "@/stores/deviceInfo.js";
import { storeToRefs } from "pinia";

import postSuggestion from "@/content/postSuggestion.vue";
import Advertising from "@/content/Advertising.vue";
import RewardList from "@/content/RewardList.vue";
import MyInfo from "@/content/MyInfo.vue";
import ArticleCard from "@/content/ArticleCard.vue";
import { posts } from "@/content/data/posts.js";

defineOptions({ name: "HomeView" });
// // // // // // // // // // ↓ 测试代码块 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 测试代码块 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

// 执行函数，拿到Store
const deviceInfoStore = useDeviceInfo();

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
</script>

<template>
  <Header v-if="isShowHeaderComponent"></Header>
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
        <ArticleCard v-for="post in posts" :key="post.id" :post="post" />
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
        <Advertising> </Advertising>
      </div>

      <div class="right_card">
        <MyInfo> </MyInfo>
      </div>

      <div class="right_card">
        <postSuggestion> </postSuggestion>
      </div>

      <div class="right_card">
        <RewardList> </RewardList>
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
          <ArticleCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :show-cover="isShowArticleImageInSmallScreen"
          />
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
          <Advertising> </Advertising>
        </div>

        <div class="right_card">
          <MyInfo> </MyInfo>
        </div>

        <div class="right_card">
          <postSuggestion> </postSuggestion>
        </div>

        <div class="right_card">
          <RewardList> </RewardList>
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
  margin: 0 var(--space-1);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.article_page {
  margin-bottom: 30px;
}

/* 文章卡片样式已迁移至 content/ArticleCard.vue（数据驱动组件） */

/* 右侧板块设置 */

.right_card {
  margin-top: 25px;
}

.right_card:hover {
  box-shadow: 1px 2px 2px 2px var(--home_hover_shadow);
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
  background-color: var(--color-bg-default);
}
</style>
