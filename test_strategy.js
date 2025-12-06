// 测试不同策略的推荐结果

// 模拟历史数据
const mockHistory = [
  { period: '25138', date: '2024-12-04', front_numbers: ['05', '12', '18', '25', '33'], back_numbers: ['04', '11'] },
  { period: '25137', date: '2024-12-02', front_numbers: ['08', '15', '22', '30', '35'], back_numbers: ['06', '09'] },
  { period: '25136', date: '2024-11-29', front_numbers: ['03', '11', '19', '26', '31'], back_numbers: ['07', '10'] },
  { period: '25135', date: '2023-12-04', front_numbers: ['09', '14', '21', '28', '34'], back_numbers: ['02', '08'] },
  { period: '25134', date: '2023-11-29', front_numbers: ['01', '07', '16', '23', '29'], back_numbers: ['05', '12'] }
]

// 分析函数（复制云函数逻辑）
function analyzeLotteryFrequency(data) {
  if (!data || data.length === 0) {
    return { hot_numbers: { front_numbers: [], back_numbers: [] }, cold_numbers: { front_numbers: [], back_numbers: [] } }
  }
  
  const frontCounter = {}
  const backCounter = {}
  
  for (let i = 1; i <= 35; i++) {
    frontCounter[i] = 0
  }
  for (let i = 1; i <= 12; i++) {
    backCounter[i] = 0
  }
  
  data.forEach(record => {
    if (record.front_numbers) {
      record.front_numbers.forEach(num => {
        const numInt = parseInt(num)
        if (numInt >= 1 && numInt <= 35) {
          frontCounter[numInt]++
        }
      })
    }
    
    if (record.back_numbers) {
      record.back_numbers.forEach(num => {
        const numInt = parseInt(num)
        if (numInt >= 1 && numInt <= 12) {
          backCounter[numInt]++
        }
      })
    }
  })
  
  const frontArray = Object.entries(frontCounter).map(([num, count]) => ({
    number: parseInt(num),
    count: count
  }))
  
  const backArray = Object.entries(backCounter).map(([num, count]) => ({
    number: parseInt(num),
    count: count
  }))
  
  const hotFront = frontArray
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .sort((a, b) => a.number - b.number)
    .map(item => item.number.toString().padStart(2, '0'))
  
  const hotBack = backArray
    .sort((a, b) => b.count - a.count)
    .slice(0, 2)
    .sort((a, b) => a.number - b.number)
    .map(item => item.number.toString().padStart(2, '0'))
  
  const coldFront = frontArray
    .filter(item => item.count > 0)
    .sort((a, b) => a.count - b.count)
    .slice(0, 5)
    .sort((a, b) => a.number - b.number)
    .map(item => item.number.toString().padStart(2, '0'))
  
  const coldBack = backArray
    .filter(item => item.count > 0)
    .sort((a, b) => a.count - b.count)
    .slice(0, 2)
    .sort((a, b) => a.number - b.number)
    .map(item => item.number.toString().padStart(2, '0'))
  
  return {
    hot_numbers: { front_numbers: hotFront, back_numbers: hotBack },
    cold_numbers: { front_numbers: coldFront, back_numbers: coldBack },
    total_analyzed: data.length
  }
}

// 策略筛选函数
function filterDataByStrategy(data, strategy) {
  if (strategy === 'all') return data
  
  const now = new Date()
  
  if (strategy === '3years') {
    const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate())
    return data.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= threeYearsAgo
    })
  }
  
  if (strategy === 'thisYear') {
    return data.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate.getFullYear() === now.getFullYear()
    })
  }
  
  if (strategy === 'thisMonth') {
    return data.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate.getFullYear() === now.getFullYear() && 
             itemDate.getMonth() === now.getMonth()
    })
  }
  
  return data
}

// 测试不同策略
const strategies = ['all', '3years', 'thisYear', 'thisMonth']
console.log('=== 号码推荐策略测试 ===')

strategies.forEach(strategy => {
  const filteredData = filterDataByStrategy(mockHistory, strategy)
  const predictions = analyzeLotteryFrequency(filteredData)
  
  console.log(`\n策略: ${strategy}`)
  console.log(`数据量: ${filteredData.length} 条`)
  console.log(`热门前区: ${predictions.hot_numbers.front_numbers.join(', ')}`)
  console.log(`热门后区: ${predictions.hot_numbers.back_numbers.join(', ')}`)
  console.log(`冷门前区: ${predictions.cold_numbers.front_numbers.join(', ')}`)
  console.log(`冷门后区: ${predictions.cold_numbers.back_numbers.join(', ')}`)
})