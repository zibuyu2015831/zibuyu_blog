import { ElMessageBox } from 'element-plus'
import useDeviceInfo from "@/stores/deviceInfo";
const deviceInfoStore = useDeviceInfo();

const remindLogin = () => {
  ElMessageBox.confirm(
    '您尚未登录，请登录后再操作~',
    'Warning',
    {
      confirmButtonText: '前往登录',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
    }
  )
    .then(() => {
      deviceInfoStore.isShowLoginDialog = true;
    })
    .catch(() => {
      return
    })
}

const remindReLogin = () => {
  ElMessageBox.confirm(
    '触发监控，请重新登录',
    'Warning',
    {
      confirmButtonText: '前往登录',
      cancelButtonText: '取消',
      type: 'warning',
      center: true,
    }
  )
    .then(() => {
      deviceInfoStore.isShowLoginDialog = true;
    })
    .catch(() => {
      return
    })
}

export {
  remindLogin,
  remindReLogin
}