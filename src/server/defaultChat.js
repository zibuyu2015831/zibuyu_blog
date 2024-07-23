import axios from 'axios'
import useAiEnglish from "@/stores/aiEnglish";
import { ElMessage } from 'element-plus'

const aiEnglishStore = useAiEnglish();

class ChatRequest {
  constructor(baseURL, timeout = 10000) {
    this.instance = axios.create({
      baseURL,
      timeout,
      withCredentials: true, // 确保携带cookies
    });

    // 定义公共请求头
    this.commonHeaders = {
      'Authorization': 'Bearer your_token_here',
      "Content-Type": "application/json",
    };
  }

  request(config) {
    // 将公共请求头添加到请求配置中
    config.headers = {
      ...this.commonHeaders,
      ...config.headers
    };

    return new Promise((resolve, reject) => {
      this.instance.request(config).then(res => {
        resolve(res)
      }).catch(err => {
        reject(err)
      })
    })
  }



  post(config) {
    return this.request({ ...config, method: "post" })
  }


}

export default new ChatRequest(SERVER_URL)