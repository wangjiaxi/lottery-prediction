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
    
    // 显示加载提示
    wx.showLoading({
      title: '正在生成分享图片...'
    })

    try {
      // 使用新的Canvas 2D API
      const query = wx.createSelectorQuery()
      query.select('#shareCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res && res[0]) {
            const canvas = res[0].node
            const ctx = canvas.getContext('2d')
            
            // 设置Canvas尺寸 (使用2倍分辨率提高清晰度)
            const dpr = wx.getSystemInfoSync().pixelRatio
            canvas.width = 375 * dpr
            canvas.height = 600 * dpr
            ctx.scale(dpr, dpr)
            
            // 绘制背景
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, 375, 600)
            
            // 绘制顶部装饰条
            ctx.fillStyle = '#0052D9'
            ctx.fillRect(0, 0, 375, 80)
            
            // 绘制标题
            ctx.fillStyle = '#ffffff'
            ctx.font = 'bold 24px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('大乐透号码推荐', 187, 50)
            
            let currentY = 120
            
            // 绘制数据状态
            ctx.fillStyle = '#666666'
            ctx.font = '14px sans-serif'
            ctx.textAlign = 'left'
            ctx.fillText(`数据总量: ${that.data.totalRecords}条`, 30, currentY)
            currentY += 25
            ctx.fillText(`最新期次: ${that.data.latestPeriod}`, 30, currentY)
            currentY += 40
            
            // 绘制推荐号码（如果有）
            if (that.data.showRecommendations) {
              // 热门号码区域
              ctx.fillStyle = '#ff6b6b'
              ctx.font = 'bold 16px sans-serif'
              ctx.fillText('🔥 热门推荐', 30, currentY)
              currentY += 30
              
              // 绘制号码球
              that.drawNumberBalls(ctx, that.data.hotNumbers.front, that.data.hotNumbers.back, currentY)
              currentY += 80
              
              // 冷门号码区域
              ctx.fillStyle = '#4ecdc4'
              ctx.font = 'bold 16px sans-serif'
              ctx.fillText('❄️ 冷门推荐', 30, currentY)
              currentY += 30
              
              // 绘制号码球
              that.drawNumberBalls(ctx, that.data.coldNumbers.front, that.data.coldNumbers.back, currentY)
              currentY += 80
            }
            
            // 绘制随机号码（如果有）
            if (that.data.showRandom) {
              ctx.fillStyle = '#95de64'
              ctx.font = 'bold 16px sans-serif'
              ctx.fillText('🎲 随机号码', 30, currentY)
              currentY += 30
              
              // 绘制号码球
              that.drawNumberBalls(ctx, that.data.randomNumbers.front, that.data.randomNumbers.back, currentY)
              currentY += 80
            }
            
            // 绘制分割线
            ctx.strokeStyle = '#e0e0e0'
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(30, currentY)
            ctx.lineTo(345, currentY)
            ctx.stroke()
            currentY += 20
            
            // 绘制免责声明
            ctx.fillStyle = '#999999'
            ctx.font = '12px sans-serif'
            ctx.textAlign = 'center'
            ctx.fillText('仅供娱乐参考，理性购彩', 187, currentY)
            currentY += 20
            
            // 绘制时间
            const now = new Date()
            const timeStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
            ctx.fillText(timeStr, 187, currentY)
            
            // 生成图片
            setTimeout(() => {
              wx.canvasToTempFilePath({
                canvas: canvas,
                success: function(res) {
                  const tempFilePath = res.tempFilePath
                  
                  wx.hideLoading()
                  
                  // 预览并保存图片
                  wx.previewImage({
                    urls: [tempFilePath],
                    current: 0,
                    success: function() {
                      Toast({
                        context: that,
                        selector: '#t-toast',
                        message: '长按图片可保存到相册',
                        theme: 'success',
                        direction: 'column',
                        duration: 3000
                      })
                    },
                    fail: function(err) {
                      console.error('预览图片失败:', err)
                      // 直接尝试保存
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
                        fail: function(saveErr) {
                          console.error('保存图片失败:', saveErr)
                          Toast({
                            context: that,
                            selector: '#t-toast',
                            message: '请长按图片保存',
                            theme: 'warning',
                            direction: 'column'
                          })
                        }
                      })
                    }
                  })
                },
                fail: function(err) {
                  wx.hideLoading()
                  console.error('生成图片失败:', err)
                  Toast({
                    context: that,
                    selector: '#t-toast',
                    message: '生成图片失败，请重试',
                    theme: 'error',
                    direction: 'column'
                  })
                }
              })
            }, 500)
          } else {
            wx.hideLoading()
            Toast({
              context: that,
              selector: '#t-toast',
              message: 'Canvas获取失败',
              theme: 'error',
              direction: 'column'
            })
          }
        })
    } catch (error) {
      wx.hideLoading()
      console.error('分享图片生成异常:', error)
      Toast({
        context: that,
        selector: '#t-toast',
        message: '生成失败，请重试',
        theme: 'error',
        direction: 'column'
      })
    }
  },

  // 绘制号码球的辅助方法
  drawNumberBalls(ctx, frontNumbers, backNumbers, startY) {
    const ballRadius = 18
    const ballSpacing = 35
    let currentX = 30
    
    // 绘制前区号码
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    frontNumbers.forEach((num, index) => {
      // 绘制红色球
      ctx.fillStyle = '#ff4444'
      ctx.beginPath()
      ctx.arc(currentX + ballRadius, startY + ballRadius, ballRadius, 0, 2 * Math.PI)
      ctx.fill()
      
      // 绘制数字
      ctx.fillStyle = '#ffffff'
      ctx.fillText(num, currentX + ballRadius, startY + ballRadius)
      
      currentX += ballSpacing + ballRadius * 2
    })
    
    // 绘制加号
    ctx.fillStyle = '#666666'
    ctx.font = 'bold 20px sans-serif'
    ctx.fillText('+', currentX + 10, startY + ballRadius)
    currentX += 35
    
    // 绘制后区号码
    backNumbers.forEach((num, index) => {
      // 绘制蓝色球
      ctx.fillStyle = '#4444ff'
      ctx.beginPath()
      ctx.arc(currentX + ballRadius, startY + ballRadius, ballRadius, 0, 2 * Math.PI)
      ctx.fill()
      
      // 绘制数字
      ctx.fillStyle = '#ffffff'
      ctx.fillText(num, currentX + ballRadius, startY + ballRadius)
      
      currentX += ballSpacing + ballRadius * 2
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
    let title = '大乐透号码推荐 - 智能分析系统'
    
    // 如果有推荐数据，添加到标题
    if (that.data.showRecommendations) {
      const hotFront = that.data.hotNumbers.front.slice(0, 3).join(' ')
      title = `大乐透推荐: ${hotFront}...`
    } else if (that.data.showRandom) {
      const randomFront = that.data.randomNumbers.front.slice(0, 3).join(' ')
      title = `大乐透随机: ${randomFront}...`
    }
    
    return {
      title: title,
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    const that = this
    let title = '大乐透号码推荐 - 智能分析系统'
    
    // 如果有推荐数据，添加到标题
    if (that.data.showRecommendations) {
      const hotFront = that.data.hotNumbers.front.slice(0, 3).join(' ')
      title = `大乐透推荐: ${hotFront}...`
    } else if (that.data.showRandom) {
      const randomFront = that.data.randomNumbers.front.slice(0, 3).join(' ')
      title = `大乐透随机: ${randomFront}...`
    }
    
    return {
      title: title,
      imageUrl: '/images/share-cover.jpg'
    }
  }
})
