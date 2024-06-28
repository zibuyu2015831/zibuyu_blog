<script setup>
  import useDeviceInfo from '@/stores/deviceInfo'
  import {computed} from 'vue'
  import {storeToRefs} from 'pinia'
// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //
  const deviceInfoStore = useDeviceInfo()


  const {screenHeight,screenWidth} = storeToRefs(deviceInfoStore)
// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //
  

  // // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //
 const rightWidth = computed(()=>{
  console.log('屏幕宽度：',deviceInfoStore.userScreenWidth)
  console.log('右侧区域宽度：',deviceInfoStore.userScreenWidth-300)

  return `${deviceInfoStore.userScreenWidth-300}px`

 })
// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //
</script>

<template>


  <el-row class="page" :style="{height:screenHeight,width:screenWidth}">
    <el-col :span="3" class="left" :style="{height:screenHeight}"> </el-col>
    <el-col :span="12" class="right" :style="{height:screenHeight}" :offset="4"> </el-col>
  </el-row>


</template>

<style scoped>

/* ↓ 代码块 ↓ */ 
  .page{
    overflow:hidden;
    background-color: var(--english_page_bg);
  }

  .left{
    min-width: 300px;

    background-color: #F9F9F9;
  }
.right{

  background-color: rgb(169, 109, 31);

}

.right_content{
margin: 0 auto;
  width: 900px;
  background-color: rgb(4, 129, 207);
}
/* ↑ 代码块 ↑ */
  
</style>
