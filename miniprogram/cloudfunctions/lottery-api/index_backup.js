// 云函数入口文件 - 大乐透API
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

// 读取本地数据文件
const fs = require('fs')
const path = require('path')

// 读取历史数据
let mockHistory = []
try {
  const dataPath = path.join(__dirname, 'lottery_data.json')
  if (fs.existsSync(dataPath)) {
    const fileContent = fs.readFileSync(dataPath, 'utf8')
    mockHistory = JSON.parse(fileContent) // 读取所有数据
    console.log(`成功加载 ${mockHistory.length} 条历史数据`)
  }
} catch (error) {
  console.error('读取数据文件失败:', error)
  // 使用默认数据
  mockHistory = [
    {
      period: '25138',
      date: '2024-12-04',
      front_numbers: ['05', '12', '18', '25', '33'],
      back_numbers: ['04', '11']
    }
  ]
}

exports.main = async (event, context) => {
  const { action, strategy = 'all', offset = 0, limit = 10 } = event
  
  try {
    switch (action) {
      case 'health':
        return {
          success: true,
          message: '云函数运行正常',
          timestamp: new Date().toISOString()
        }
        
      case 'data_status':
        return {
          success: true,
          total_records: mockHistory.length,
          latest_period: mockHistory[0]?.period || null,
          message: `当前数据量: ${mockHistory.length} 条`
        }
        
      case 'update_data':
        // 模拟更新数据
        return {
          success: true,
          message: '数据更新成功',
          new_records: 0,
          total_records: mockHistory.length
        }
        
      case 'get_predictions':
        // 根据策略筛选数据
        const filteredData = filterDataByStrategy(mockHistory, strategy)
        const predictions = analyzeLotteryFrequency(filteredData)
        
        return {
          success: true,
          data: predictions,
          strategy: strategy,
          data_count: filteredData.length,
          last_update: new Date().toISOString()
        }
        
      case 'get_history':
        const pageData = mockHistory.slice(offset, offset + limit)
        return {
          success: true,
          data: pageData,
          total: mockHistory.length,
          offset: offset,
          limit: limit,
          message: `返回 ${pageData.length} 条数据，总共 ${mockHistory.length} 条`
        }
        
      default:
        return {
          success: false,
          message: '未知操作'
        }
    }
  } catch (error) {
    console.error('云函数错误:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

