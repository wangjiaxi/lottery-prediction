// pages/history/history.js - 云开发版本
const app = getApp()

Page({
  data: {
    historyData: [],
    loading: false,
    selectedLimit: 0,
    limitOptions: [
      { label: '最近10期', value: 10 },
      { label: '最近20期', value: 20 },
      { label: '最近50期', value: 50 }
    ]
  },

  onLoad() {
    this.loadHistoryData()
  },

  onPullDownRefresh() {
    this.loadHistoryData().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onLimitChange(e) {
    const index = e.detail.value
    this.setData({ selectedLimit: index })
    this.loadHistoryData()
  },

  // 加载历史数据（支持云函数和本地数据）
  async loadHistoryData() {
    this.setData({ loading: true })

    try {
      const limit = this.data.limitOptions[this.data.selectedLimit].value
      
      // 优先尝试云函数
      if (wx.cloud) {
        const result = await app.callCloudFunction('history', { limit: limit })
        
        if (result.success) {
          this.setData({ historyData: result.data || [] })
          return
        }
      }
      
      // 云函数失败或不可用，使用本地数据
      this.loadLocalHistoryData(limit)
      
    } catch (error) {
      console.error('云函数调用失败，使用本地数据:', error)
      this.loadLocalHistoryData()
    } finally {
      this.setData({ loading: false })
    }
  },

  // 加载本地历史数据
  loadLocalHistoryData(limit = 10) {
    const app = getApp()
    const allData = app.globalData.lotteryData
    
    // 按期数倒序排列，取前limit条
    const sortedData = [...allData].sort((a, b) => b.period.localeCompare(a.period))
    const limitedData = sortedData.slice(0, limit)
    
    this.setData({
      historyData: limitedData
    })
    
    if (limitedData.length === 0) {
      app.showError('暂无历史数据')
    }
  },

  goBack() {
    wx.navigateBack()
  }
})