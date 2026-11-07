// vue.config.js
const { defineConfig } = require('@vue/cli-service')
const { codeInspectorPlugin } = require('code-inspector-plugin');
module.exports = defineConfig({ // 使用 defineConfig 包裹以获得更好的类型提示和配置验证
  publicPath: '/',
  lintOnSave: false,

  devServer: {
    // 开发服务器代理，解决开发时的跨域问题
    proxy: {
      '/api': { // 当请求以 /api 开头时
        target: 'http://127.0.0.1:8000', // 转发到本地的 FastAPI 服务
        changeOrigin: true, // 改变源，使其看起来像是从目标服务器发出的请求
        pathRewrite: { // 重写路径，去除 /api
          '^/api': ''
        }
      }
    },
    allowedHosts: 'all',
    client: {
      overlay: false, // 关闭 overlay 报错层
    },
  },
  chainWebpack: (config) => {
    config.plugin('code-inspector-plugin').use(
        codeInspectorPlugin({
          bundler: 'webpack',
        })
    );
  },
})