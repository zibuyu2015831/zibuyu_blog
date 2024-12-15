import axios from 'axios'
import useAiEnglish from '@/stores/aiEnglish';
import { ElMessage } from 'element-plus'

class MyRequest {
  constructor(baseURL, timeout = 10000) {
    this.instance = axios.create({
      baseURL,
      timeout
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

        // 检查响应数据是否为 JSON 格式
        if (typeof res.data !== 'object' || res.data === null) {
          ElMessage.error('Response data is not JSON format')

          reject('Response data is not JSON format');
          return;
        }

        // 检查 JSON 数据中是否包含 code 字段
        if (!res.data.hasOwnProperty('code')) {
          ElMessage.error('JSON data does not contain "code" field')
          reject('JSON data does not contain "code" field');
          return;
        }

        if (res.data.code === 3001) {

          ElMessage({
            message: '操作太频繁了，喝口水休息一下吧~',
            type: 'warning',
          })
          reject('Requests are too frequent');
          return;
        }

        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  }

  get(config) {
    return this.request({ ...config, method: "get" })
  }

  post(config) {
    return this.request({ ...config, method: "post" })
  }
}

export default new MyRequest(SERVER_URL)