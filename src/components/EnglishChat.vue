<script setup>
import useDeviceInfo from "@/stores/deviceInfo";
import { storeToRefs } from "pinia";
import { ref, onMounted, computed } from "vue";

// // // // // // // // // // ↓ 状态管理 ↓ // // // // // // // // // //

const deviceInfoStore = useDeviceInfo();

const { isEnglishWebShowLeft, isEnglishButtonSmall } = storeToRefs(deviceInfoStore);

// // // // // // // // // // ↑ 状态管理 ↑ // // // // // // // // // //

// // // // // // // // // // ↓ 代码块 ↓ // // // // // // // // // //

const textareaRef = ref(null);

const handlerHeight = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = "auto"; // Reset height to auto to get the correct scroll height
    let height = textareaRef.value.scrollHeight;
    if (height > 100) {
      // Assuming 20px per row, 5 rows * 20px = 100px
      height = 100;
    }
    textareaRef.value.style.height = `${height}px`;
  }
};

const buttonSize = computed(() => {
  console.log("重新计算大小");
  console.log(isEnglishButtonSmall.value);
  if (isEnglishButtonSmall.value) {
    console.log("按钮小");
    return "middle";
  } else {
    console.log("按钮大");

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
      <div class="chat_area">
        <div class="title_area">
          <div class="title"><span>我是标题</span></div>
          <div class="right_icon">
            <span class="iconfont icon-caidan_"></span>
          </div>
        </div>

        <div class="message_area"></div>
        <div class="input_area">
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
  padding: 12px;

  background: none;
  outline: none;
  font-family: inherit;
  font-size: inherit;
  border: none;
  line-height: 28px;
  font-size: 20px;
  width: 90%;

  resize: none;
  min-height: 54px;
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
  height: 8%;
  font-size: 40px;
  text-align: center;
  padding: 5px;
  border-bottom: 1px solid rgb(14, 2, 2);
}

.left .middle {
  width: 100%;
  height: 72%;
  background-color: rgb(12, 229, 44);
  text-align: center;

  .content {
    display: inline-block;
    width: 100%;

    .function_item {
      font-size: 1.4em;
      width: 90%;
      height: 50px;
      line-height: 50px;
      margin: 15px 10px;
      border-radius: 10px;
      background-color: blueviolet;
    }

    .function_item:hover {
      border: 3px solid navajowhite;
    }
  }
}

.left .bottom {
  width: 100%;
  height: 20%;

  bottom: 0;
  background-color: rgb(229, 135, 12);
  text-align: left;
  .content {
    margin-left: 30px;
    display: inline-block;
    text-align: left;
  }
}

.left .bottom .content {
  div {
    margin: 15px 0;
    font-size: 18px;
    font-weight: 800;
  }

  span {
    margin-right: 15px;
  }
}

/* ↑ 左侧布局 ↑ */

/* ↓ 右侧布局 ↓ */

.right {
  flex-grow: 1;
  height: 100%;
  background-color: rgb(195, 133, 57);

  .chat_area {
    margin: 0 auto;
    height: 100%;
    max-width: 900px;
    background-color: rgb(106, 59, 59);
    position: relative;
  }
}

.chat_area .title_area {
  height: 7%;
  background-color: rgb(46, 122, 24);

  .title {
    font-size: 1.4em;
    vertical-align: bottom;
    text-align: center;
    display: inline-block;
    height: 100%;
    width: 90%;
    background-color: blueviolet;
  }

  .right_icon {
    vertical-align: bottom;
    text-align: center;

    display: inline-block;
    height: 100%;
    width: 10%;
    background-color: antiquewhite;

    span {
      font-size: 20px; /* 默认字体大小为20px */
    }

    @media screen and (min-width: 600px) {
      span {
        font-size: calc(
          20px + (25 - 20) * ((100vw - 600px) / (1200 - 600))
        ); /* 根据屏幕宽度调整字体大小 */
      }
    }
  }

  span {
    display: inline-block;
    position: relative;
    top: 50%;
    transform: translate(0, -50%);
  }
}

.chat_area .message_area {
  height: 93%;
  background-color: rgb(24, 122, 117);
}

.chat_area .input_area {
  bottom: 0px;
  position: absolute;
  width: 100%;
  background-color: rgb(42, 122, 24);
  text-align: center;

  .input_form {
    text-align: center;

    position: relative;
    margin: 0 auto;
    width: 90%;

    display: flex;
    justify-content: center;
    border-radius: 25px;

    background-color: blanchedalmond;
    .submit_buttom {
      margin: auto 10px;
      vertical-align: bottom;
    }
    .audio {
      vertical-align: bottom;

      font-size: 28px;
      margin: auto;
      color: rgb(100, 10, 10);
    }

    .audio:hover {
      color: rgb(12, 225, 225);
    }
  }

  .tip {
    color: red;
    padding: 0;
    padding: 8px;
  }
}

/* ↑ 右侧布局 ↑ */
</style>
