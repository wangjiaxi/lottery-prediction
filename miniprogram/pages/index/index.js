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

  // 页面显示分享菜单
  onReady() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
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
        const isLatest = res.result.is_latest
        const newRecords = res.result.new_records || 0
        
        if (isLatest) {
          // 数据已是最新
          Toast({
            context: that,
            selector: '#t-toast',
            message: '✅ 数据已是最新',
            theme: 'success',
            direction: 'column'
          })
        } else if (newRecords > 0) {
          // 有新数据
          const newData = res.result.new_data || []
          let newDataInfo = ''
          if (newData.length > 0) {
            newDataInfo = newData.map(item => `期次 ${item.period}: ${item.front_numbers.join(' ')} + ${item.back_numbers.join(' ')}`).join('\n')
          }
          
          Toast({
            context: that,
            selector: '#t-toast',
            message: `🎉 发现并更新 ${newRecords} 条新记录`,
            theme: 'success',
            direction: 'column'
          })
          
          // 显示新增数据详情
          wx.showModal({
            title: '📊 数据更新成功',
            content: `发现并更新 ${newRecords} 条新记录：\n\n${newDataInfo}`,
            showCancel: false,
            confirmText: '知道了'
          })
        } else {
          Toast({
            context: that,
            selector: '#t-toast',
            message: '数据检查完成',
            theme: 'info',
            direction: 'column'
          })
        }
        
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
  },

  // 分享功能 - 简化版本
  shareImage() {
    const that = this
    
    // 检查是否有数据可以分享
    if (!that.data.showRecommendations && !that.data.showRandom) {
      Toast({
        context: that,
        selector: '#t-toast',
        message: '请先生成号码再分享',
        theme: 'warning',
        direction: 'column'
      })
      return
    }
    
    // 直接触发微信分享
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
      success: function() {
        Toast({
          context: that,
          selector: '#t-toast',
          message: '请点击右上角分享',
          theme: 'success',
          direction: 'column'
        })
      },
      fail: function() {
        // 备用方案：复制文字到剪贴板
        that.shareText()
      }
    })
  },

  // 简化版分享功能 - 使用文字分享
  shareText() {
    const that = this
    
    if (!that.data.showRecommendations && !that.data.showRandom) {
      Toast({
        context: that,
        selector: '#t-toast',
        message: '请先生成号码再分享',
        theme: 'warning',
        direction: 'column'
      })
      return
    }

    let shareText = '🎯 大乐透号码推荐\n\n'
    
    if (that.data.showRecommendations) {
      shareText += '🔥 热门推荐:\n'
      shareText += `前区: ${that.data.hotNumbers.front.join(' ')}\n`
      shareText += `后区: ${that.data.hotNumbers.back.join(' ')}\n\n`
      
      shareText += '❄️ 冷门推荐:\n'
      shareText += `前区: ${that.data.coldNumbers.front.join(' ')}\n`
      shareText += `后区: ${that.data.coldNumbers.back.join(' ')}\n\n`
    }
    
    if (that.data.showRandom) {
      shareText += '🎲 随机号码:\n'
      shareText += `前区: ${that.data.randomNumbers.front.join(' ')}\n`
      shareText += `后区: ${that.data.randomNumbers.back.join(' ')}\n\n`
    }
    
    shareText += `📊 数据总量: ${that.data.totalRecords}条\n`
    shareText += `📅 最新期次: ${that.data.latestPeriod}\n`
    shareText += `⏰ ${new Date().toLocaleString()}\n\n`
    shareText += '仅供娱乐参考，理性购彩'
    
    // 复制到剪贴板
    wx.setClipboardData({
      data: shareText,
      success: function() {
        Toast({
          context: that,
          selector: '#t-toast',
          message: '内容已复制，可粘贴分享',
          theme: 'success',
          direction: 'column'
        })
      }
    })
  },

  // 转发功能
  onShareAppMessage() {
    const that = this
    let title = '🎯 大乐透号码推荐 - 智能分析系统'
    
    // 如果有推荐数据，添加到标题
    if (that.data.showRecommendations) {
      const hotFront = that.data.hotNumbers.front.slice(0, 3).join(' ')
      title = `🔥 大乐透推荐: ${hotFront}...`
    } else if (that.data.showRandom) {
      const randomFront = that.data.randomNumbers.front.slice(0, 3).join(' ')
      title = `🎲 大乐透随机: ${randomFront}...`
    }
    
    return {
      title: title,
      path: '/pages/index/index',
      imageUrl: '分享页.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const that = this
    let title = '🎯 大乐透号码推荐 - 智能分析系统'
    
    // 如果有推荐数据，添加到标题
    if (that.data.showRecommendations) {
      const hotFront = that.data.hotNumbers.front.slice(0, 3).join(' ')
      title = `🔥 大乐透推荐: ${hotFront}...`
    } else if (that.data.showRandom) {
      const randomFront = that.data.randomNumbers.front.slice(0, 3).join(' ')
      title = `🎲 大乐透随机: ${randomFront}...`
    }
    
    return {
      title: title,
      imageUrl: '分享页.png'
    }
  }
})
