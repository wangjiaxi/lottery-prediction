// 云函数：定时更新数据（需要配置定时触发器）
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 模拟从外部API获取数据（实际使用时需要实现真实的数据获取逻辑）
async function fetchLatestData() {
  // 这里应该调用真实的数据API
  // 目前返回模拟数据
  return [
    {
      period: "23119",
      date: "2023-10-18", 
      front_numbers: ["07", "13", "19", "24", "35"],
      back_numbers: ["04", "09"],
      sales_amount: "3.61亿元"
    }
  ]
}

exports.main = async (event, context) => {
  try {
    // 获取最新数据
    const newData = await fetchLatestData()
    
    if (newData.length === 0) {
      return {
        success: true,
        message: '没有新的数据需要更新',
        new_records: 0
      }
    }
    
    // 检查数据是否已存在
    const existingPeriods = await db.collection('lottery_history')
      .where({
        period: db.command.in(newData.map(item => item.period))
      })
      .get()
    
    const existingPeriodSet = new Set(existingPeriods.data.map(item => item.period))
    const uniqueNewData = newData.filter(item => !existingPeriodSet.has(item.period))
    
    if (uniqueNewData.length === 0) {
      return {
        success: true,
        message: '数据已是最新，无需更新',
        new_records: 0
      }
    }
    
    // 插入新数据
    for (const item of uniqueNewData) {
      await db.collection('lottery_history').add({
        data: item
      })
    }
    
    return {
      success: true,
      message: `成功更新 ${uniqueNewData.length} 条新数据`,
      new_records: uniqueNewData.length
    }
    
  } catch (error) {
    console.error('数据更新失败:', error)
    return {
      success: false,
      message: '数据更新失败: ' + error.message
    }
  }
}