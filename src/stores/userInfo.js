/* 这个文件用来保存与用户相关的状态 */

import { defineStore } from 'pinia'
import { ref } from 'vue'


// defineStore第一个参数为name，也称为id，是必传参数。唯一标识Store
const useUserInfo = defineStore('userInfo', {
    state: () => ({
        isLogin: ref(false),
        userToken: ref(''),
        username: ref(''),
    }),

    getters: {

    }

})

export default useUserInfo