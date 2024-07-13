/* 这个文件用来保存与英语聊天室相关的状态 */

import { defineStore } from 'pinia'
import { ref } from 'vue'


// defineStore第一个参数为name，也称为id，是必传参数。唯一标识Store
const useAiEnglish = defineStore('aiEnglish', {
    state: () => ({
        currentConmand: ref('口语助手'),
        commands:ref({

          "口语助手":{
            'url':'/spoken_assistant'
          },
          "记忆助手":{
            'url':'/memory_assistant'
          },
          "通用助手":{
            'url':'/common_assistant'
          },
          
        }),
        user_messages:ref({
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
    }),

    getters: {

    }

})

export default useAiEnglish