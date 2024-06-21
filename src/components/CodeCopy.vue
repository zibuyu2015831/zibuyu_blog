//CodeCopy.vue
<template>
  <div class="copy-content">
    <!-- 复制按钮 -->
    <div
      class="copy-btn code-data-copy"
      @click="copyMessage"
      data-clipboard-action="copy"
      :data-clipboard-text="code"
    >
      <i class="el-icon-document-copy myicon"></i>
    </div>
    <div v-if="success" class="copy-success-text">copied!</div>
  </div>
</template>

<script>
import clipboard from "clipboard"; 
export default {
  data() {
    return {
      code: null,
      success: false,
    };
  },
  methods: {
    copyMessage(value) {
      let _this = this;
      _this.success = false;
      let clipboard = new this.clipboard(".code-data-copy");
      clipboard.on("success", function (e) {
        //    this.$message.error("提問不能為空");
        _this.success = true;
        // setTimeout(() => {
        //   _this.success = false
        // }, 300)
        clipboard.destroy(); // 销毁,避免多次点击重复出现
      });
      clipboard.on("error", function () {
        _this.$message.error("複製失敗");
      });
    },
  },
};
</script>

<style lang="less" scoped>
.copy-content {
  height: 0px;
}
.icon {
  width: 0.8rem;
  height: 0.8rem;
  fill: rgb(231, 32, 32);
}
.myicon {
  font-size: 14px;
   color: #c0c4cc;
  &:hover {
    color: black;
  }
}
.copy-btn {
  user-select: none;
  opacity: 1;
  position: absolute;
  right: 0px;
  top: 0px;
  cursor: pointer;
  border-radius: 3px;
  transition: 0.3s;
  background: rgba(255, 255, 255, 0.2);
  &:active {
    background: rgba(253, 253, 253, 0.575);
  }
}
.copy-success-text {
  font-family: "微软雅黑";
  color: green;
  position: absolute;
  font-size: 12px;
  top: 2px;
  right: 18px;
  font-weight: 500;
  animation: successCopy 0.6s ease both 1;
}

</style>

