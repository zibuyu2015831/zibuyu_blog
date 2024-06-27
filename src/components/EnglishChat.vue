<script setup>
import useDeviceInfo from "@/stores/deviceInfo";
import { storeToRefs } from "pinia";
import { ref, onMounted, computed, onBeforeUpdate } from "vue";

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

const deviceInfoStore = useDeviceInfo();

const { isEnglishWebShowLeft, isEnglishButtonSmall } = storeToRefs(deviceInfoStore);

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

const chatAreaRef = ref(null);

const titleAreaRef = ref(null); // 标题行高度
const messageAreaRef = ref(null); // 消息栏高度
const inputAreaRef = ref(null); // 输入区域高度

const textareaRef = ref(null); // 文本输入框高度

const handlerHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = "auto"; // Reset height to auto to get the correct scroll height
    let height = textareaRef.value.scrollHeight;
    if (height > 100) {
      height = 100;
    }
    textareaRef.value.style.height = `${height}px`;

    inputAreaRef.value.style.height = `${height + 20}px`;

    resetMessageAreaHeight();
  }
};

function resetMessageAreaHeight() {
  if (inputAreaRef.value && titleAreaRef.value) {
    let inputHeight = inputAreaRef.value.offsetHeight;
    let titleHeight = titleAreaRef.value.offsetHeight;

    const height = deviceInfoStore.userScreenHeight - inputHeight - titleHeight;

    messageAreaRef.value.style.height = `${height}px`;
    messageAreaRef.value.style.top = `${titleAreaRef.value.offsetHeight}px`;
    inputAreaRef.value.style.width = `${chatAreaRef.value.offsetWidth}px`;
    titleAreaRef.value.style.width = `${chatAreaRef.value.offsetWidth}px`;
  }
}

onMounted(() => {
  resetMessageAreaHeight();
});

onBeforeUpdate(() => {
  resetMessageAreaHeight();
});

const buttonSize = computed(() => {
  if (isEnglishButtonSmall.value) {
    return "middle";
  } else {
    return "large";
  }
});

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //
</script>

<template>
  <div class="page" :style="{ height: deviceInfoStore.userScreenHeight + 'px' }">
    <div class="left" v-if="isEnglishWebShowLeft">
      <div class="top"><span>思维兵工厂</span></div>

      <div class="middle">
        <div class="content">
          <div class="function_item">口语陪练</div>
          <div class="function_item">作文批改</div>
          <div class="function_item">百科问答</div>
        </div>
      </div>

      <div class="bottom">
        <div class="content">
          <div>
            <span class="icon-user iconfont"></span>
            <span>个人中心</span>
          </div>
          <div>
            <span class="icon-chess-one iconfont"></span>

            <span>前往博客</span>
          </div>
          <div>
            <span class="icon-link iconfont"></span>

            <span>来个打赏</span>
          </div>
        </div>
      </div>
    </div>

    <div class="right">
      <div class="chat_area" ref="chatAreaRef">
        <div class="title_area" ref="titleAreaRef">
          <div class="title">
            <span>我是标题</span>
          </div>
          <div class="right_icon">
            <span class="iconfont icon-caidan_"></span>
          </div>
        </div>

        <div class="message_area" ref="messageAreaRef">
          <div class="react_content_user">
            <div>用户发送的内容：你是谁</div>
          </div>

          <div class="react_content_system">
            <div>系统发送的内容：我是英语外教</div>
          </div>

          <div class="react_content_user">
            <div>
              用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：
            </div>
          </div>

          <div class="react_content_system">
            <div>
              系统发送的内容：我是英语外教系统发送的内容：我是英语外教系统发送的内容：我是英语外教系统发送的内容：我是英语外教
            </div>
          </div>

          <div class="react_content_user">
            <div>用户发送的内容：你是谁</div>
          </div>

          <div class="react_content_system">
            <div>系统发送的内容：我是英语外教</div>
          </div>

          <div class="react_content_user">
            <div>
              用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：
            </div>
          </div>

          <div class="react_content_system">
            <div>
              系统发送的内容：我是英语外教系统发送的内容：我是英语外教系统发送的内容：我是英语外教系统发送的内容：我是英语外教
            </div>
          </div>
          <div class="react_content_user">
            <div>
              用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：
            </div>
          </div>

          <div class="react_content_system">
            <div>
              系统发送的内容：我是英语外教系统发送的内容：我是英语外教系统发送的内容：我是英语外教系统发送的内容：我是英语外教
            </div>
          </div>
          <div class="react_content_user">
            <div>
              用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：
            </div>
          </div>

          <div class="react_content_system">
            <div>
              系统发送的内容：我是英语外教系统发送的内容：我是英语外教系统发送的内容：我是英语外教系统发送的内容：我是英语外教
            </div>
          </div>
          <div class="react_content_user">
            <div>
              用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：用户发送的内容：
            </div>
          </div>

          <div class="react_content_system">
            <div>
              系统发送的内容：我是英语外教系统发送的内容：我是英语外教系统发送的内容：我是英语外教系统发送的内容：我是英语外教
            </div>
          </div>
        </div>

        <div class="input_area" ref="inputAreaRef">
          <form action="" class="input_form">
            <textarea
              name=""
              id=""
              rows="1"
              ref="textareaRef"
              @input="handlerHeight"
              placeholder="请输入问题"
              autofocus
            ></textarea>
            <span class="iconfont icon-deshengyinvoice21 audio"></span>
            <el-button type="success" round class="submit_buttom" :size="buttonSize"
              >发 送</el-button
            >
          </form>
          <div class="tip">交互内容由AI生成，请注意鉴别</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 重置表单元素的默认样式 */
