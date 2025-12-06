// 云函数：获取预测结果
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 初始化数据库
const db = cloud.database()

// 分析号码频率
function analyzeFrequency(data) {
  const frontCounter = {}
  const backCounter = {}
  
  // 初始化计数器
  for (let i = 1; i <= 35; i++) frontCounter[i] = 0
  for (let i = 1; i <= 12; i++) backCounter[i] = 0
  
  // 统计频率
  data.forEach(record => {
    record.front_numbers.forEach(num => {
      frontCounter[num] = (frontCounter[num] || 0) + 1
    })
    record.back_numbers.forEach(num => {
      backCounter[num] = (backCounter[num] || 0) + 1
    })
  })
  
  return { frontCounter, backCounter }
}

// 获取热门号码
function getHotNumbers(frontCounter, backCounter) {
  const hotFront = Object.entries(frontCounter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(item => parseInt(item[0]))
    .sort((a, b) => a - b)
  
  const hotBack = Object.entries(backCounter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(item => parseInt(item[0]))
    .sort((a, b) => a - b)
  
  return {
    front_numbers: hotFront,
    back_numbers: hotBack
  }
}

// 获取冷门号码
function getColdNumbers(frontCounter, backCounter) {
  const coldFront = Object.entries(frontCounter)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(item => parseInt(item[0]))
    .sort((a, b) => a - b)
  
  const coldBack = Object.entries(backCounter)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 2)
    .map(item => parseInt(item[0]))
    .sort((a, b) => a - b)
  
  return {
    front_numbers: coldFront,
    back_numbers: coldBack
  }
}

exports.main = async (event, context) => {
  try {
    // 从数据库获取历史数据
    const result = await db.collection('lottery_history')
      .orderBy('period', 'desc')
      .limit(1000)
      .get()
    
    const historyData = result.data
    
    if (historyData.length === 0) {
      return {
        success: false,
        message: '暂无历史数据'
      }
    }
    
    // 分析频率
    const { frontCounter, backCounter } = analyzeFrequency(historyData)
    
    // 获取预测结果
    const predictions = {
      hot_numbers: getHotNumbers(frontCounter, backCounter),
      cold_numbers: getColdNumbers(frontCounter, backCounter),
      data_count: historyData.length,
      last_update: new Date().toLocaleString('zh-CN')
    }
    
    return {
      success: true,
      data: predictions
    }
    
  } catch (error) {
    console.error('云函数执行错误:', error)
    return {
      success: false,
      message: '获取预测结果失败: ' + error.message
    }
  }
}