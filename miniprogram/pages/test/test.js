// 测试页面
Page({
  data: {
    testResult: ''
  },

  onLoad() {
    console.log('测试页面加载')
  },

  // 测试云函数
  testCloudFunction() {
    console.log('开始测试云函数...')
    
    wx.cloud.callFunction({
      name: 'lottery-api',
      data: { action: 'health' }
    }).then(res => {
      const result = `成功: ${JSON.stringify(res.result)}`
      console.log('✅ 测试成功:', res.result)
      this.setData({
        testResult: result
      })
    }).catch(err => {
      const error = `失败: ${err.message}`
      console.error('❌ 测试失败:', err)
      this.setData({
        testResult: error
      })
    })
  },

  // 测试数据状态
  testDataStatus() {
    wx.cloud.callFunction({
      name: 'lottery-api',
      data: { action: 'data_status' }
    }).then(res => {
      console.log('✅ 数据状态:', res.result)
      this.setData({
        testResult: `数据状态: ${res.result.total_records} 条记录`
      })
    }).catch(err => {
      console.error('❌ 数据状态失败:', err)
      this.setData({
        testResult: `数据状态失败: ${err.message}`
      })
    })
  }
})