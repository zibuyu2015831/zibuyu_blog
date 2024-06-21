<script setup>
import { onMounted, ref, reactive } from "vue";
import useCurrentPath from "@/stores/nav";

// 执行函数，拿到Store
const currentPath = useCurrentPath();

onMounted(() => {
  // 获取当前页面的完整 URL
  const currentPathString = window.location.pathname;
  console.log("当前页面路径:", currentPathString);
  currentPath.currentPath = currentPathString;
});

</script>

<template>
  <h2>about界面</h2>
</template>

<style scoped></style>
