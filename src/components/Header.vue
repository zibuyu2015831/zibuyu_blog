<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

// // // // // // // // // // ↓ 测试代码 ↓ // // // // // // // // // //

const imgHeight = ref(window.innerHeight*0.7 );

const handleResize = () => {
  imgHeight.value = window.innerHeight*0.7 ; // 根据需要调整图片宽度的比例
  console.log(imgHeight.value)
};

onMounted(() => {
  handleResize()
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  handleResize()

  window.removeEventListener("resize", handleResize);
});
// // // // // // // // // // ↑ 测试代码 ↑ // // // // // // // // // //
</script>

<template>
  <el-row>
    <el-col class="blog_header">
      <img class="header_img" :style="{height:imgHeight}" src="../assets/header.jpg" alt="" />
    </el-col>
  </el-row>
</template>

<style scoped>
.blog_header .header_img {
  width: 100%;

  object-fit: cover;
}
</style>
