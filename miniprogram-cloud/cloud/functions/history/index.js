// 云函数：获取历史数据
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const { limit = 10 } = event
    
    // 从数据库获取历史数据
    const result = await db.collection('lottery_history')
      .orderBy('period', 'desc')
      .limit(parseInt(limit))
      .get()
    
    return {
      success: true,
      data: result.data
    }
    
  } catch (error) {
    console.error('云函数执行错误:', error)
    return {
      success: false,
      message: '获取历史数据失败: ' + error.message
    }
  }
}