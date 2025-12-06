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

    wx.request({
      url: `${app.globalData.apiBase}/api/get_history`,
      method: 'GET',
      data: {
        offset: 0,
        limit: that.data.pageSize
      },
      success(res) {
        that.setData({ loading: false })

        if (res.data.success) {
          const data = res.data.data || []
          const total = res.data.total || data.length
          
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
            message: res.data.message || '加载失败',
            theme: 'error',
            direction: 'column'
          })
        }
      },
      fail() {
        that.setData({ loading: false })
        Toast({
          context: that,
          selector: '#t-toast',
          message: '网络连接失败',
          theme: 'error',
          direction: 'column'
        })
      }
    })
  },

  // 加载更多数据
  loadMore() {
    const that = this
    
    if (that.data.loading || !that.data.hasMore) return

    that.setData({ loading: true })

    wx.request({
      url: `${app.globalData.apiBase}/api/get_history`,
      method: 'GET',
      data: {
        offset: that.data.currentOffset,
        limit: that.data.pageSize
      },
      success(res) {
        that.setData({ loading: false })

        if (res.data.success) {
          const newData = res.data.data || []
          const total = res.data.total || that.data.totalRecords
          
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
            message: res.data.message || '加载失败',
            theme: 'error',
            direction: 'column'
          })
        }
      },
      fail() {
        that.setData({ loading: false })
        Toast({
          context: that,
          selector: '#t-toast',
          message: '网络连接失败',
          theme: 'error',
          direction: 'column'
        })
      }
    })
  },

  // 跳转到首页
  goToIndex() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
