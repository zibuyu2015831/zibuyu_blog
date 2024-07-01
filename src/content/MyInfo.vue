<script setup>

// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

const props = defineProps({
  width: {
    type: [Number, String],
    default: 480,
    validator(value) {
      // 尝试将字符串转换为数字
      const num = Number(value);
      if (!isNaN(num)) {
        return true;
      }
      // 如果无法转换为数字，则使用默认值
      this.width = 480;
      return false;
    },
  },
});

const cardWidth = `${props.width}px`;
// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //
</script>

<template>
  <el-card :style="{ 'max-width': cardWidth }" class="card">
    <template #header>
      <div class="card-header">
        <span class="title">个人介绍</span>
      </div>
    </template>

    <div class="card_item">子不语</div>
    <div class="card_item">全栈开发工程师</div>
    <div class="card_item">现居广州</div>
    <div class="card_item">
      <div class="block">
        <img clsaa="card_img" src="@/assets/image/personal_wechat.png" />
        <div class="card_img_title">个人微信</div>
      </div>
      <div class="block">
        <img clsaa="card_img" src="@/assets/image/official_wechat.jpg" />
        <div class="card_img_title">公众号</div>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
/* ↓ 代码块 ↓ */

.card:hover {
  box-shadow: 1px 2px 2px 2px #7a7374;
  transform: scale(1.02);
  transition: transform 0.3s;
}

.title {
  font-size: 20px;
  font-weight: 800;
}

.card_item {
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
}
.block {
  margin: 6px 15px;
  display: inline-block;
  text-align: center;
}
.card_item img {
  display: block;
  width: 120px;
  height: 120px;
}
/* ↑ 代码块 ↑ */
</style>
