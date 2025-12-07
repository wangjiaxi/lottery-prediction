# 测试云函数策略的代码

## 在微信开发者工具控制台中测试

```javascript
// 测试全部数据策略
wx.cloud.callFunction({
  name: 'lottery-api',
  data: { action: 'get_predictions', strategy: 'all' }
}).then(res => {
  console.log('全部数据策略:', res.result.data)
})

// 测试最近3年策略
wx.cloud.callFunction({
  name: 'lottery-api',
  data: { action: 'get_predictions', strategy: '3years' }
}).then(res => {
  console.log('最近3年策略:', res.result.data)
})

// 测试今年策略
wx.cloud.callFunction({
  name: 'lottery-api',
  data: { action: 'get_predictions', strategy: 'thisYear' }
}).then(res => {
  console.log('今年策略:', res.result.data)
})

// 测试本月策略
wx.cloud.callFunction({
  name: 'lottery-api',
  data: { action: 'get_predictions', strategy: 'thisMonth' }
}).then(res => {
  console.log('本月策略:', res.result.data)
})
```

## 预期结果

不同策略应该返回：
- **不同的数据量** (data_count字段)
- **不同的推荐号码** (hot_numbers和cold_numbers)
- **策略名称** (strategy字段)

## 验证要点

1. 数据量应该不同
2. 推荐号码应该有差异
3. 冷热门号码应该基于真实数据分析