<script setup>
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import HeaderNavigate from "@/components/HeaderNavigate.vue";
import SmallScreenMenu from "@/components/SmallScreenMenu.vue";

import { onMounted, ref, onBeforeMount, onBeforeUnmount } from "vue";

// // // // // // // // // // ↓ 响应式布局 ↓ // // // // // // // // // //

const isShowHeaderNavigate = ref(true);

const updateScreenWidth = () => {
  if (window.innerWidth < 1025) {
    isShowHeaderNavigate.value = false;
  }else{
    isShowHeaderNavigate.value = true;
  }
};

onMounted(() => {
  updateScreenWidth()
  window.addEventListener('resize', updateScreenWidth,{'passive': true});
});

onBeforeUnmount(() => {
  updateScreenWidth()
  window.removeEventListener('resize', updateScreenWidth,{'passive': true});
});


// // // // // // // // // // ↑ 响应式布局 ↑ // // // // // // // // // //

</script>

<template>
  <div class="common-layout">

    <Header></Header>
    <HeaderNavigate v-if="isShowHeaderNavigate"></HeaderNavigate>
    <SmallScreenMenu v-if="!isShowHeaderNavigate"></SmallScreenMenu>
    <router-view ></router-view>
    <Footer  v-if="isShowHeaderNavigate"></Footer>

  </div>
</template>

<style scoped>
.common-layout {
  background-color: #f0eeee;
}
</style>
