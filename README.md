# zibuyu_blog

> 一个基于 **Vue 3 + Vite** 构建的个人博客前端项目，集成文章阅读、网址导航、AI 英语学习助手等功能。

## ✨ 功能特性

- 📝 **博客文章** —— 文章列表与详情页，支持 Markdown 渲染、代码高亮、目录（TOC）。
- 🧭 **网址导航** —— 常用网站收藏与分类导航。
- 🤖 **AI 英语助手** —— 接入讯飞星火大模型，提供英语对话陪练与口语教练（Spoken Coach）。
- 👤 **用户系统** —— 登录、注册、找回密码、个人信息管理（含服务端登录态校验）。
- 💰 **打赏功能** —— 支持读者打赏与打赏记录展示。
- 🎨 **主题切换** —— 通过自定义主题插件支持多套主题。
- 📱 **响应式布局** —— 适配桌面端与移动端（含小屏菜单）。

## 🛠 技术栈

| 分类 | 技术 |
| --- | --- |
| 框架 | [Vue 3](https://vuejs.org/)（Composition API） |
| 构建工具 | [Vite 5](https://vitejs.dev/) |
| 路由 | [Vue Router 4](https://router.vuejs.org/) |
| 状态管理 | [Pinia](https://pinia.vuejs.org/) |
| UI 组件库 | [Element Plus](https://element-plus.org/) |
| Markdown | [marked](https://marked.js.org/) + [highlight.js](https://highlightjs.org/) |
| HTTP | [axios](https://axios-http.com/) |
| 代码规范 | [ESLint](https://eslint.org/) |

## 📁 目录结构

```
src/
├── api/          # 接口请求（文章、资讯等）
├── assets/       # 静态资源（css / font / image）
├── components/   # 公共组件（Header / Footer / AI 英语相关组件等）
├── content/      # 业务内容组件（登录 / 注册 / 打赏 / 个人信息等弹窗）
├── plugins/      # 插件（主题插件）
├── router/       # 路由配置
├── stores/       # Pinia 状态管理
├── utils/        # 工具函数（编码、错误处理、HTML 净化、鉴权、节流、日期、本地存储等）
├── views/        # 页面（Home / About / Article / AiEnglish / WebNavigate）
├── App.vue
└── main.js
```

## 🚀 快速开始

### 环境要求

- Node.js 16+（推荐 18 LTS）
- npm

### 安装依赖

```sh
npm install
```

### 启动开发服务器

```sh
npm run dev
```

默认运行在 [http://localhost:3000](http://localhost:3000)。

### 构建生产版本

```sh
npm run build
```

### 代码检查与自动修复

```sh
npm run lint
```

### 运行单元测试

```sh
npm test            # 单次运行（Vitest）
npm run test:watch  # 监听模式
npm run test:coverage
```

> 注意：`src/stores/aiEnglish.js` 含真实密钥、已被 gitignore。全新检出后若需 `npm run build` 或运行
> AI 英语相关页面，请先复制模板：`cp src/stores/aiEnglish_demo.js src/stores/aiEnglish.js`。

## ⚙️ 配置说明

后端接口与第三方服务通过 `vite.config.js` 中的 `proxy` 进行跨域代理，主要包括：

| 代理前缀 | 用途 |
| --- | --- |
| `/api` | 博客后端 API |
| `/xunfei` | 讯飞星火大模型 API |
| `/elem`、`/elem10` | 静态资源 CDN |

> 部署到生产环境时，请根据实际后端地址调整代理 / 接口配置。

## 🧩 推荐开发环境

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 插件（并禁用 Vetur）。

## 📦 仓库地址

- GitHub：<https://github.com/zibuyu2015831/zibuyu_blog>
- Gitee：<https://gitee.com/zibuyu2015831/zibuyu_blog>

## 📄 License

本项目基于 [MIT License](./LICENSE) 开源，你可以自由地使用、修改和分发。
