<script setup>
import useDeviceInfo from "@/stores/deviceInfo.js";
import { storeToRefs } from "pinia";

import postSuggestion from "@/content/postSuggestion.vue";
import FeaturedPosts from "@/content/FeaturedPosts.vue";
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
</script>

<template>
  <Header v-if="isShowHeaderComponent"></Header>
  <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
  <SmallScreenMenu v-if="isShowBottomMenu"></SmallScreenMenu>

  <el-row class="main" justify="center" v-if="isBigScreen">
    <el-col :span="11" class="left">
      <FeaturedPosts />

      <el-divider />

      <el-col class="article_list">
        <ArticleCard v-for="post in posts" :key="post.id" :post="post" />
      </el-col>
    </el-col>

    <el-col :span="5" :offset="1" class="right">
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

    <!-- 分页器跨整行（span 24）独占一行，在整页内容宽度内居中 -->
    <el-col :span="24" class="article_page">
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
  </el-row>

  <div class="main" v-if="!isBigScreen">
    <el-row justify="center">
      <!-- 小屏（无右栏）精选满宽，与下方文章列表对齐、不留侧白；
           中屏（有右栏）维持居中 20 栏的原观感 -->
      <el-col :span="isShowRightBox ? 20 : 24">
        <FeaturedPosts />
      </el-col>
    </el-row>

    <el-row justify="center" style="margin-top: 24px">
      <el-col :span="isShowRightBox ? 14 : 24" class="left">
        <el-col class="article_list">
          <ArticleCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
            :show-cover="isShowArticleImageInSmallScreen"
          />
        </el-col>
      </el-col>

      <el-col :span="6" class="right" v-if="isShowRightBox">
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

      <!-- 分页器跨整行（span 24）独占一行，在整页内容宽度内居中 -->
      <el-col :span="24" class="article_page">
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

/* ↓ 文章列表设置 ↓ */

.article_list {
  margin: 0 var(--space-1);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.article_page {
  margin-top: 30px;
  margin-bottom: 30px;
}

/* 文章卡片样式已迁移至 content/ArticleCard.vue（数据驱动组件） */

/* 右侧板块设置 */

.right_card {
  margin-top: 25px;
}
/* 悬浮效果交由各卡片自身（仅柔和阴影），此处不再叠加缩放，避免双重 scale */

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

.el-divider__text {
  background-color: var(--color-bg-default);
}
</style>
