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

        beforePath: ref(''),//上一层路径
        currentPath: ref(''),//当前路径


        theme: ref('light'),// 默认主题：亮色


        userScreenWidth: ref(0), // 屏幕视口宽度
        userScreenHeight: ref(0), // 屏幕视口高度
        scrollTop: ref(0),  // 屏幕向下滚动数

        // 以下是一些常量

        not_need_header_and_footer: ['/english_chat'],  // 不需要头部和脚部组件的路径
        theme_list: ['light', 'dark'], // 主题列表，新添加的主题需要在这里注册，否则不生效
        theme_store_key: 'webTheme',  // 向$store存储主题时的key，一般不用改
        ScreenWidthLimit: 880,// 屏幕宽度限制，小于此限制，顶部导航改为底部导航

    }),

    getters: {

        isEnglishButtonSmall(state) {
            if (state.userScreenWidth > 500) {
                console.log('屏幕尺寸大于500')
                return false
            } else {
                console.log('屏幕尺寸大于500')

                return true
            }
        },

        // 当用户向下滑动时，阅读界面的右侧板块固定在视口
        isEnglishWebShowLeft(state) {
            if (state.userScreenWidth > 900) {
                return true
            } else {
                return false
            }
        },

        // 网站当前主题
        webTheme(state) {
            if (state.theme_list.includes(state.theme)) {
                return state.theme
            } else {
                return 'light'
            }
        },


        // 是否显示header组件
        isShowHeaderAndFooterComponent(state) {
            console.log('当前的路径是：', state.currentPath)

            if (state.not_need_header_and_footer.includes(state.currentPath)) {
                console.log('不需要显示头部脚部组件')
                return false
            } else {
                console.log('需要显示头部脚部组件')
                return true
            }
        },

        // 动态计算首图高度
        homeImageHeight(state) {
            return state.userScreenHeight * 0.725
        },

        // 当用户向下滑动时，主界面的顶栏显示背景
        isShowNavBackground(state) {

            if (state.theme !== 'dark') {
                return true
            } else {
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

        // 根据屏幕宽度决定布局，小于1650时，新闻独占一行
        isBigScreen(state) {
            if (state.userScreenWidth > 1650) {
                return true
            } else {
                return false
            }
        },

        // 当屏幕宽度小于1300时，文章列表不显示图片
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

        // 当屏幕宽度小于1050时，首页不显示右侧板块
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

        // 判断是否显示顶部导航栏
        isShowHeaderNavigate(state) {

            if (state.not_need_header_and_footer.includes(state.currentPath)) {
                return false
            }
            else {
                if (state.userScreenWidth < state.ScreenWidthLimit) {
                    return false
                } else {
                    return true
                }
            }
        },

        // 判断是否显示底部导航栏
        isShowBottomMenu(state) {

            if (state.not_need_header_and_footer.includes(state.currentPath)) {
                return false
            }
            else {
                if (state.userScreenWidth < state.ScreenWidthLimit) {
                    return true

                } else {
                    return false
                }
            }
        },

    }

})

export default useDeviceInfo