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
  },

  // 分享功能 - 生成当前页面截图
  shareImage() {
    const that = this
    
    // 显示加载提示
    Toast({
      context: that,
      selector: '#t-toast',
      message: '正在生成分享图片...',
      theme: 'loading',
      direction: 'column'
    })

    // 获取当前页面截图
    wx.createSelectorQuery()
      .select('.container')
      .boundingClientRect()
      .exec(function(res) {
        if (res && res[0]) {
          const { width, height } = res[0]
          
          // 使用canvas绘制页面内容
          const canvasId = 'shareCanvas'
          const ctx = wx.createCanvasContext(canvasId, that)
          
          // 设置canvas大小
          ctx.scale(2, 2) // 提高清晰度
          
          // 绘制背景
          ctx.setFillStyle('#ffffff')
          ctx.fillRect(0, 0, width * 2, height * 2)
          
          // 绘制标题
          ctx.setFillStyle('#333333')
          ctx.setFontSize(18)
          ctx.setTextAlign('center')
          ctx.fillText('大乐透号码推荐', width, 30)
          
          // 绘制数据状态
          ctx.setFillStyle('#666666')
          ctx.setFontSize(14)
          ctx.setTextAlign('left')
          ctx.fillText(`数据总量: ${that.data.totalRecords}条`, 20, 60)
          ctx.fillText(`最新期次: ${that.data.latestPeriod}`, 20, 85)
          
          let currentY = 110
          
          // 绘制推荐号码（如果有）
          if (that.data.showRecommendations) {
            // 绘制热门号码
            ctx.setFillStyle('#ff6b6b')
            ctx.setFontSize(16)
            ctx.fillText('热门推荐:', 20, currentY)
            currentY += 25
            
            const hotFront = that.data.hotNumbers.front.join(' ')
            const hotBack = that.data.hotNumbers.back.join(' ')
            ctx.setFillStyle('#333333')
            ctx.setFontSize(14)
            ctx.fillText(`前区: ${hotFront}`, 20, currentY)
            currentY += 20
            ctx.fillText(`后区: ${hotBack}`, 20, currentY)
            currentY += 35
            
            // 绘制冷门号码
            ctx.setFillStyle('#4ecdc4')
            ctx.setFontSize(16)
            ctx.fillText('冷门推荐:', 20, currentY)
            currentY += 25
            
            const coldFront = that.data.coldNumbers.front.join(' ')
            const coldBack = that.data.coldNumbers.back.join(' ')
            ctx.setFillStyle('#333333')
            ctx.setFontSize(14)
            ctx.fillText(`前区: ${coldFront}`, 20, currentY)
            currentY += 20
            ctx.fillText(`后区: ${coldBack}`, 20, currentY)
            currentY += 35
          }
          
          // 绘制随机号码（如果有）
          if (that.data.showRandom) {
            ctx.setFillStyle('#95de64')
            ctx.setFontSize(16)
            ctx.fillText('随机号码:', 20, currentY)
            currentY += 25
            
            const randomFront = that.data.randomNumbers.front.join(' ')
            const randomBack = that.data.randomNumbers.back.join(' ')
            ctx.setFillStyle('#333333')
            ctx.setFontSize(14)
            ctx.fillText(`前区: ${randomFront}`, 20, currentY)
            currentY += 20
            ctx.fillText(`后区: ${randomBack}`, 20, currentY)
            currentY += 35
          }
          
          // 绘制免责声明
          ctx.setFillStyle('#999999')
          ctx.setFontSize(12)
          ctx.setTextAlign('center')
          ctx.fillText('仅供娱乐参考，理性购彩', width, height - 20)
          
          // 绘制时间
          const now = new Date()
          const timeStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`
          ctx.fillText(timeStr, width, height - 5)
          
          // 绘制完成后生成图片
          ctx.draw(false, () => {
            // 生成临时图片
            wx.canvasToTempFilePath({
              canvasId: canvasId,
              success: function(res) {
                const tempFilePath = res.tempFilePath
                
                // 隐藏加载提示
                wx.hideToast()
                
                // 预览图片
                wx.previewImage({
                  urls: [tempFilePath],
                  success: function() {
                    // 保存图片到相册
                    wx.saveImageToPhotosAlbum({
                      filePath: tempFilePath,
                      success: function() {
                        Toast({
                          context: that,
                          selector: '#t-toast',
                          message: '图片已保存到相册',
                          theme: 'success',
                          direction: 'column'
                        })
                      },
                      fail: function(err) {
                        console.error('保存图片失败:', err)
                        Toast({
                          context: that,
                          selector: '#t-toast',
                          message: '请授权保存到相册',
                          theme: 'warning',
                          direction: 'column'
                        })
                      }
                    })
                  },
                  fail: function(err) {
                    console.error('预览图片失败:', err)
                    Toast({
                      context: that,
                      selector: '#t-toast',
                      message: '生成图片失败',
                      theme: 'error',
                      direction: 'column'
                    })
                  }
                })
              },
              fail: function(err) {
                console.error('生成临时图片失败:', err)
                Toast({
                  context: that,
                  selector: '#t-toast',
                  message: '生成图片失败',
                  theme: 'error',
                  direction: 'column'
                })
              }
            }, that)
          })
        } else {
          Toast({
            context: that,
            selector: '#t-toast',
            message: '页面信息获取失败',
            theme: 'error',
            direction: 'column'
          })
        }
      })
  },

  // 转发功能
  onShareAppMessage() {
    return {
      title: '大乐透号码推荐 - 智能分析系统',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '大乐透号码推荐 - 智能分析系统',
      imageUrl: '/images/share-cover.jpg'
    }
  }
})
