// 云函数：初始化数据（一次性执行）
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 示例数据（实际使用时需要从外部API获取）
const sampleData = [
  {
    period: "23118",
    date: "2023-10-16",
    front_numbers: ["02", "09", "15", "22", "31"],
    back_numbers: ["03", "08"],
    sales_amount: "3.56亿元"
  },
  {
    period: "23117", 
    date: "2023-10-14",
    front_numbers: ["05", "11", "18", "26", "33"],
    back_numbers: ["02", "07"],
    sales_amount: "3.42亿元"
  }
]

exports.main = async (event, context) => {
  try {
    // 检查是否已有数据
    const countResult = await db.collection('lottery_history').count()
    
    if (countResult.total === 0) {
      // 插入示例数据
      await db.collection('lottery_history').add({
        data: sampleData
      })
      
      return {
        success: true,
        message: `成功初始化 ${sampleData.length} 条示例数据`,
        count: sampleData.length
      }
    } else {
      return {
        success: true,
        message: `数据库中已有 ${countResult.total} 条数据`,
        count: countResult.total
      }
    }
    
  } catch (error) {
    console.error('初始化数据失败:', error)
    return {
      success: false,
      message: '初始化数据失败: ' + error.message
    }
  }
}