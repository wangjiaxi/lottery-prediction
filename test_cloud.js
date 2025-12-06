// 测试云开发配置
// 在微信开发者工具控制台中运行此代码

console.log('开始测试云开发配置...')

// 测试1: 检查云开发是否初始化
try {
  if (wx.cloud) {
    console.log('✅ wx.cloud 可用')
    
    // 测试2: 测试云函数调用
    wx.cloud.callFunction({
      name: 'lottery-api',
      data: {
        action: 'health'
      },
      success: (res) => {
        console.log('✅ 云函数调用成功:', res.result)
        
        // 测试3: 测试数据状态
        wx.cloud.callFunction({
          name: 'lottery-api',
          data: {
            action: 'data_status'
          },
          success: (res) => {
            console.log('✅ 数据状态获取成功:', res.result)
          },
          fail: (err) => {
            console.error('❌ 数据状态获取失败:', err)
          }
        })
      },
      fail: (err) => {
        console.error('❌ 云函数调用失败:', err)
      }
    })
  } else {
    console.error('❌ wx.cloud 不可用，请检查基础库版本')
  }
} catch (err) {
  console.error('❌ 云开发初始化失败:', err)
}

// 测试4: 测试API工具类
const api = require('./utils/api.js')

api.healthCheck()
  .then(res => {
    console.log('✅ API健康检查成功:', res)
  })
  .catch(err => {
    console.error('❌ API健康检查失败:', err)
  })

console.log('测试脚本执行完成，请查看控制台输出')