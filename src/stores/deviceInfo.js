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

        isEnglishFoldMenu: ref(false), // AI英语界面是否折叠左侧菜单
        englishInputAreaHeight: ref(0),


        // elementPlus的弹出框必须挂载在全局

        //打赏弹出框
        isShowReawrdDialog: ref(false),
        userRewardInfo: ref({
            name: '',
            note: '',
            contact: '',
        }),

        //登陆弹出框
        isShowLoginDialog: ref(false),
        //注册弹出框
        isShowRegisterDialog: ref(false),
        //重设密码弹出框
        isShowResetPasswordDialog: ref(false),

        // 以下是一些常量

        not_need_header_and_footer: ['/english_chat', '/test'],  // 不需要头部和脚部组件的路径
        theme_list: ['light', 'dark'], // 主题列表，新添加的主题需要在这里注册，否则不生效
        theme_store_key: 'webTheme',  // 向$store存储主题时的key，一般不用改
        ScreenWidthLimit: 880,// 屏幕宽度限制，小于此限制，顶部导航改为底部导航

        // 响应式断点常量（#13）：收敛此前散落在各 getter 中的魔法数字，便于统一调整
        // 行为保持不变，仅做命名常量化
        breakpoints: {
            dialogFull: 500,      // dialogWidth / isEnglishButtonSmall / isPaginationmall
            rightBox: 1050,       // isShowRightBox（首页右侧栏）
            hideArticleImg: 1300, // isShowArticleImageInSmallScreen（列表图）
            articleRight: 1400,   // isArticleShowRightBox（博文右侧栏）
            bigScreen: 1650,      // isBigScreen（新闻独占一行）
        },

    }),

    getters: {

        screenHeight(state) {
            return `${state.userScreenHeight}px`
        },

        screenWidth(state) {
            return `${state.userScreenWidth}px`
        },

        // 页面弹窗宽度，当屏幕宽度小于500时占据全部宽度，最大500
        dialogWidth(state) {
            if (state.userScreenWidth < state.breakpoints.dialogFull) {
                return state.userScreenWidth
            } else {
                return state.breakpoints.dialogFull
            }
        },

        isEnglishButtonSmall(state) {
            return state.userScreenWidth <= state.breakpoints.dialogFull;
        },

        // 当用户向下滑动时，阅读界面的右侧板块固定在视口
        isEnglishWebShowLeft(state) {
            return state.userScreenWidth > 900;
        },

        // 网站当前主题
        webTheme(state) {
            return state.theme_list.includes(state.theme) ? state.theme : 'light';
        },

        // 是否显示header组件
        isShowHeaderComponent(state) {
            return !state.not_need_header_and_footer.includes(state.currentPath);
        },

        // 是否显示footer组件
        isShowFooterComponent(state) {

            if (state.not_need_header_and_footer.includes(state.currentPath)) {
                return false
            } else {
                if (state.userScreenWidth < state.ScreenWidthLimit) {
                    return false

                } else {
                    return true
                }
            }
        },

        // 动态计算首图高度
        homeImageHeight(state) {
            return state.userScreenHeight * 0.725
        },

        // 顶栏背景条显隐：
        // 仅首页有昼夜 Hero 大图——暗色主题下顶栏先透明地浮在图上，滚过一段（>350）再出背景条，
        // 避免一进首页就压一条背景在 Hero 上、破坏沉浸感；
        // 其余页面（已无封面大图，如阅读页）顶栏恒显背景条，避免透明顶栏遮挡正文文字。
        isShowNavBackground(state) {
            if (state.currentPath !== '/home') return true;
            return state.theme !== 'dark' || state.scrollTop > 350;
        },

        // 当用户向下滑动时，阅读界面的右侧板块固定在视口
        isArticleRightBlockFixed(state) {
            return state.scrollTop > 530
        },

        // 根据屏幕宽度决定布局，小于1650时，新闻独占一行
        isBigScreen(state) {
            return state.userScreenWidth > state.breakpoints.bigScreen
        },

        // 当屏幕宽度小于1300时，文章列表不显示图片
        isShowArticleImageInSmallScreen(state) {
            return state.userScreenWidth > state.breakpoints.hideArticleImg
        },

        // 当屏幕宽度小于500时，缩小页码显示
        isPaginationmall(state) {
            return state.userScreenWidth < state.breakpoints.dialogFull
        },

        // 当屏幕宽度小于1050时，首页不显示右侧板块
        isShowRightBox(state) {
            return state.userScreenWidth > state.breakpoints.rightBox
        },

        // 当屏幕宽度小于1400时，博文界面不显示右侧板块
        isArticleShowRightBox(state) {
            return state.userScreenWidth > state.breakpoints.articleRight
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