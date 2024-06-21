import { defineStore } from 'pinia'
import { ref, computed } from 'vue'



// defineStore第一个参数为name，也称为id，是必传参数。唯一标识Store
const useDeviceInfo = defineStore('currentPath', {
    state: () => ({
        currentPath: 'home',
        userScreenWidth: ref(0), // 屏幕视口宽度
        userScreenHeight: ref(0), // 屏幕视口高度
        scrollTop: ref(0)  // 屏幕向下滚动数
    }),

    getters: {

        TextColor(state) {
            if (state.scrollTop > 210) {
                return "black"
            } else {
                return "#d1c2d3"
            }
        },

        backgroundColor(state) {
            if (state.scrollTop > 210) {
                return "#FFFFFF"
            } else {
                return "transparent"
            }
        },


        // 动态计算首图高度
        homeImageHeight(state) {
            return state.userScreenHeight * 0.7
        },

        // 当用户向下滑动时，阅读界面的右侧板块固定在视口
        isArticleRightBlockFixed(state) {
            if (state.scrollTop > 530) {
                return true
            } else {
                return false
            }
        },

        // 当屏幕宽度小于1650时，文章列表不显示图片
        isShowArticleImage(state) {
            if (state.userScreenWidth > 1650) {
                return true
            } else {
                return false
            }
        },

        // 当屏幕宽度小于500时，缩小页码显示
        isPaginationmall(state) {
            if (state.userScreenWidth < 500) {
                return true
            } else {
                return false
            }
        },

        // 当屏幕宽度小于1650时，不显示右侧板块
        isShowRightBox(state) {
            if (state.userScreenWidth > 1650) {
                return true
            } else {
                return false
            }
        },

        // 当屏幕主题区域所占栅格数（elementPlus，一行分为0~24栅格）
        mainColumnSpanNum(state) {
            if (state.userScreenWidth < 500) {
                return 22;
            } else if (state.userScreenWidth < 1640) {
                return 22;
            } else {
                return 11;
            }
        },

        isShowHeaderNavigate(state) {
            if (state.userScreenWidth < 1025) {
                return false
            } else {
                return true
            }
        },
    }

})

export default useDeviceInfo