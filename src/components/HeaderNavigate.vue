<script setup>
import useDeviceInfo from "@/stores/deviceInfo.js";
import useUserInfo from "@/stores/userInfo";
import { storeToRefs } from "pinia";
import { logout } from "@/utils/logout";

// // // // // ↓ 状态管理 ↓ // // // // //

const deviceInfoStore = useDeviceInfo(); // 执行函数，拿到Store
const userInfoStore = useUserInfo(); // 执行函数，拿到Store

const { username, isLogin } = storeToRefs(userInfoStore); // 读取状态

// // // // // ↑ 状态管理 ↑ // // // // //

// // // // // // // // // // ↓ 昼夜主题切换（图标式） ↓ // // // // // // // // // //

// 单按钮在 light/dark 间切换；写回 store 后由 themePlugin 同步 <html> class 并持久化。
// 受保护特性：本切换驱动首页 Hero 昼/夜配图交叉淡入，逻辑链不可破坏。
const toggleTheme = () => {
  deviceInfoStore.theme = deviceInfoStore.theme === "dark" ? "light" : "dark";
};

// // // // // // // // // // ↑ 昼夜主题切换（图标式） ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 登录功能 ↓ // // // // // // // // // //

// // // // // // // // // // ↑ 登录功能 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 登录状态下，顶栏右侧菜单栏的处理 ↓ // // // // // // // // // //

const handleCommand = async (command) => {
  if (command === "logout") {
    await logout();
  }
};

// // // // // // // // // // ↑ 登录状态下，右侧菜单栏的处理 ↑ // // // // // // // // // //
</script>

<template>
  <el-row
    class="nav_container"
    :class="{ nav_background: deviceInfoStore.isShowNavBackground }"
  >
    <el-col span="12" class="nav_left">
      <router-link to="/home" class="text_logo brand">
        <span class="seal">思</span>
        <span class="text">思维兵工厂</span>
      </router-link>

      <router-link to="/home" class="nav-link">首页</router-link>
      <router-link to="/about" class="nav-link">关于</router-link>
      <router-link to="/ai_english" class="nav-link">英语自习室</router-link>
      <router-link to="/web_site" class="nav-link">好站收藏</router-link>
      <router-link to="/article/1231" class="nav-link">官方文档</router-link>
    </el-col>

    <el-col span="12" class="nav_right">
      <div class="theme">
        <!-- 昼/夜切换：内联 SVG 图标式（方向A·子曰·墨），点击在明暗间切换 -->
        <button
          class="theme-toggle"
          type="button"
          :aria-label="deviceInfoStore.theme === 'dark' ? '切换到白天' : '切换到夜晚'"
          :title="deviceInfoStore.theme === 'dark' ? '切换到白天' : '切换到夜晚'"
          @click="toggleTheme"
        >
          <!-- 太阳：当前为白天，点击进入夜晚 -->
          <svg
            v-if="deviceInfoStore.theme !== 'dark'"
            class="theme-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
          >
            <circle cx="12" cy="12" r="4.2" />
            <path
              d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"
            />
          </svg>
          <!-- 月亮：当前为夜晚，点击回到白天 -->
          <svg
            v-else
            class="theme-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" />
          </svg>
        </button>
      </div>

      <div class="not_login" v-if="!isLogin">
        <el-button
          round
          size="large"
          class="login_button button"
          @click="deviceInfoStore.isShowLoginDialog = true"
        >
          登录
        </el-button>

        <el-button
          round
          size="large"
          class="register_button button"
          @click="deviceInfoStore.isShowRegisterDialog = true"
        >
          注册
        </el-button>
      </div>

      <div class="has_login" v-if="isLogin">
        <div class="greeting">
          <el-text type="success" size="large">欢迎您 {{ username }}</el-text>
        </div>

        <el-dropdown @command="handleCommand">
          <el-avatar src="/elem/0/88/03b0d39583f48206768a7534e55bcpng.png"> </el-avatar>

          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                ><el-icon><UserFilled /></el-icon><span>个人中心</span></el-dropdown-item
              >
              <el-dropdown-item
                ><el-icon><Bell /></el-icon><span>我的消息</span></el-dropdown-item
              >
              <el-dropdown-item
                ><el-icon><Share /></el-icon><span>邀请码</span></el-dropdown-item
              >

              <el-dropdown-item divided command="logout"
                ><el-icon><Promotion /></el-icon><span>退出登录</span></el-dropdown-item
              >
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped>
/* ↓ 导航栏右侧 ↓ */

