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

        token(state) {

            if (state.userToken == '') {
                return 0;
            };

            const parts = state.userToken.split('.');
            if (parts.length !== 3) {
                return 0;
            }

            const payload = JSON.parse(atob(parts[1]));
            const currentTime = Math.floor(Date.now() / 1000);

            if (payload.exp && payload.exp < currentTime) {
                state.userToken = ''
                localStorage.removeItem('token')
                return -1;
            }

            return state.userToken
        }
    },
    actions: {

        // 尝试从localStorage中获取token
        loadTokenFromLocalStorage() {

            // 尝试从localStorage中获取token
            if (this.userToken == '' && localStorage.getItem('token')) {
                const userToken = localStorage.getItem('token')

                const parts = userToken.split('.');
                if (parts.length !== 3) {
                    return;
                }

                const payload = JSON.parse(atob(parts[1]));
                const currentTime = Math.floor(Date.now() / 1000);

                if (payload.exp && payload.exp < currentTime) {
                    localStorage.removeItem('token')
                    return;
                }
                
                this.userToken = userToken
                this.isLogin = true
            };
        }
    }
})

export default useUserInfo