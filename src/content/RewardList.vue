<script setup>
import useDeviceInfo from "@/stores/deviceInfo.js";

// 读取状态
const deviceInfoStore = useDeviceInfo();


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

// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //



const rewardTableData = [
  {
    count: "5",
    name: "小明",
    note: "博主有源码吗？",
  },
  {
    count: "9",
    name: "小红",
    note: "太喜欢这个样式了",
  },
  {
    count: "24",
    name: "小黑",
    note: "很棒~支持",
  },
];

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //
</script>

<template>
  <el-card :style="{ 'max-width': cardWidth }" class="card">
    <template #header>
      <div class="card-header">
        <span class="title">打赏列表</span>
        <span class="sub_title">
          <el-button type="primary" link @click="deviceInfoStore.isShowReawrdDialog = true">
            我也要打赏
          </el-button>
        </span>
      </div>
    </template>

    <el-table
      :data="rewardTableData"
      style="width: 100%"
      :table-layout="'true'"
      max-height="200px"
    >
      <el-table-column label="昵称">
        <template #default="scope">
          <el-popover effect="light" trigger="hover" placement="top" width="auto">
            <template #default>
              <div>{{ scope.row.note }}</div>
            </template>
            <template #reference>
              {{ scope.row.name }}
            </template>
          </el-popover>
        </template>
      </el-table-column>

      <el-table-column label="金额">
        <template #default="scope">
          <span> &yen;&nbsp; {{ scope.row.count }}</span>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 弹出框挂载在全局，即App.vue -->

</template>

<style scoped>
/* ↓ 卡片标题样式 ↓ */

.card:hover {
  box-shadow: 1px 2px 2px 2px var(--home_hover_shadow);
  transform: scale(1.02);
  transition: transform 0.3s;
}

.title {
  font-size: 20px;
  font-weight: 800;
}

.sub_title {
  float: right;
}
/* ↑ 卡片标题样式 ↑ */

</style>
