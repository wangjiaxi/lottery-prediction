# 云函数测试代码

## 在微信开发者工具控制台中测试

打开小程序 → 切换到 "Console" 标签 → 输入以下代码：

```javascript
// 测试1：健康检查
wx.cloud.callFunction({
  name: 'lottery-api',
  data: { action: 'health' }
}).then(res => {
  console.log('✅ 健康检查成功:', res.result)
}).catch(err => {
  console.error('❌ 健康检查失败:', err)
})

// 测试2：数据状态
wx.cloud.callFunction({
  name: 'lottery-api',
  data: { action: 'data_status' }
}).then(res => {
  console.log('✅ 数据状态:', res.result)
}).catch(err => {
  console.error('❌ 数据状态失败:', err)
})

// 测试3：获取推荐
wx.cloud.callFunction({
  name: 'lottery-api',
  data: { action: 'get_predictions', strategy: 'all' }
}).then(res => {
  console.log('✅ 获取推荐:', res.result)
}).catch(err => {
  console.error('❌ 获取推荐失败:', err)
})

// 测试4：历史数据
wx.cloud.callFunction({
  name: 'lottery-api',
  data: { action: 'get_history', offset: 0, limit: 5 }
}).then(res => {
  console.log('✅ 历史数据:', res.result)
}).catch(err => {
  console.error('❌ 历史数据失败:', err)
})
```

## 测试成功的标志

看到以下输出表示云函数工作正常：
```
✅ 健康检查成功: {success: true, message: "云函数运行正常"}
✅ 数据状态: {success: true, total_records: 5, latest_period: "25138"}
```

## 如果测试失败

1. **检查云函数是否部署成功**
2. **确认环境ID正确**
3. **查看云开发控制台的日志**
4. **重新部署云函数**