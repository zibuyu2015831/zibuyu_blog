<script setup>
import { onMounted, onBeforeUnmount, ref, computed, reactive,onBeforeMount } from "vue";


// // // // // // // // // // ↓ 测试代码 ↓ // // // // // // // // // //



// // // // // // // // // // ↑ 测试代码 ↑ // // // // // // // // // //



// // // // // // // // // // ↓ 监听页面下滑，更改导航栏背景色 ↓ // // // // // // // // // //

const scrollTop = ref(0);

const backgroundColor = computed(() => {
  return scrollTop.value > 210 ? "#FFFFFF" : "transparent";
});

const TextColor = computed(() => {
  return scrollTop.value > 210 ? "black" : "white";
});

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});

function handleScroll() {
  scrollTop.value = window.pageYOffset || document.documentElement.scrollTop;
}

// // // // // // // // // // ↑ 监听页面下滑，更改导航栏背景色 ↑ // // // // // // // // // //



// // // // // // // // // // ↓ 注册功能 ↓ // // // // // // // // // //

const registerDialogVisible = ref(false); // 注册跳出框

const registerInfo = reactive({
  username: "",
  password: "",
  registerCode: "",
});

function cancelRegister() {
  registerDialogVisible.value = false;
}

function commitRegister() {
  registerDialogVisible.value = false;
}

// // // // // // // // // // ↑ 注册功能 ↑ // // // // // // // // // //



// // // // // // // // // // ↓ 登录功能 ↓ // // // // // // // // // //


const loginDialogVisible = ref(false); // 登录跳出框

const loginInfo = reactive({
  username: "",
  password: "",
});

// 取消登录
function cancelLogin() {
  loginDialogVisible.value = false;
}

function commitLogin() {
  loginDialogVisible.value = false;
}

// // // // // // // // // // ↑ 登录功能 ↑ // // // // // // // // // //



</script>

<template>
  <el-row>
    <el-col :span="24" class="blog_header">
      <div class="nav_container" :style="{ backgroundColor: backgroundColor }">
        <div class="header_nav">
          <div class="nav_left" :style="{ color: TextColor }">
            <router-link to="/home" class="text_logo">子不语博客</router-link>
            <router-link to="/home">首页</router-link>
            <router-link to="/about">关于</router-link>
            <router-link to="/test">测试</router-link>
            <router-link to="/article/1231">官方文档</router-link>
          </div>

          <div class="nav_right" :style="{ color: TextColor }">
            <el-button
              type="warning"
              round
              size="large"
              class="login_button button"
              @click="loginDialogVisible = true"
            >
              登录
            </el-button>

            <el-button
              type="info"
              round
              size="large"
              class="register_button button"
              @click="registerDialogVisible = true"
            >
              注册
            </el-button>
          </div>
        </div>
      </div>

      <img class="header_img" src="../assets/header.jpg" alt="" />
    </el-col>
  </el-row>

  <el-dialog v-model="loginDialogVisible" width="500">
    <el-form
      :label-position="'top'"
      label-width="auto"
      :model="loginInfo"
      style="max-width: 600px"
    >
      <el-form-item label="用户名">
        <el-input v-model="loginInfo.username" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="loginInfo.password" type="password" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelLogin">取消</el-button>
        <el-button type="primary" @click="commitLogin"> 登录 </el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog v-model="registerDialogVisible" width="500">
    <el-form
      :label-position="'top'"
      label-width="auto"
      :model="loginInfo"
      style="max-width: 600px"
    >
      <el-form-item label="用户名">
        <el-input v-model="registerInfo.username" />
      </el-form-item>

      <el-form-item label="密码">
        <el-input v-model="registerInfo.password" type="password" />
      </el-form-item>

      <el-form-item label="再次输入密码">
        <el-input v-model="registerInfo.password" type="password" />
      </el-form-item>

      <el-form-item label="邀请码">
        <el-input
          v-model="registerInfo.registerCode"
          placeholder="关注公众号【思维兵工厂】，回复“邀请码”"
        />
      </el-form-item>

      <div class="card_item">
        <div class="block">
          <img
            clsaa="card_img"
            src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"
          />
          <div class="card_img_title">扫码关注，获取邀请码</div>
        </div>
      </div>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="cancelRegister">取消</el-button>
        <el-button type="primary" @click="commitRegister"> 注册 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>

.card_item {
  margin: 5px 30px;
  text-align: center;
}

.card_item img {
  display: inline-block;
  width: 100px;
  height: 100px;
}

.card_item .card_img_title{
  margin-top: 10px;
}

.blog_header {
  max-height: 650px;
  width: 100%;
}

.blog_header .header_img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nav_container {
  width: 100%;
  top: 0;
  position: fixed;
  transition: all 0.3s;
  z-index: 100;
}

.header_nav {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  width: 1200px;
  height: 60px;

  a {
    all: unset;
    line-height: 60px;
    margin-right: 30px;
    font-size: 16px;
    text-decoration: none;
    cursor: pointer;
  }
}

.nav_left {
  color: aliceblue;
  left: 0;
  line-height: 60px;
  height: 60px;

  .text_logo {
    font-size: 25px;
    display: inline-block;
    margin-right: 50px;
  }
}

.nav_middle {
  text-align: center;
  height: 60px;
}

.nav_right {
  text-align: center;
  right: 0;
  width: 200px;
  height: 60px;
  display: flex;
  justify-content: end;
}

.button {
  margin-top: 10px;
  margin-right: 10px;
  font-size: 15px;
}

.button:hover {
  color: black;
}
</style>
