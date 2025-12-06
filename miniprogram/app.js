// app.js
App({
  onLaunch() {
    console.log('大乐透预测小程序启动');
  },

  globalData: {
    // 本地API服务器地址
    apiBase: 'http://localhost:5001',
    // 开发环境标识
    isDev: true
  }
})
