<script setup>
import { ref } from "vue";

defineOptions({ name: "MyInfo" });

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

// 头像与社交方框图标（与页脚 / 阅读页作者卡同款本地资源）
const userAvatar = new URL("../assets/image/user_avatar.png", import.meta.url).href;
const authorSocials = [
  { name: "GitHub", href: "#", icon: new URL("../assets/image/github.png", import.meta.url).href },
  { name: "Gitee", href: "https://gitee.com/zibuyu2015831", icon: new URL("../assets/image/gitee.png", import.meta.url).href },
  { name: "哔哩哔哩", href: "#", icon: new URL("../assets/image/bilibili.png", import.meta.url).href },
];

// 二维码默认收纳，点击「扫码联系」展开——保留真实联系资产但不抢视觉
const contacts = [
  { label: "个人微信", img: new URL("../assets/image/personal_wechat.png", import.meta.url).href },
  { label: "公众号", img: new URL("../assets/image/official_wechat.jpg", import.meta.url).href },
];
const showQr = ref(false);

// // // // // // // // // // ↑ 代码块 ↑ // // // // // // // // // //
</script>

<template>
  <el-card :style="{ 'max-width': cardWidth }" class="card author-card">
    <div class="author-avatar-wrap">
      <img class="author-avatar" :src="userAvatar" alt="子不语的头像" />
      <span class="author-seal">子</span>
    </div>
    <p class="author-name">子不语</p>
    <p class="author-bio">写代码，也写字。<br />全栈开发 / AI / 偶尔读点旧书，现居广州。</p>

    <div class="author-links">
      <a
        v-for="s in authorSocials"
        :key="s.name"
        :href="s.href"
        :aria-label="s.name"
        target="_blank"
        rel="noopener"
      >
        <img :src="s.icon" :alt="s.name" />
      </a>
    </div>

    <!-- 扫码联系：默认折叠 -->
    <button
      type="button"
      class="qr-toggle"
      :aria-expanded="showQr"
      @click="showQr = !showQr"
    >
      扫码联系<span class="qr-caret" :class="{ 'is-open': showQr }">›</span>
    </button>

    <el-collapse-transition>
      <div v-show="showQr" class="qr-panel">
        <div v-for="c in contacts" :key="c.label" class="qr-item">
          <img class="qr-img" :src="c.img" :alt="c.label" />
          <span class="qr-label">{{ c.label }}</span>
        </div>
      </div>
    </el-collapse-transition>
  </el-card>
</template>

<style scoped>
/* ↓ 作者卡：对齐原型 .author-card 与阅读页侧栏作者卡，站内一致 ↓ */
/* 静止内容卡：悬浮仅柔和浮起一层阴影，不缩放不位移（去假可点暗示） */
.card {
  transition: box-shadow var(--motion-normal) var(--ease-standard);
}

.card:hover {
  box-shadow: var(--shadow-md);
}

.author-card {
  text-align: center;
}

.author-avatar-wrap {
  position: relative;
  width: 72px;
  height: 72px;
  margin: 6px auto 14px;
}

.author-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border-default);
  background: var(--color-bg-subtle);
}

/* 朱砂作者印：右下角小方印 */
.author-seal {
  position: absolute;
  right: -2px;
  bottom: -2px;
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: var(--color-primary);
  color: #fbf7ef;
  font-family: var(--font-display, "Noto Serif SC", serif);
  font-weight: 700;
  font-size: 13px;
  line-height: 1;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.author-name {
  margin: 0 0 8px;
  font-family: var(--font-display, "Noto Serif SC", serif);
  font-weight: 700;
  font-size: 19px;
  letter-spacing: 0.06em;
  color: var(--color-text-primary);
}

.author-bio {
  margin: 0;
  font-size: 13px;
  line-height: 1.74;
  color: var(--color-text-secondary);
  text-wrap: pretty;
}

/* 社交方框图标行（与页脚 / 阅读页同款） */
.author-links {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 16px;
}

.author-links a {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
  transition: border-color 0.22s ease, transform 0.22s ease;
}

.author-links a:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.author-links img {
  width: 17px;
  height: 17px;
  object-fit: contain;
}

:global(html.dark) .author-links a {
  background: rgba(255, 255, 255, 0.06);
}

/* 扫码联系：朱砂文字按钮 */
.qr-toggle {
  margin-top: 18px;
  padding: 4px 8px;
  border: none;
  background: transparent;
  font-family: inherit;
  font-size: var(--font-size-sm);
  letter-spacing: 0.04em;
  color: var(--color-primary);
  cursor: pointer;
  transition: color var(--motion-fast) var(--ease-standard);
}

.qr-toggle:hover {
  color: var(--color-primary-hover);
}

.qr-caret {
  display: inline-block;
  margin-left: 4px;
  transition: transform var(--motion-normal) var(--ease-standard);
}

.qr-caret.is-open {
  transform: rotate(90deg);
}

.qr-panel {
  display: flex;
  justify-content: center;
  gap: var(--space-6);
  margin-top: 14px;
}

.qr-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.qr-img {
  width: 96px;
  height: 96px;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary-subtle);
  object-fit: cover;
}

.qr-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}
/* ↑ 作者卡 ↑ */
</style>
