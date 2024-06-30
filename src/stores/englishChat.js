/* 这个文件用来保存与英语聊天室相关的状态 */

import { defineStore } from 'pinia'
import { ref } from 'vue'


// defineStore第一个参数为name，也称为id，是必传参数。唯一标识Store
const useEnglishChat = defineStore('englishChat', {
    state: () => ({
        currentConmand: ref('口语陪练'),
        commands:ref({

          "口语陪练":{
            'url':'/english_coach'
          },
          "作文批改":{
            'url':'/article_checker'
          },
          "百科问答":{
            'url':'/know_everything'
          },
          
        })
    }),

    getters: {

    }

})

export default useEnglishChat