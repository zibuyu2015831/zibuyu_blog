<script setup>
import { ref } from "vue";
import { calculateTime } from "@/utils/handle_date";
import { storeToRefs } from "pinia";
import useDeviceInfo from "@/stores/deviceInfo";

// // // // // // // // // // ↓ 测试代码 ↓ // // // // // // // // // //



// // // // // // // // // // ↑ 测试代码 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 运行时间计算 ↓ // // // // // // // // // //

const createTimeStamp = "1718804766";
let timeString = ref("");
setInterval(() => {
  timeString.value = calculateTime(createTimeStamp);
}, 1000);

// // // // // // // // // // ↑ 运行时间计算 ↑ // // // // // // // // // //
</script>

<template>
  <el-row class="footer" justify="center">
    <el-col class="left_container" span="8">
      <div class="version">
        <span class="version_title">version </span>
        <span class="version_num">1.0.0</span>
      </div>

      <div class="date">
        <span class="site_running_date">网站已运行: &nbsp; {{ timeString }}</span>
      </div>

      <div class="beian">
        <img src="../assets/image/beian.png" alt="备案" />
        <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank">
          备案号 暂无
        </a>
      </div>
    </el-col>

    <el-col class="right_container" span="8">
      <a href="#" target="_blank">
        <img class="footer_icon" src="../assets/image/bilibili.png" alt="哔哩哔哩" />
      </a>
      <a href="#" target="_blank">
        <img class="footer_icon" src="../assets/image/gitee.png" alt="gitee" />
      </a>
      <a href="#" target="_blank">
        <img class="footer_icon" src="../assets/image/github.png" alt="github" />
      </a>
      <a href="#">
        <img class="footer_icon" src="../assets/image/qq.png" alt="" />
      </a>
      <a href="#">
        <img class="footer_icon" src="../assets/image/wechat.png" alt="" />
      </a>
    </el-col>
  </el-row>

  <el-backtop :right="80" :bottom="100" :visibility-height="500" />
</template>

<style scoped>
.footer {
  background-color: var(--footer-background,#ffffff);
}

.left_container {
  display: flex;
  flex-direction: column;
}

.right_container {
  top: 0;
  bottom: 0;
  margin: auto 0px;
  margin-left: 100px;
}

.right_container a {
  margin-right: 20px;
}
.version {
  margin-top: 30px;
  text-align: center;
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
</style>
