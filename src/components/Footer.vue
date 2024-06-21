<script setup>
import { ref, onMounted, onBeforeUnmount, onBeforeMount } from "vue";
import { calculateTime } from "@/utils/handle_date";

// // // // // // // // // // ↓ 响应式布局 ↓ // // // // // // // // // //

const isShowLinkBox = ref(true);
const mainColumnSpanNum = ref(9);
const mainColumnOffsetNum = ref(5);

const updateScreenWidth = () => {
  if (window.innerWidth < 500) {
    mainColumnSpanNum.value = 24;
    mainColumnOffsetNum.value = 0;
    isShowLinkBox.value = false;
  } else if (window.innerWidth < 1500) {
    mainColumnSpanNum.value = 24;
    mainColumnOffsetNum.value = 0;
    isShowLinkBox.value = false;
  } else {
    mainColumnSpanNum.value = 9;
    mainColumnOffsetNum.value = 5;
    isShowLinkBox.value = true;
  }
};

onMounted(() => {
  window.addEventListener("resize", updateScreenWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", updateScreenWidth);
});

onBeforeMount(() => {
  if (window.innerWidth < 500) {
    isShowLinkBox.value = false;
    mainColumnSpanNum.value = 24;
    mainColumnOffsetNum.value = 0;
  } else if (window.innerWidth < 2200) {
    isShowLinkBox.value = false;
    mainColumnSpanNum.value = 24;
    mainColumnOffsetNum.value = 0;
  } else {
    isShowLinkBox.value = true;
    mainColumnSpanNum.value = 9;
    mainColumnOffsetNum.value = 5;
  }
});

// // // // // // // // // // ↓ 响应式布局 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 运行时间计算 ↑ // // // // // // // // // //

const createTimeStamp = "1718804766";
let timeString = ref("");
setInterval(() => {
  timeString.value = calculateTime(createTimeStamp);
}, 1000);

// // // // // // // // // // ↑ 运行时间计算 ↑ // // // // // // // // // //

</script>

<template>
  <el-row class="footer">
    <el-col class="left" :span="mainColumnSpanNum" :offset="mainColumnOffsetNum">
      <div class="left_container">
        <div class="version">
          <span class="version_title">version </span>
          <span class="version_num">1.0.0</span>
        </div>

        <div class="date">
          <span class="site_running_date">网站已运行: &nbsp; {{ timeString }}</span>
        </div>

        <div class="beian">
          <img src="../assets/beian.png" alt="备案" />
          <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">
            备案号 暂无
          </a>
        </div>
      </div>
    </el-col>

    <el-col class="right" :span="5" v-if="isShowLinkBox">
      <div class="right_container">
        <a href="#" target="_blank">
          <img class="footer_icon" src="../assets/bilibili.png" alt="哔哩哔哩" />
        </a>
        <a href="#" target="_blank">
          <img class="footer_icon" src="../assets/gitee.png" alt="gitee" />
        </a>
        <a href="#" target="_blank">
          <img class="footer_icon" src="../assets/github.png" alt="github" />
        </a>
        <a href="#">
          <img class="footer_icon" src="../assets/qq.png" alt="" />
        </a>
        <a href="#">
          <img class="footer_icon" src="../assets/微信.png" alt="" />
        </a>
      </div>
    </el-col>
  </el-row>

  <el-backtop :right="80" :bottom="100" :visibility-height="500" />
</template>

<style scoped>
.footer {
  background-color: #FFFFFF;
}

.left_container {
  display: flex;
  flex-direction: column;
}

.right_container {
  margin-top: 50px;
}

.right_container a {
  margin-right: 20px;
}
.version {
  margin-top: 20px;
  text-align: center;
}

.date {
  margin-top: 20px;
  margin-bottom: 10px;
  text-align: center;
}

.beian {
  text-align: center;
  margin-bottom: 30px;
}

.footer_icon {
  width: 40px;
  height: 40px;
}

.version .version_title {
  padding: 10px;
  font-size: 15px;
  background-color: #165dff;
  color: #fff;
  border-radius: 5px 0 0 5px;
}

.version .version_num {
  padding: 10px;
  font-size: 15px;
  background-color: #adb4c5;
  color: #fff;
  border-radius: 0 5px 5px 0;
}
</style>
