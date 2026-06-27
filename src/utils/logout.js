import { ElMessage } from "element-plus";
import useUserInfo from "@/stores/userInfo";
import { handleError } from "@/utils/errorHandler";

const userInfoStore = useUserInfo(); // 执行函数，拿到Store

async function logout() {
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": navigator.userAgent, // 自动获取 User-Agent
    Origin: window.location.origin, // 自动获取 Origin
    Referer: document.referrer, // 自动获取 Referer
  };

  try {
    const response = await fetch("/api/account/logout/", {
      method: "POST",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const data = await response.json(); // 响应应该是 JSON 格式的
    const code = data.code;

    if (code === 0) {
      // 移除localStorage中的token
      localStorage.removeItem("token");

      // 删除状态管理中的相关值
      userInfoStore.isLogin = false;
      userInfoStore.username = "";
      userInfoStore.userToken = "";

      ElMessage({
        message: "您已经退出登录~",
        type: "info",
      });
    } else {
      ElMessage({
        message: "发送了错误！请报告管理员~",
        type: "error",
      });
    }
  } catch (error) {
    handleError(error, { message: "退出登录失败，请稍后重试" });
  }
}

export {
  logout
}