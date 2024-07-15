/* 这个文件用来保存与英语聊天室相关的状态 */

import { defineStore } from 'pinia'
import { ref } from 'vue'


// defineStore第一个参数为name，也称为id，是必传参数。唯一标识Store
const useAiEnglish = defineStore('aiEnglish', {
  state: () => ({
    // 当前选中的功能菜单
    currentConmand: ref('口语助手'),

    // 右侧功能菜单
    commands: ref({

      "口语助手": {
        'url': '/spoken_assistant'
      },
      "记忆助手": {
        'url': '/memory_assistant'
      },
      "通用助手": {
        'url': '/common_assistant'
      },

    }),

    // 英语口语聊天记录
    english_messages: ref({
      hasPrevious: true,

      data: [
        {
          content: "ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content: "用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content: "用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content: "用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content:
            "用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content: "用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content:
            "用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content:
            "用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "ai发送的内容",
          role: "assistant",
          isHidden: false,
        }
      ],
    }),

    // 通用助手聊天记录
    assistant_messages: ref({
      hasPrevious: true,

      data: [
        {
          content: "通用助手-ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content: "用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "通用助手-ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content: "用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "通用助手-ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content: "用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "通用助手-ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content:
            "用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "通用助手-ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content: "用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "通用助手-ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content:
            "用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "通用助手-ai发送的内容",
          role: "assistant",
          isHidden: false,
        },
        {
          content:
            "用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容用户发送的内容",
          role: "user",
          isHidden: false,
        },
        {
          content: "ai发送的内容",
          role: "assistant",
          isHidden: false,
        }
      ],
    }),

    // 通用助手自定义代理列表
    customized_infos: ref([
      {
        name: "默认配置", // 配置名称
        url: "", // 自定义接口地址
        key: "", // 接口密钥
        model: "", // 模型名称
        temperature: 50, // 温度，控制回复的随机性
        top_p: 50, // 控制回复的随机性
        max_tokens: 2048, // 最大输出tokens
        history_count: 10,
      },

    ]),
    currentSettingIndex: ref(0),
    useCustomizedInfo: ref(false)
  }),

  getters: {
    requestUrl() {

      if (this.useCustomizedInfo) {
        return this.customized_infos[this.currentSettingIndex].url
      } else {
        return "/xunfei/v1/chat/completions"
      }
    },

    requestKey() {
      if (this.useCustomizedInfo) {
        return `Bearer ${this.customized_infos[this.currentSettingIndex].key}`
      } else {
        return "Bearer xxxxxxx"
      }
    },

    requestModel() {
      if (this.useCustomizedInfo) {
        return this.customized_infos[this.currentSettingIndex].model
      } else {
        return "generalv"
      }
    },

    requestTemperature() {
      if (this.useCustomizedInfo) {
        return this.customized_infos[this.currentSettingIndex].temperature / 100
      } else {
        return 0.5
      }
    },

    requestTop_p() {
      if (this.useCustomizedInfo) {
        return this.customized_infos[this.currentSettingIndex].top_p / 100
      } else {
        return 0.5
      }
    },

    requestMax_tokens() {
      if (this.useCustomizedInfo) {
        return this.customized_infos[this.currentSettingIndex].max_tokens
      } else {
        return 2048
      }
    },


    requestHistoryCount() {
      if (this.useCustomizedInfo) {
        return this.customized_infos[this.currentSettingIndex].history_count*2+1
      } else {
        return 10
      }
    },

  },

  actions: {
    removeCustomizedInfoByIndex(index) {
      if (index >= 0 && index < this.customized_infos.length) {
        this.customized_infos.splice(index, 1);
      }
    },
  },

})

export default useAiEnglish