// app.js - 云开发版本
App({
  onLaunch() {
    // 初始化云开发（简化版本，避免网络错误）
    if (wx.cloud) {
      try {
        wx.cloud.init({
          // 不指定env，使用默认环境
          traceUser: true,
        })
        console.log('云开发初始化成功')
      } catch (error) {
        console.error('云开发初始化失败:', error)
      }
    } else {
      console.warn('当前基础库不支持云开发，使用本地模式')
    }

    // 检查本地存储的数据
    this.checkLocalData()
  },

  globalData: {
    userInfo: null,
    useCloud: false, // 标记是否使用云开发
    lotteryData: [] // 本地数据存储
  },

  checkLocalData() {
    try {
      const localData = wx.getStorageSync('lottery_data')
      if (!localData) {
        // 初始化示例数据
        const sampleData = [
          {
            period: "24001",
            date: "2024-01-01",
            front_numbers: [1, 5, 12, 23, 35],
            back_numbers: [3, 8]
          },
          {
            period: "24002", 
            date: "2024-01-03",
            front_numbers: [2, 7, 15, 28, 33],
            back_numbers: [5, 11]
          }
        ]
        wx.setStorageSync('lottery_data', sampleData)
        this.globalData.lotteryData = sampleData
      } else {
        this.globalData.lotteryData = localData
      }
      console.log('本地数据加载成功，记录数:', this.globalData.lotteryData.length)
    } catch (e) {
      console.error('读取本地数据失败:', e)
      this.globalData.lotteryData = []
    }
  },

  // 云函数调用封装
  callCloudFunction(name, data = {}) {
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: name,
        data: data,
        success: res => {
          resolve(res.result)
        },
        fail: err => {
          reject(err)
        }
      })
    })
  },

  // 显示加载提示
  showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    })
  },

  // 隐藏加载提示
  hideLoading() {
    wx.hideLoading()
  },

  // 显示成功提示
  showSuccess(message) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    })
  },

  // 显示错误提示
  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    })
  }
})