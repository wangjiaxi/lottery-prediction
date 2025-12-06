// app.js
App({
  onLaunch() {
    console.log('大乐透预测小程序启动');
    
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-5gk8vs2q7ed3e658', // 你的云开发环境ID
        traceUser: true,
      });
      console.log('云开发初始化成功');
    } else {
      console.error('当前微信版本不支持云开发');
    }
  },

  globalData: {
    // 本地API服务器地址（开发环境）
    apiBase: 'http://localhost:5001',
    // 开发环境标识 - 发布时改为false
    isDev: false,
    // 云开发环境ID
    cloudEnv: 'cloud1-5gk8vs2q7ed3e658'
  }
})
