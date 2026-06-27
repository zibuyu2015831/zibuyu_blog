// themePlugin.js
import useDeviceInfo from '@/stores/deviceInfo'; // 引入 Pinia store
import { setLocalStorageWithExpiration } from "@/utils/uselocalStorage";

export default {
  install(_app) {
    const deviceInfo = useDeviceInfo(); // 获取 Pinia store 实例

    deviceInfo.$subscribe((mutation, state) => {
      const theme =  state.theme;

      if (theme === 'dark') {
        import('@/assets/css/dark.css').then(() => {
          document.documentElement.classList.remove(...document.documentElement.classList);
          document.documentElement.classList.add("dark");
        });
      } else {
        import('@/assets/css/light.css').then(() => {
          document.documentElement.classList.remove(...document.documentElement.classList);
          document.documentElement.classList.add("light");
        });
      }

      const deviceInfoStore = useDeviceInfo();

      // 将主题写入浏览器本地存储，设置有效期为6小时
      setLocalStorageWithExpiration(deviceInfoStore.theme_store_key, theme, 6);
    })


  }
};