// pages/index/index.js
const app = getApp()
import Toast from 'tdesign-miniprogram/toast/index'

Page({
  data: {
    totalRecords: 0,
    latestPeriod: '',
    updatingData: false,
    
    // 策略选择
    strategy: 'all',
    
    // 推荐结果
    generatingPredictions: false,
    showRecommendations: false,
    hotNumbers: {
      front: [],
      back: []
    },
    coldNumbers: {
      front: [],
      back: []
    },
    
    // 随机号码
    showRandom: false,
    randomNumbers: {
      front: [],
      back: []
    }
  },

  onLoad() {
    this.loadDataStatus()
  },

  onShow() {
    this.loadDataStatus()
  },

  // 加载数据状态
  loadDataStatus() {
    const that = this
    
    // 使用云函数
    wx.cloud.callFunction({
      name: 'lottery-api',
      data: { action: 'data_status' }
    }).then(res => {
      if (res.result.success) {
        that.setData({
          totalRecords: res.result.total_records || 0,
          latestPeriod: res.result.latest_period || '暂无'
        })
      }
    }).catch(err => {
      console.error('数据状态获取失败:', err)
      Toast({
        context: that,
        selector: '#t-toast',
        message: '云函数调用失败',
        theme: 'error',
        direction: 'column'
      })
    })
  },

  // 更新数据
  updateData() {
    const that = this
    
    if (that.data.updatingData) return
    
    that.setData({ updatingData: true })

    // 使用云函数
    wx.cloud.callFunction({
      name: 'lottery-api',
      data: { action: 'update_data' }
    }).then(res => {
      that.setData({ updatingData: false })

      if (res.result.success) {
        const newRecords = res.result.new_records || 0
        
        Toast({
          context: that,
          selector: '#t-toast',
          message: newRecords > 0 ? `新增 ${newRecords} 条记录` : '数据已是最新',
          theme: 'success',
          direction: 'column'
        })
        
        // 刷新数据状态
        that.loadDataStatus()
      } else {
        Toast({
          context: that,
          selector: '#t-toast',
          message: res.result.message || '更新失败',
          theme: 'error',
          direction: 'column'
        })
      }
    }).catch(err => {
      that.setData({ updatingData: false })
      console.error('更新数据失败:', err)
      Toast({
        context: that,
        selector: '#t-toast',
        message: '云函数调用失败',
        theme: 'error',
        direction: 'column'
      })
    })
  },

  // 策略改变
  onStrategyChange(e) {
    this.setData({
      strategy: e.detail.value
    })
  },

  // 生成推荐号码
  generatePredictions() {
    const that = this
    
    if (that.data.generatingPredictions) return
    
    if (that.data.totalRecords === 0) {
      Toast({
        context: that,
        selector: '#t-toast',
        message: '请先获取数据',
        theme: 'warning',
        direction: 'column'
      })
      return
    }

    that.setData({ generatingPredictions: true })

    // 使用云函数
    wx.cloud.callFunction({
      name: 'lottery-api',
      data: { 
        action: 'get_predictions',
        strategy: that.data.strategy
      }
    }).then(res => {
      that.setData({ generatingPredictions: false })

      if (res.result.success) {
        const data = res.result.data
        
        that.setData({
          hotNumbers: {
            front: data.hot_numbers.front_numbers || [],
            back: data.hot_numbers.back_numbers || []
          },
          coldNumbers: {
            front: data.cold_numbers.front_numbers || [],
            back: data.cold_numbers.back_numbers || []
          },
          showRecommendations: true
        })
        
        Toast({
          context: that,
          selector: '#t-toast',
          message: '推荐生成成功',
          theme: 'success',
          direction: 'column'
        })
      } else {
        Toast({
          context: that,
          selector: '#t-toast',
          message: res.result.message || '生成失败',
          theme: 'error',
          direction: 'column'
        })
      }
    }).catch(err => {
      that.setData({ generatingPredictions: false })
      console.error('生成推荐失败:', err)
      Toast({
        context: that,
        selector: '#t-toast',
        message: '云函数调用失败',
        theme: 'error',
        direction: 'column'
      })
    })
  },

  // 随机生成号码
  randomNumbers() {
    const front = []
    const back = []
    
    // 生成前区5个号码（1-35）
    const frontPool = Array.from({length: 35}, (_, i) => i + 1)
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * frontPool.length)
      front.push(frontPool.splice(randomIndex, 1)[0])
    }
    front.sort((a, b) => a - b)
    
    // 生成后区2个号码（1-12）
    const backPool = Array.from({length: 12}, (_, i) => i + 1)
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * backPool.length)
      back.push(backPool.splice(randomIndex, 1)[0])
    }
    back.sort((a, b) => a - b)
    
    // 格式化为两位数
    const formatNumber = (num) => num < 10 ? `0${num}` : `${num}`
    
    this.setData({
      randomNumbers: {
        front: front.map(formatNumber),
        back: back.map(formatNumber)
      },
      showRandom: true
    })
    
    Toast({
      context: this,
      selector: '#t-toast',
      message: '随机号码已生成',
      theme: 'success',
      direction: 'column'
    })
  }
})
