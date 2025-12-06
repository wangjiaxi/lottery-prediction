// 云函数入口文件
const cloud = require('wx-server-sdk')
const fs = require('fs')
const path = require('path')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 数据文件路径（云存储中）
const DATA_FILE_PATH = path.join(__dirname, 'lottery_data.json')

/**
 * 读取数据文件
 */
function readDataFile() {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const data = fs.readFileSync(DATA_FILE_PATH, 'utf8')
      return JSON.parse(data)
    } else {
      return []
    }
  } catch (error) {
    console.error('读取数据文件失败:', error)
    return []
  }
}

/**
 * 写入数据文件
 */
function writeDataFile(data) {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error('写入数据文件失败:', error)
    return false
  }
}

/**
 * 获取数据状态
 */
function getDataStatus() {
  const data = readDataFile()
  const latestDraw = data.length > 0 ? data[0] : null
  
  return {
    success: true,
    data: {
      total_records: data.length,
      latest_draw: latestDraw ? {
        period: latestDraw.period,
        draw_date: latestDraw.draw_date,
        numbers: latestDraw.front_area.concat(latestDraw.back_area)
      } : null,
      last_updated: new Date().toISOString()
    }
  }
}

/**
 * 爬取最新数据（简化版本）
 */
async function crawlLatestData() {
  try {
    // 这里应该调用爬虫逻辑，但云函数环境受限
    // 暂时返回模拟更新
    const data = readDataFile()
    
    // 模拟更新成功
    return {
      success: true,
      message: '数据更新功能需要在云开发环境中配置定时触发器或手动调用爬虫服务',
      data_updated: false,
      current_records: data.length
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * 获取预测号码
 */
function getPredictions(strategy = 'all') {
  const data = readDataFile()
  
  if (data.length === 0) {
    return {
      success: false,
      error: '暂无历史数据'
    }
  }

  // 根据策略筛选数据
  let filteredData = filterDataByStrategy(data, strategy)
  
  if (filteredData.length === 0) {
    return {
      success: false,
      error: '指定策略下暂无数据'
    }
  }

  // 生成预测
  const predictions = generatePredictions(filteredData)
  
  return {
    success: true,
    strategy: strategy,
    data_count: filteredData.length,
    predictions: predictions
  }
}

/**
 * 根据策略筛选数据
 */
function filterDataByStrategy(data, strategy) {
  const now = new Date()
  
  switch (strategy) {
    case 'recent_3_years':
      const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate())
      return data.filter(item => new Date(item.draw_date) >= threeYearsAgo)
      
    case 'this_year':
      const thisYear = now.getFullYear()
      return data.filter(item => new Date(item.draw_date).getFullYear() === thisYear)
      
    case 'this_month':
      const thisMonth = now.getMonth()
      const currentYear = now.getFullYear()
      return data.filter(item => {
        const date = new Date(item.draw_date)
        return date.getFullYear() === currentYear && date.getMonth() === thisMonth
      })
      
    case 'all':
    default:
      return data
  }
}

/**
 * 生成预测号码
 */
function generatePredictions(data) {
  // 统计前区号码频率 (01-35)
  const frontFreq = {}
  for (let i = 1; i <= 35; i++) {
    frontFreq[i.toString().padStart(2, '0')] = 0
  }
  
  // 统计后区号码频率 (01-12)
  const backFreq = {}
  for (let i = 1; i <= 12; i++) {
    backFreq[i.toString().padStart(2, '0')] = 0
  }
  
  // 统计频率
  data.forEach(draw => {
    draw.front_area.forEach(num => {
      frontFreq[num]++
    })
    draw.back_area.forEach(num => {
      backFreq[num]++
    })
  })
  
  // 获取热门和冷门号码
  const frontHot = Object.entries(frontFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(item => item[0])
  
  const frontCold = Object.entries(frontFreq)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 10)
    .map(item => item[0])
  
  const backHot = Object.entries(backFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(item => item[0])
  
  const backCold = Object.entries(backFreq)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 6)
    .map(item => item[0])
  
  // 生成预测组合
  const hotPrediction = generateRandomCombination(frontHot, backHot)
  const coldPrediction = generateRandomCombination(frontCold, backCold)
  const randomPrediction = generateRandomCombination(
    Object.keys(frontFreq), 
    Object.keys(backFreq)
  )
  
  return {
    hot: hotPrediction,
    cold: coldPrediction,
    random: randomPrediction,
    statistics: {
      hot_front: frontHot.slice(0, 5),
      cold_front: frontCold.slice(0, 5),
      hot_back: backHot.slice(0, 3),
      cold_back: backCold.slice(0, 3)
    }
  }
}

/**
 * 生成随机组合
 */
function generateRandomCombination(frontPool, backPool) {
  const shuffledFront = [...frontPool].sort(() => Math.random() - 0.5)
  const shuffledBack = [...backPool].sort(() => Math.random() - 0.5)
  
  return {
    front_area: shuffledFront.slice(0, 5).sort(),
    back_area: shuffledBack.slice(0, 2).sort()
  }
}

/**
 * 获取历史数据
 */
function getHistory(offset = 0, limit = 10) {
  const data = readDataFile()
  const total = data.length
  const start = Math.min(offset, total)
  const end = Math.min(start + limit, total)
  const pageData = data.slice(start, end)
  
  return {
    success: true,
    data: pageData,
    pagination: {
      offset: start,
      limit: limit,
      total: total,
      has_more: end < total
    }
  }
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  const { action, ...params } = event
  
  console.log('云函数调用:', action, params)
  
  try {
    switch (action) {
      case 'health':
        return {
          success: true,
          message: '云函数运行正常',
          timestamp: new Date().toISOString()
        }
        
      case 'data_status':
        return getDataStatus()
        
      case 'update_data':
        return await crawlLatestData()
        
      case 'get_predictions':
        const { strategy = 'all' } = params
        return getPredictions(strategy)
        
      case 'get_history':
        const { offset = 0, limit = 10 } = params
        return getHistory(offset, limit)
        
      default:
        return {
          success: false,
          error: '未知操作',
          available_actions: ['health', 'data_status', 'update_data', 'get_predictions', 'get_history']
        }
    }
  } catch (error) {
    console.error('云函数执行错误:', error)
    return {
      success: false,
      error: error.message
    }
  }
}