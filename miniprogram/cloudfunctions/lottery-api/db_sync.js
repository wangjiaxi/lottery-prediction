// 数据库同步脚本 - 将本地数据同步到云开发数据库
const cloud = require('wx-server-sdk')
const fs = require('fs')
const path = require('path')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  try {
    // 读取本地数据文件
    const dataPath = path.join(__dirname, 'lottery_data.json')
    const fileContent = fs.readFileSync(dataPath, 'utf8')
    const lotteryData = JSON.parse(fileContent)
    
    console.log(`准备同步 ${lotteryData.length} 条数据到数据库`)
    
    // 清空现有数据
    await db.collection('lottery_data').get().then(res => {
      if (res.data.length > 0) {
        // 删除旧数据
        return Promise.all(res.data.map(doc => 
          db.collection('lottery_data').doc(doc._id).remove()
        ))
      }
    })
    
    // 批量插入新数据（分批处理，避免超出限制）
    const batchSize = 20
    let successCount = 0
    
    for (let i = 0; i < lotteryData.length; i += batchSize) {
      const batch = lotteryData.slice(i, i + batchSize)
      
      try {
        await Promise.all(batch.map(item => 
          db.collection('lottery_data').add({
            data: item
          })
        ))
        successCount += batch.length
        console.log(`已同步 ${successCount} / ${lotteryData.length} 条`)
      } catch (error) {
        console.error(`批量 ${i}-${i+batchSize} 同步失败:`, error)
      }
    }
    
    return {
      success: true,
      message: `数据同步完成`,
      totalCount: lotteryData.length,
      successCount: successCount
    }
    
  } catch (error) {
    console.error('数据同步失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}