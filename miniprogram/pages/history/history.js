// pages/history/history.js
const app = getApp()
import Toast from 'tdesign-miniprogram/toast/index'

Page({
  data: {
    historyData: [],
    displayedRecords: 0,
    totalRecords: 0,
    pageSize: 10,
    currentOffset: 0,
    loading: false,
    hasMore: true
  },

  onLoad() {
    this.loadInitialData()
  },

  onShow() {
    // 每次显示页面时重置并加载
    this.setData({
      historyData: [],
      currentOffset: 0,
      hasMore: true
    })
    this.loadInitialData()
  },

  // 加载初始数据（最近10期）
  loadInitialData() {
    const that = this
    
    that.setData({ loading: true })

    // 使用云函数
    wx.cloud.callFunction({
      name: 'lottery-api',
      data: { 
        action: 'get_history',
        offset: 0,
        limit: that.data.pageSize
      }
    }).then(res => {
      that.setData({ loading: false })

      if (res.result.success) {
        const data = res.result.data || []
        const total = res.result.total || data.length
        
        that.setData({
          historyData: data,
          displayedRecords: data.length,
          totalRecords: total,
          currentOffset: data.length,
          hasMore: data.length < total
        })
      } else {
        Toast({
          context: that,
          selector: '#t-toast',
          message: res.result.message || '加载失败',
          theme: 'error',
          direction: 'column'
        })
      }
    }).catch(err => {
      that.setData({ loading: false })
      console.error('加载历史数据失败:', err)
      Toast({
        context: that,
        selector: '#t-toast',
        message: '云函数调用失败',
        theme: 'error',
        direction: 'column'
      })
    })
  },

  // 加载更多数据
  loadMore() {
    const that = this
    
    if (that.data.loading || !that.data.hasMore) return

    that.setData({ loading: true })

    // 使用云函数
    wx.cloud.callFunction({
      name: 'lottery-api',
      data: { 
        action: 'get_history',
        offset: that.data.currentOffset,
        limit: that.data.pageSize
      }
    }).then(res => {
      that.setData({ loading: false })

      if (res.result.success) {
        const newData = res.result.data || []
        const total = res.result.total || that.data.totalRecords
        
        if (newData.length > 0) {
          const allData = that.data.historyData.concat(newData)
          
          that.setData({
            historyData: allData,
            displayedRecords: allData.length,
            totalRecords: total,
            currentOffset: allData.length,
            hasMore: allData.length < total
          })

          Toast({
            context: that,
            selector: '#t-toast',
            message: `加载了 ${newData.length} 条数据`,
            theme: 'success',
            direction: 'column'
          })
        } else {
          that.setData({ hasMore: false })
          Toast({
            context: that,
            selector: '#t-toast',
            message: '没有更多数据了',
            theme: 'warning',
            direction: 'column'
          })
        }
      } else {
        Toast({
          context: that,
          selector: '#t-toast',
          message: res.result.message || '加载失败',
          theme: 'error',
          direction: 'column'
        })
      }
    }).catch(err => {
      that.setData({ loading: false })
      console.error('加载更多数据失败:', err)
      Toast({
        context: that,
        selector: '#t-toast',
        message: '云函数调用失败',
        theme: 'error',
        direction: 'column'
      })
    })
  },

  // 跳转到首页
  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  // 转发功能
  onShareAppMessage() {
    return {
      title: '大乐透历史数据 - 查看往期开奖结果',
      path: '/pages/history/history',
      imageUrl: '/images/share-cover.jpg'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '大乐透历史数据 - 查看往期开奖结果',
      imageUrl: '/images/share-cover.jpg'
    }
  }
})
