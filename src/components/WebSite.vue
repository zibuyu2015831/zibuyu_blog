<script setup>
// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //
const url = "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg";
</script>

<template>
  <el-card class="card">
    <div class="top">
      <el-avatar shape="circle" :size="65" :fit="fit" :src="url" />

      <div class="describe">
        <div class="title">Card name</div>
        <div class="des">描述信息描述信息描述信息描述信息描述信息</div>
      </div>
    </div>

    <el-divider style="margin: 10px 0"></el-divider>

    <div class="bottom">
      <span>Card name</span>
    </div>
  </el-card>
</template>

<style scoped>
/* ↓ 代码块 ↓ */
.card {
  width: 250px;
  height: 150px;
}

.top {
  display: flex;
  align-items: center;
}

.describe {
  margin-left: 15px;
}

.title {
  font-size: 1.2em;
  max-width: 130px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.des {
  font-size: 0.9em;
  margin-top: 5px;
  overflow: hidden;
  max-width: 130px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* ↑ 代码块 ↑ */
</style>
