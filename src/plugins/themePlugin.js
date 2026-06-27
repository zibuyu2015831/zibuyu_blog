// themePlugin.js
import useDeviceInfo from '@/stores/deviceInfo'; // 引入 Pinia store
import { setLocalStorageWithExpiration } from "@/utils/uselocalStorage";

export default {
  install(_app) {
    const deviceInfo = useDeviceInfo(); // 获取 Pinia store 实例

    deviceInfo.$subscribe((mutation, state) => {
      const theme = state.theme === 'dark' ? 'dark' : 'light';

      // 主题变量已由常驻的 tokens.css 提供，这里只需切换 <html> 的 class。
      // （仅移除已知主题类，避免误删其他库挂在 html 上的 class）
      const el = document.documentElement;
      el.classList.remove('light', 'dark');
      el.classList.add(theme);

      // 将主题写入浏览器本地存储，设置有效期为6小时
      setLocalStorageWithExpiration(deviceInfo.theme_store_key, theme, 6);
    })


  }
};