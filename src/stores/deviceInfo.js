/*
这个文件用来保存用户设备相关的状态：
    1. 屏幕尺寸；
    2. 某些组件是否显示；
    3. 导航栏颜色；
    ...
*/


import { defineStore } from 'pinia'
import { ref } from 'vue'



// defineStore第一个参数为name，也称为id，是必传参数。唯一标识Store
const useDeviceInfo = defineStore('deviceInfo', {
    state: () => ({
        currentPath: 'home',
        theme: ref('light'),// 默认主题：亮色
        theme_list: ['light', 'dark'], // 主题列表，新添加的主题需要在这里注册，否则不生效
        theme_store_key: 'webTheme',  // 向$store存储主题时的key，一般不用改
        userScreenWidth: ref(0), // 屏幕视口宽度
        userScreenHeight: ref(0), // 屏幕视口高度
        scrollTop: ref(0),  // 屏幕向下滚动数

    }),

    getters: {
        // 网站当前主题
        webTheme(state) {
            if (state.theme_list.includes(state.theme)) {
                return state.theme
            } else {
                return 'light'
            }
        },

        // 水印颜色
        watermarkColor(state) {
            if (state.theme === 'dark') {
                return {
                    color: 'rgba(255, 255, 255, .04)',
                    fontSize: 20,
                    fontStyle: 'italic',
                }
            } else {
                return {
                    color: 'rgba(0, 0, 0, .04)',
                    fontSize: 20,
                    fontStyle: 'italic',
                }
            }
        },

        // 动态计算首图高度
        homeImageHeight(state) {
            return state.userScreenHeight * 0.725
        },

        // 当用户向下滑动时，主界面的顶栏显示背景
        isShowNavBackground(state) {

            if (state.theme!=='dark'){
                return true
            }else{
                if (state.scrollTop > 350) {
                    return true
                } else {
                    return false
                }
            }

            
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
        isBigScreen(state) {
            if (state.userScreenWidth > 1650) {
                return true
            } else {
                return false
            }
        },

                // 当屏幕宽度小于1650时，文章列表不显示图片
                isShowArticleImageInSmallScreen(state) {
                    if (state.userScreenWidth > 1300) {
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

        // 当屏幕宽度小于1650时，首页不显示右侧板块
        isShowRightBox(state) {
            if (state.userScreenWidth > 1050) {
                return true
            } else {
                return false
            }
        },

                // 当屏幕宽度小于1400时，博文界面不显示右侧板块
                isArticleShowRightBox(state) {
                    if (state.userScreenWidth > 1400) {
                        return true
                    } else {
                        return false
                    }
                },


        isShowHeaderNavigate(state) {
            if (state.userScreenWidth < 810) {
                return false
            } else {
                return true
            }
        },
    }

})

export default useDeviceInfo