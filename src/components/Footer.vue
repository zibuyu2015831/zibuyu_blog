<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { calculateTime } from "@/utils/handle_date";

defineOptions({ name: "AppFooter" });

// // // // // // // // // // ↓ 运行时间计算 ↓ // // // // // // // // // //

const createTimeStamp = "1718804766";
let timeString = ref("");

// 运行时长计时器：保存 id 并在卸载时清理，避免内存泄漏（#05）
let runtimeTimer = null;
onMounted(() => {
  timeString.value = calculateTime(createTimeStamp); // 立即渲染一次，避免首帧空白
  runtimeTimer = setInterval(() => {
    timeString.value = calculateTime(createTimeStamp);
  }, 1000);
});

onBeforeUnmount(() => {
  if (runtimeTimer) clearInterval(runtimeTimer);
});

// // // // // // // // // // ↑ 运行时间计算 ↑ // // // // // // // // // //

// 社交链接（保留真实链接，统一为带框图标处理，对齐原型）
const socials = [
  { name: "哔哩哔哩", href: "#", icon: new URL("../assets/image/bilibili.png", import.meta.url).href },
  { name: "Gitee", href: "https://gitee.com/zibuyu2015831", icon: new URL("../assets/image/gitee.png", import.meta.url).href },
  { name: "GitHub", href: "#", icon: new URL("../assets/image/github.png", import.meta.url).href },
  { name: "QQ", href: "#", icon: new URL("../assets/image/qq.png", import.meta.url).href },
  { name: "微信", href: "#", icon: new URL("../assets/image/wechat.png", import.meta.url).href },
];
const beianIcon = new URL("../assets/image/beian.png", import.meta.url).href;
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <!-- 站标：朱砂方印「思」+ 宋体字标（呼应顶栏与 favicon） -->
      <div class="footer-brand">
        <span class="seal">思</span>
        <div class="footer-brand-text">
          <span class="footer-name">思维兵工厂</span>
          <span class="footer-version">version&nbsp;<b>1.0.0</b></span>
        </div>
      </div>

      <!-- 元信息：运行时长 + 备案，安静的次级文字 -->
      <div class="footer-meta">
        <p>网站已运行 · {{ timeString }}</p>
        <p class="footer-beian">
          <img :src="beianIcon" alt="备案" />
          <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank" rel="noopener">
            备案号 暂无
          </a>
        </p>
      </div>

      <!-- 社交：统一描边方框，hover 朱砂 -->
      <div class="footer-social">
        <a
          v-for="s in socials"
          :key="s.name"
          :href="s.href"
          :aria-label="s.name"
          :title="s.name"
          target="_blank"
          rel="noopener"
        >
          <img :src="s.icon" :alt="s.name" />
        </a>
      </div>
    </div>

    <!-- bottom 取 150：到达页面底部时，按钮下沿稳稳落在页脚分割线（约 127px）上方，
         留出约 23px 安全间距，避免浮动按钮与结构线相切（视觉碰撞）。 -->
    <el-backtop :right="80" :bottom="150" :visibility-height="500" />
  </footer>
</template>

<style scoped>
.footer {
  width: 100%;
  background-color: var(--footer_background, #fffdf8);
  border-top: 1px solid var(--color-border-default);
}

.footer-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 36px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  flex-wrap: wrap;
}

/* ↓ 站标 ↓ */
.footer-brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.footer-brand .seal {
  display: inline-grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 5px;
  background: var(--color-primary);
  color: #fbf7ef;
  font-family: var(--font-display, "Noto Serif SC", serif);
  font-weight: 700;
  font-size: 20px;
  line-height: 1;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
}

.footer-brand-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.footer-name {
  font-family: var(--font-display, "Noto Serif SC", serif);
  font-weight: 700;
  font-size: 17px;
  letter-spacing: 0.08em;
  color: var(--color-text-primary);
}

.footer-version {
  font-size: 12.5px;
  color: var(--color-text-tertiary);
}

.footer-version b {
  color: var(--color-primary);
  font-weight: 600;
}

/* ↓ 元信息 ↓ */
.footer-meta {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.95;
  text-align: center;
}

.footer-meta p {
  margin: 0;
}

.footer-beian {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.footer-beian img {
  width: 15px;
  height: 15px;
  object-fit: contain;
}

.footer-beian a {
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.22s ease;
}

.footer-beian a:hover {
  color: var(--color-primary);
}

/* ↓ 社交图标 ↓ */
.footer-social {
  display: flex;
  gap: 10px;
}

.footer-social a {
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--color-border-default);
  border-radius: 8px;
  background: transparent;
  transition: border-color 0.22s ease, background-color 0.22s ease;
}

.footer-social a:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-subtle);
}

/* 暗色主题下给方框一点极淡亮底，让深色 logo（如 GitHub 黑标）不糊进背景 */
:global(html.dark) .footer-social a {
  background: rgba(255, 255, 255, 0.06);
}

:global(html.dark) .footer-social a:hover {
  background: var(--color-primary-subtle);
}

.footer-social img {
  width: 20px;
  height: 20px;
  object-fit: contain;
}

/* ↓ 回到顶部：朱砂主色，替换 Element 默认蓝 ↓ */
.footer :deep(.el-backtop) {
  background-color: var(--color-primary);
  color: #fbf7ef;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

.footer :deep(.el-backtop:hover) {
  background-color: var(--color-primary-hover);
}

/* ↓ 响应式：窄屏纵向堆叠居中 ↓ */
@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 22px;
    padding: 28px 16px;
  }
}
</style>
