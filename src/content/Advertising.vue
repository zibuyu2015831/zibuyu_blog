<script setup>

defineOptions({ name: "AdvertisingCard" });

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
        <span class="title">独家推广</span>
      </div>
    </template>
    <div>
      <el-carousel
        :interval="5000"
        arrow="always"
        :motion-blur="true"
        indicator-position="none"
      >
        <el-carousel-item v-for="item in 3" :key="item">
          <h3 text="2xl" justify="center">{{ item }}</h3>
        </el-carousel-item>
      </el-carousel>
    </div>
  </el-card>
</template>

<style scoped>
/* ↓ 代码块 ↓ */
.card:hover {
  box-shadow: 1px 2px 2px 2px var(--home_hover_shadow);
  transform: scale(1.02);
  transition: transform 0.3s;
}

.title {
  font-size: 20px;
  font-weight: 800;
}
/* ↑ 代码块 ↑ */
</style>
