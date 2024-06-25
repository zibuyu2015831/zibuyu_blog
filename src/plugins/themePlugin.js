// themePlugin.js
import useDeviceInfo from '@/stores/deviceInfo'; // 引入 Pinia store

import {storeToRefs} from 'pinia'

export default {
  install(app) {
    const deviceInfo = useDeviceInfo(); // 获取 Pinia store 实例

    
    deviceInfo.$subscribe((mutation, state) => {
      const theme =  state.theme;

      if (theme === 'dark') {
        import('@/assets/css/dark.css').then(() => {
          document.documentElement.classList.remove(...document.documentElement.classList);
          document.documentElement.classList.add("dark");
          console.log('导入了黑夜主题，插件');
        });
      } else {
        import('@/assets/css/light.css').then(() => {
          document.documentElement.classList.remove(...document.documentElement.classList);
          document.documentElement.classList.add("light");
          console.log('导入了白天主题，插件');
        });
      }

    })


  }
};