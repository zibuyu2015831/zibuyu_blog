<script setup>
import useDeviceInfo from "@/stores/deviceInfo.js";
import { storeToRefs } from "pinia";

import WebSite from "@/components/WebSite.vue";
import InputBar from "@/content/InputBar.vue";
// // // // // // // // // // ↓ 测试代码块 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 测试代码块 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

// 执行函数，拿到Store
const deviceInfoStore = useDeviceInfo();

// 读取状态
const { isShowHeaderNavigate, isShowBottomMenu, isShowFooterComponent } = storeToRefs(
  deviceInfoStore
);

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //
// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //
</script>

<template>
  <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
  <SmallScreenMenu v-if="isShowBottomMenu"></SmallScreenMenu>

  <div class="container">
    <el-row>
      <el-col :span="8" :offset="8" class="header">
        <InputBar> </InputBar>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="16" :offset="4" class="content recommendations">
        <WebSite v-for="o in 4" :key="o" class="web_site"> </WebSite>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="16" :offset="4" class="divider">
        <el-divider>
          <el-icon><star-filled /></el-icon>
        </el-divider>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="16" :offset="4" class="content">
        <WebSite v-for="o in 24" :key="o" class="web_site"> </WebSite>
      </el-col>
    </el-row>
  </div>

  <Footer v-if="isShowFooterComponent"></Footer>
</template>

<style scoped>
/* ↓ 代码块 ↓ */

.container {
  width: 100%;
  background-color: var(--home_background);
}

.header {
  margin-top: 200px;
}

.divider {
  margin-top: 50px;
}

.content {
  margin-top: 50px;

  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: center;

}

.web_site {
  margin: 20px;
}
/* ↑ 代码块 ↑ */
</style>
