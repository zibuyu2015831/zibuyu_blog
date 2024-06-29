<script setup>
import { ref, defineProps } from "vue";
import useDeviceInfo from "@/stores/deviceInfo";

// // // // // // // // // // ↓ 读取状态 ↓ // // // // // // // // // //

const deviceInfoStore = useDeviceInfo();

// 切换主题颜色
function changeTheme(theme) {
  deviceInfoStore.theme = theme;
}

// // // // // // // // // // ↑ 读取状态 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 组件属性定义 ↓ // // // // // // // // // //

const props = defineProps({
  title: {
    type: String,
    default: "",
  },

  size: {
    type: String,
    default: "50%",
  },

  iconSize: {
    type: Number,
    default: 16,
  },

  direction: {
    type: String,
    default: "ttb",
  },
});

const withHeater = ref(false);

// 检查是否传入了标题
if (props.title) {
  withHeater.value = true;
}

// 检查是否正确传入了方向
const directions = ["rtl", "ltr", "ttb", "btt"];
if (!directions.includes(props.direction)) {
  props.direction = "ttb";
}

// 计算图标大小
const iconSize = props.iconSize || 16;

// // // // // // // // // // ↑ 组件属性定义 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

// 下拉框是否出现
const drawer = ref(false);

// 打赏提示框是否出现
const userRewardDialogVisible = ref(false);

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //
</script>

<template>
  <span class="iconfont icon-daohang menu_icon" @click="drawer = true"></span>

  <el-drawer
    v-model="drawer"
    :with-header="withHeater"
    :size="props.size"
    :direction="props.direction"
  >
    <template #header>
      <h2>{{ title }}</h2>
    </template>

    <template #default>
      <div class="nav">
        <div class="menu">
          <div class="menu_item">
            <span class="icon-user iconfont"></span>
            <span>个人中心</span>
          </div>

          <div class="menu_item">
            <span class="icon-chess-one iconfont"></span>
            <router-link to="/home">
              <span>前往博客</span>
            </router-link>
          </div>

          <div class="menu_item" @click="userRewardDialogVisible = true">
            <span class="icon-link iconfont"></span>

            <span>打赏作者</span>
          </div>

          <div
            v-if="deviceInfoStore.webTheme === 'light'"
            @click="changeTheme('dark')"
            class="menu_item"
          >
            <span class="icon-night iconfont"></span>

            <span>深色主题</span>
          </div>

          <div
            v-if="deviceInfoStore.webTheme === 'dark'"
            @click="changeTheme('light')"
            class="menu_item"
          >
            <span class="icon-daytime-mode iconfont"></span>

            <span>浅色主题</span>
          </div>
        </div>

        <el-dialog v-model="userRewardDialogVisible" title="谢谢您的喜欢~" width="500">
          <div class="card_item">
            <div class="block">
              <img clsaa="card_img" src="@/assets/image/reward_code_wechat.jpg" />
              <div class="card_img_title">微信</div>
            </div>
            <div class="block">
              <img clsaa="card_img" src="@/assets/image/reward_code_alipay.jpg" />
              <div class="card_img_title">支付宝</div>
            </div>
          </div>
        </el-dialog>
      </div>
    </template>
  </el-drawer>
</template>

<style scoped>
/* ↓ 菜单项目样式 ↓ */

.menu {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.menu_item {
  width: 50vw;
  text-align: center;
  margin: 0 0 clamp(10px, 1.3vh, 25px);
  padding: 5px;
  font-size: clamp(18px, 3.5vh, 35px);
  font-weight: 400;
  border-radius: 20px;
  cursor: pointer;
}

.menu_item:hover {
  background-color: var(--menu_button_activate_bg);
}

.menu span.iconfont {
  font-size: clamp(18px, 3vh, 20px);
  margin-right: 15px;
}

/* ↑ 菜单项目样式 ↑ */

/* ↓ 菜单图标样式 ↓ */

.menu_icon {
  color: var(--english_top_menu_icon);
  font-size: calc(v-bind(iconSize) * 1px);
}

/* ↑ 菜单图标样式 ↑ */

/* ↓ 弹出框中图片样式 ↓ */
.card_item {
  display: flex;
  justify-content: space-around;
}

.card_item .block {
  margin: 5px 30px;
  display: inline-block;
  text-align: center;
}

.card_item img {
  width: 120px;
  height: 120px;
}

/* ↑ 弹出框中图片样式 ↑ */
</style>
