<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import useDeviceInfo from "@/stores/nav";
import {storeToRefs} from "pinia";

// // // // // // // // // // ↓ 测试代码 ↓ // // // // // // // // // //




// // // // // // // // // // ↑ 测试代码 ↑ // // // // // // // // // //



// // // // // ↓ 根据视口高度，修改首图高度 ↓ // // // // //

const deviceInfo = useDeviceInfo(); // 执行函数，拿到Store

const {homeImageHeight} = storeToRefs(deviceInfo) // 读取状态

// // // // // ↑ 根据视口高度，修改首图高度 ↑ // // // // //


</script>

<template>
  <el-row>
    <el-col class="blog_header">
      <img
        class="header_img"
        :style="{ height: homeImageHeight + 'px' }"
        src="../assets/header.jpg"
        alt=""
      />
    </el-col>
  </el-row>
</template>

<style scoped>
.blog_header .header_img {
  width: 100%;

  object-fit: cover;
}
</style>
