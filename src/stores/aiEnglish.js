/* 这个文件用来保存与英语聊天室相关的状态 */

import { defineStore } from 'pinia'
import { ref } from 'vue'


// defineStore第一个参数为name，也称为id，是必传参数。唯一标识Store
const useAiEnglish = defineStore('aiEnglish', {
    state: () => ({
        currentConmand: ref('口语助手'),
        commands:ref({

          "口语助手":{
            'url':'/english_coach'
          },
          "记忆助手":{
            'url':'/article_checker'
          },
          "通用助手":{
            'url':'/know_everything'
          },
          
        })
    }),

    getters: {

    }

})

export default useAiEnglish