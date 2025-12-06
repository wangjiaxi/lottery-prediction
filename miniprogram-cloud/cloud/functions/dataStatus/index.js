// 云函数：获取数据状态
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // 获取数据总数
    const countResult = await db.collection('lottery_history').count()
    const totalRecords = countResult.total
    
    // 获取最新一期数据
    const latestResult = await db.collection('lottery_history')
      .orderBy('period', 'desc')
      .limit(1)
      .get()
    
    const latestPeriod = latestResult.data.length > 0 ? latestResult.data[0].period : null
    
    return {
      success: true,
      total_records: totalRecords,
      latest_period: latestPeriod
    }
    
  } catch (error) {
    console.error('云函数执行错误:', error)
    return {
      success: false,
      message: '获取数据状态失败: ' + error.message
    }
  }
}