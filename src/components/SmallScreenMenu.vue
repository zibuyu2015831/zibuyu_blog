<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Search } from "@element-plus/icons-vue";
import { User, Lock, Promotion } from '@element-plus/icons-vue';

// // // // // // // // // // ↓ 测试代码 ↓ // // // // // // // // // //




// // // // // // // // // // ↑ 测试代码 ↑ // // // // // // // // // //



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
  // 函数写法
  // router.back()
  // router.forward()

  // 数字写法：go(delta)
  // go(1) -> forward()
  // go(-1) -> back()
  router.go(-1);
}

// // // // // // // // // // ↑ 路径导航 ↑ // // // // // // // // // //



// // // // // // // // // // ↓ 搜索功能 ↓ // // // // // // // // // //

const search_input = ref("");
const search_option = ref("1");

function submintSearch() {
  console.log("用户输入的搜索关键词是: ", search_input.value);
  console.log("搜索选项", search_option.value);
}

// // // // // // // // // // ↑ 搜索功能 ↑ // // // // // // // // // //
</script>

<template>
  <el-row justify="center" class="search_row">
    <el-col span=24 class="search_input">

      <el-input
      v-model="search_input"
      style="max-width: 600px"
      placeholder="请输入搜索关键词"
      class="input-with-select"
    >
      <template #prepend>
        <el-select v-model="search_option" placeholder="选项" style="width: 115px">
          <el-option label="文章" value="1" />
          <el-option label="资源" value="2" />
        </el-select>
      </template>
      <template #append>
        <el-button :icon="Search" @click="submintSearch" />
      </template>
    </el-input>

    </el-col>

    <el-col :span="2"> </el-col>
  </el-row>

  <div class="bottom_menu">
    <div class="menu_item">

      <span class="iconfont icon-a-066_quanbu menu_icon"></span>
      <el-text class="menu_title" type="info">菜单</el-text>
    </div>

    <div class="menu_item" @click="goHomeClick">

      <span class="iconfont icon-home2 menu_icon"></span>
      <el-text class="menu_title" type="info">主页</el-text>
    </div>

    <div class="menu_item">
      <span class="iconfont icon-user menu_icon"></span>
      <el-text class="menu_title" type="info" >我的</el-text>
    </div>
  </div>

</template>

<style scoped>

/* ↓ 底部设计 ↓ */

.menu_item {
  margin:10px auto;

}

.menu_title {
  display: block;
}

.menu_icon {
  display: block;
  font-size: 26px;
}

.bottom_menu {
  height: 60px;
  width: 100%;
  background-color: var(--header-background);
  position: fixed;
  bottom: 0px;
  display: flex;
  justify-content: space-evenly;
  z-index: 100;
}



/* ↑ 底部设计 ↑ */

/* ↓ 顶部设计 ↓ */

.search_row{
  background-color: var(--home_background);
}

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
