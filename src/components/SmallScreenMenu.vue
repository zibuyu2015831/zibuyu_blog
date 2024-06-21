<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Search } from "@element-plus/icons-vue";

// // // // // // // // // // ↓ 路径导航 ↓ // // // // // // // // // //

const router = useRouter();

// 监听元素的点击
function goHomeClick() {
  // 跳转到【首页】
  // router.push("/home")  // 简单写法
  router.push({
    // name: "home"
    path: "/home",
  });
}

function goBackClick() {
  // router.back()
  // router.forward()

  // go(delta)
  // go(1) -> forward()
  // go(-1) -> back()
  router.go(-1);
}

// // // // // // // // // // ↑ 路径导航 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 搜索功能 ↓ // // // // // // // // // //
const search_input = ref("");
const search_option = ref("");

function submintSearch() {
  console.log("搜索关键词", search_input.value);
  console.log("搜索选项", search_option.value);
}

// // // // // // // // // // ↑ 搜索功能 ↑ // // // // // // // // // //
</script>

<template>
  <el-row justify="center">
    <el-col span="24" class="search_input">
      <el-page-header @back="goBackClick">
        <template #content>
          <el-input
            v-model="search_input"
            style="max-width: 400px"
            placeholder="请输入搜索关键词"
            class="input-with-select"
          >
            <template #append>
              <el-button :icon="Search" @click="submintSearch" />
            </template>
          </el-input>
        </template>

        <template #extra>
          <el-dropdown>
            <div class="top_menu">
              <el-icon size="24"><Menu /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>Action 1</el-dropdown-item>
                <el-dropdown-item>Action 2</el-dropdown-item>
                <el-dropdown-item>Action 3</el-dropdown-item>
                <el-dropdown-item disabled>Action 4</el-dropdown-item>
                <el-dropdown-item divided>登录</el-dropdown-item>
                <el-dropdown-item divided>注册</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </el-page-header>
    </el-col>

    <el-col :span="2"> </el-col>
  </el-row>

  <div class="bottom_menu">
    <div class="menu_item">
      <el-icon class="menu_icon" size="20"><Fold /></el-icon>
      <el-text class="menu_title" type="info">菜单</el-text>
    </div>

    <div class="menu_item" @click="goHomeClick">
      <el-icon class="menu_icon" size="20"><House /></el-icon>
      <el-text class="menu_title" type="info">主页</el-text>
    </div>

    <div class="menu_item">
      <el-icon class="menu_icon" size="20"><Avatar /></el-icon>
      <el-text class="menu_title" type="info">我的</el-text>
    </div>
  </div>
</template>

<style scoped>
.box {
  width: 100%;
  height: 2000px;
  background-color: bisque;
  position: relative;
}

.menu_item {
  margin-top: 8px;
  margin-bottom: 5px;
}

.menu_title {
  display: block;
  margin: 0 auto;
}

.menu_icon {
  display: block;
  margin: 0 auto;
}

.bottom_menu {
  height: 50px;
  width: 100%;
  background-color: #f0eeee;
  position: fixed;
  bottom: 0px;
  display: flex;
  justify-content: space-evenly;
  z-index: 100;
}

/* ↓ 底部设计 ↓ */

/* ↑ 底部设计 ↑ */

/* ↓ 顶部设计 ↓ */

.search_input {
  margin: 5px 10px;
  margin-left: 15px;
}

.top_menu {
  padding-right: 20px;
  margin-top: 3px;
}

/* ↑ 顶部设计 ↑ */
</style>