.has_login {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.greeting {
  display: inline-block;
  margin-right: 20px;
}

/* ↑ 导航栏右侧 ↑ */

.nav_container {
  top: 0;
  width: 100%;
  position: fixed;
  transition: all 0.3s;
  z-index: 999;
}

.nav_container a {
  line-height: 60px;
  margin-right: 30px;
  font-size: 16px;
  text-decoration: none;
  cursor: pointer;
}

.nav_background {
  background-color: var(--header_background, #ffffff);
  opacity: 0.9;
}

.nav_left {
  color: var(--header_font);
  margin: 0 auto;
  line-height: 60px;
}

/* 站名：朱砂方印 + 宋体字标（方向A·子曰·墨，呼应 favicon「思」印） */
.nav_left .brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  margin-left: 20px;
  margin-right: 44px;
  font-family: var(--font-display, "Noto Serif SC", serif);
  font-weight: 900;
  font-size: 23px;
  letter-spacing: 0.08em;
  color: var(--header_font, var(--color-text-primary));
}

.nav_left .brand .seal {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 5px;
  background: var(--color-primary);
  color: #fbf7ef;
  font-family: var(--font-display, "Noto Serif SC", serif);
  font-weight: 700;
  font-size: 19px;
  line-height: 1;
  letter-spacing: 0;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
}

/* 主导航链接：柔墨色 + 朱砂下划线从中间生长（对齐原型） */
.nav_left .nav-link {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  line-height: 1.4;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: color 0.25s ease;
}

.nav_left .nav-link:hover,
.nav_left .nav-link.router-link-active {
  color: var(--color-text-primary);
}

.nav_left .nav-link::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: -4px;
  height: 2px;
  background: var(--color-primary);
  transform: scaleX(0);
  transform-origin: center;
  transition: transform 0.28s ease;
}

.nav_left .nav-link:hover::after,
.nav_left .nav-link.router-link-active::after {
  transform: scaleX(1);
}

@keyframes showup {
  from {
    letter-spacing: -50px;
    filter: blur(10px);
  }

  to {
    letter-spacing: 10px;
    filter: blur(0px);
  }
}

.nav_left .text_logo .text {
  animation: showup 3s forwards;
}

.nav_right {
  margin: auto;
  text-align: center;
  right: 0;
  display: flex;
  justify-content: end;
}

.nav_right .theme {
  display: flex;
  align-items: center;
  margin-right: 28px;
  height: 60px;
}

/* 图标式昼夜切换按钮（对齐原型：方框 + hover 朱砂描边） */
.theme-toggle {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
  background: color-mix(in srgb, var(--color-bg-elevated) 75%, transparent);
  color: var(--header_font, var(--color-text-primary));
  cursor: pointer;
  transition: border-color 0.25s ease, color 0.25s ease, background-color 0.25s ease;
}

.theme-toggle:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.theme-toggle .theme-icon {
  width: 19px;
  height: 19px;
  display: block;
}

.button {
  margin-top: 10px;
  margin-right: 10px;
  font-size: 15px;
}

/* 登录：朱砂主操作 */
.login_button.el-button {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.login_button.el-button:hover,
.login_button.el-button:focus {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  color: var(--color-text-inverse);
}

/* 注册：描边次操作 */
.register_button.el-button {
  background-color: transparent;
  border-color: var(--color-border-default);
  color: var(--color-text-primary);
}

.register_button.el-button:hover,
.register_button.el-button:focus {
  background-color: var(--color-primary-subtle);
  border-color: var(--color-primary);
  color: var(--color-primary);
}
</style>