textarea {
  margin: 0;
  padding: 12px 15px;

  background: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  border: none;
  line-height: 28px;
  min-width: 52px;
  font-size: clamp(16px, 2vh, 22px);
  width: 85%;
  resize: none;
  vertical-align: bottom;
  display: inline-block;
}

/* ↓ 整体布局 ↓ */

.page {
  background-color: aliceblue;
  display: flex;
}

.left,
.right {
  vertical-align: top;
}

/* ↑ 整体布局 ↑ */

/* ↓ 左侧布局 ↓ */

.left {
  width: 280px;
  height: 100%;
  background-color: antiquewhite;
  border: 1px solid red;
  display: flex;
  flex-direction: column;
}

.left .top {
  width: 100%;
  height: 8vh;
  font-size: 4vh;
  text-align: center;

  border-bottom: 1px solid rgb(14, 2, 2);

  span {
    line-height: 8vh;
  }
}

.left .middle {
  width: 100%;
  height: 70vh;
  background-color: rgb(12, 229, 44);
  text-align: center;
}

.left .middle .content {
  display: inline-block;
  width: 100%;
}

.left .middle .content .function_item {
  font-size: clamp(16px, 2.5vh, 22px);
  width: 90%;
  height: 50px;
  line-height: 50px;
  margin: 0.9vh 10px;
  border-radius: 10px;
  background-color: blueviolet;
}

.left .middle .content .function_item:hover {
  border: 3px solid navajowhite;
}


.left .bottom {
  width: 100%;
  height: 22vh;

  bottom: 0;
  background-color: rgb(229, 135, 12);
  text-align: left;
}

.left .bottom .content {
  margin-top: 2vh;
  margin-left: 30px;
  display: inline-block;
  text-align: left;
}


.left .bottom .content div {
  margin: 0.9vh 0;
  font-size: clamp(16px, 2vh, 22px);
  font-weight: 800;
}

.left .bottom .content span {
  margin-right: 15px;
}

/* ↑ 左侧布局 ↑ */

/* ↓ 右侧布局 ↓ */

.right {
  flex-grow: 1;
  height: 100%;
  background-color: rgb(195, 133, 57);
}

.right .chat_area {
  margin: 0 auto;
  height: 100%;
  max-width: 900px;
  background-color: rgb(106, 59, 59);
  position: relative;
}

.chat_area .title_area {
  height: 6vh;

  background-color: rgb(46, 122, 24);
  position: fixed;
  top: 0;
  z-index: 999;
}

.chat_area .title_area .right_icon {
  vertical-align: bottom;
  text-align: center;

  display: inline-block;
  height: 6vh;
  width: 15%;
  background-color: antiquewhite;


}

.chat_area .title_area .right_icon span {
  line-height: 6vh;
  font-size: clamp(20px, 4vw, 30px); /* 默认字体大小为20px */
}

.chat_area .title_area .title {
  font-size: clamp(18px, 1.4vw, 24px);
  line-height: 6vh;
  vertical-align: bottom;
  text-align: center;
  display: inline-block;
  height: 6vh;
  width: 85%;
  background-color: blueviolet;
}

.chat_area .message_area {
  position: relative;
  background-color: rgb(24, 122, 117);
  overflow-y: auto; /* 根据内容溢出自动显示滚动条 */
  margin: 0;
}

.react_content_system {
  max-width: 65%;
  padding: 10px;
  margin-bottom: 10px;
  margin-left: 50px;

  float: left;
  clear: both;
  position: relative;
  background-color: rgb(195, 224, 9);
}

.react_content_system::before {
  content: "";
  position: absolute;
  background-image: url("@/assets/image/ai_avatar.png");
  height: 35px;
  width: 35px;
  background-size: cover; /* 或者使用 contain */

  left: -45px;
  top: 5px;
}

.react_content_user {
  max-width: 65%;

  padding: 10px;
  margin-right: 50px;
  margin-bottom: 10px;

  float: right;
  clear: both;
  position: relative;

  background-color: rgb(255, 85, 0);
}

.react_content_user:after {
  content: "";
  position: absolute;
  background-image: url("@/assets/image/user_avatar.png");
  height: 35px;
  width: 35px;
  background-size: cover; /* 或者使用 contain */

  right: -40px;
  top: 10px;
}

.chat_area .input_area {
  position: fixed;
  bottom: 0;
  z-index: 999;

  width: 40vw;
  height: 72px;
  background-color: rgb(42, 122, 24);
  text-align: center;

}

.chat_area .input_area .tip {
  font-size: 14px;
  height: 20px;
  color: red;
  padding: 0;
  line-height: 20px;
}

.chat_area .input_area .input_form {
  text-align: center;

  position: relative;
  margin: 0 auto;
  width: 90%;

  display: flex;
  justify-content: center;
  border-radius: 25px;

  background-color: blanchedalmond;

}

.chat_area .input_area .input_form  .submit_buttom {
  margin: auto 10px;
  vertical-align: bottom;
}
.chat_area .input_area .input_form  .audio {
  vertical-align: bottom;

  font-size: 28px;
  margin: auto;
  color: rgb(100, 10, 10);
}

.chat_area .input_area .input_form  .audio:hover {
  color: rgb(12, 225, 225);
}

/* ↑ 右侧布局 ↑ */
</style>
