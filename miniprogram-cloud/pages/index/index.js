// pages/index/index.js - 云开发版本
const app = getApp()

Page({
  data: {
    dataStatus: '检查中...',
    lastUpdate: '',
    showResults: false,
    updatingData: false,
    generatingPredictions: false,
    hotFrontNumbers: [],
    hotBackNumbers: [],
    coldFrontNumbers: [],
    coldBackNumbers: [],
    totalRecords: 0
  },

  onLoad() {
    this.loadDataStatus()
  },

  onShow() {
    this.loadDataStatus()
  },

  // 加载数据状态（支持云函数和本地数据）
  async loadDataStatus() {
    try {
      // 优先尝试云函数
      if (wx.cloud) {
        const result = await app.callCloudFunction('dataStatus')
        
        if (result.success) {
          this.setData({
            totalRecords: result.total_records,
            dataStatus: result.total_records > 0 ? 
              `云端数据: ${result.total_records} 条` : 
              '暂无数据，请先获取数据'
          })
          
          const lastUpdate = wx.getStorageSync('last_update')
          if (lastUpdate) {
            this.setData({ lastUpdate: lastUpdate })
          }
          return
        }
      }
      
      // 云函数失败或不可用，使用本地数据
      this.useLocalDataStatus()
      
    } catch (error) {
      console.error('加载数据状态失败，使用本地数据:', error)
      this.useLocalDataStatus()
    }
  },

  // 使用本地数据状态
  useLocalDataStatus() {
    const app = getApp()
    const dataCount = app.globalData.lotteryData.length
    this.setData({
      totalRecords: dataCount,
      dataStatus: dataCount > 0 ? `本地数据: ${dataCount} 条` : '暂无数据',
      lastUpdate: '请先获取数据'
    })
  },

  // 生成预测结果（支持云函数和本地算法）
  async generatePredictions() {
    this.setData({ generatingPredictions: true })

    try {
      // 优先尝试云函数
      if (wx.cloud) {
        const result = await app.callCloudFunction('predictions')
        
        if (result.success) {
          const data = result.data
          this.setData({
            hotFrontNumbers: data.hot_numbers.front_numbers || [],
            hotBackNumbers: data.hot_numbers.back_numbers || [],
            coldFrontNumbers: data.cold_numbers.front_numbers || [],
            coldBackNumbers: data.cold_numbers.back_numbers || [],
            showResults: true
          })
          
          if (data.last_update) {
            wx.setStorageSync('last_update', data.last_update)
            this.setData({ lastUpdate: data.last_update })
          }
          
          app.showSuccess('云端推荐生成成功！')
          return
        }
      }
      
      // 云函数失败或不可用，使用本地算法
      this.generateLocalPredictions()
      
    } catch (error) {
      console.error('云函数调用失败，使用本地算法:', error)
      this.generateLocalPredictions()
    } finally {
      this.setData({ generatingPredictions: false })
    }
  },

  // 本地预测算法
  generateLocalPredictions() {
    const app = getApp()
    const data = app.globalData.lotteryData
    
    if (data.length === 0) {
      app.showError('暂无数据，请先获取数据')
      return
    }
    
    // 简单的本地预测算法
    const hotFrontNumbers = this.generateHotNumbers(data, 'front_numbers', 5)
    const hotBackNumbers = this.generateHotNumbers(data, 'back_numbers', 2)
    const coldFrontNumbers = this.generateColdNumbers(data, 'front_numbers', 5)
    const coldBackNumbers = this.generateColdNumbers(data, 'back_numbers', 2)
    
    this.setData({
      hotFrontNumbers: hotFrontNumbers,
      hotBackNumbers: hotBackNumbers,
      coldFrontNumbers: coldFrontNumbers,
      coldBackNumbers: coldBackNumbers,
      showResults: true
    })
    
    app.showSuccess('本地推荐生成成功！')
  },

  // 生成热门号码
  generateHotNumbers(data, numberType, count) {
    const frequency = {}
    
    // 统计号码出现频率
    data.forEach(item => {
      item[numberType].forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1
      })
    })
    
    // 按频率排序，取前count个
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([num]) => parseInt(num))
  },

  // 生成冷门号码
  generateColdNumbers(data, numberType, count) {
    const frequency = {}
    
    // 统计号码出现频率
    data.forEach(item => {
      item[numberType].forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1
      })
    })
    
    // 按频率排序，取后count个
    return Object.entries(frequency)
      .sort((a, b) => a[1] - b[1])
      .slice(0, count)
      .map(([num]) => parseInt(num))
  },

  // 数据更新功能（添加示例数据）
  async updateData() {
    this.setData({ updatingData: true })

    try {
      // 尝试云函数更新
      if (wx.cloud) {
        const result = await app.callCloudFunction('updateData')
        if (result.success) {
          app.showSuccess('数据更新成功！')
          this.loadDataStatus()
          return
        }
      }
      
      // 云函数不可用，添加示例数据
      this.addSampleData()
      
    } catch (error) {
      console.error('更新数据失败，添加示例数据:', error)
      this.addSampleData()
    } finally {
      this.setData({ updatingData: false })
    }
  },

  // 添加示例数据
  addSampleData() {
    const app = getApp()
    const currentData = app.globalData.lotteryData
    
    // 生成一些示例数据
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
      },
      {
        period: "24003",
        date: "2024-01-05",
        front_numbers: [4, 9, 18, 26, 31],
        back_numbers: [2, 7]
      },
      {
        period: "24004",
        date: "2024-01-08",
        front_numbers: [6, 11, 19, 27, 34],
        back_numbers: [4, 9]
      },
      {
        period: "24005",
        date: "2024-01-10",
        front_numbers: [3, 8, 16, 24, 32],
        back_numbers: [1, 6]
      }
    ]
    
    // 去重并合并数据
    const existingPeriods = new Set(currentData.map(item => item.period))
    const newData = sampleData.filter(item => !existingPeriods.has(item.period))
    
    if (newData.length > 0) {
      app.globalData.lotteryData = [...currentData, ...newData]
      wx.setStorageSync('lottery_data', app.globalData.lotteryData)
      app.showSuccess(`添加了 ${newData.length} 条示例数据`)
      this.loadDataStatus()
    } else {
      app.showSuccess('数据已是最新')
    }
  }
})