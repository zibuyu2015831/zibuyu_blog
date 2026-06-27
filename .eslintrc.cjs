/* eslint-env node */
module.exports = {
  root: true,
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    // 自动导入（ElMessage / ElImage 等）生成的全局变量声明，消除 no-undef 误报（#08）
    './.eslintrc-auto-import.json'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    // 生产环境禁止遗留 console / debugger（开发环境关闭，便于调试）（#08）
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 允许以 _ 开头的参数表示「有意未使用」
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // 允许空的 catch 块（部分流式协议噪声需静默吞掉）
    'no-empty': ['warn', { allowEmptyCatch: true }],
    // 允许 while(true) 流式读取循环（reader.read() 后再 break 是规范写法）
    'no-constant-condition': ['error', { checkLoops: false }]
  },
  overrides: [
    {
      // 测试文件：提供 Vitest 全局 + node 环境
      files: ['**/*.{test,spec}.{js,mjs,cjs,jsx}', '**/__tests__/**'],
      env: { node: true },
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        vi: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    {
      // 配置文件：node 环境
      files: ['*.config.js', '*.config.cjs', '.eslintrc.cjs'],
      env: { node: true }
    }
  ]
}
