# 云函数部署详细指南

## 🚀 第一步：开通云开发

### 1.1 在微信开发者工具中开通
1. 打开微信开发者工具
2. 点击顶部菜单 **"云开发"**
3. 点击 **"开通"** 按钮
4. 选择 **"按量付费"**（有免费额度）
5. 创建环境：
   - 环境名称：`lottery-api`
   - 环境ID：`cloud1-5gk8vs2q7ed3e658`（已配置）
   - 付费方式：按量付费

### 1.2 免费额度说明
```
- 云函数：每月免费100万次调用
- 数据库存储：免费2GB
- CDN流量：每月免费5GB
```

---

## 🔧 第二步：创建和部署云函数

### 2.1 创建云函数目录结构
确保目录结构如下：
```
miniprogram/
├── cloudfunctions/
│   └── lottery-api/
│       ├── index.js          # 云函数代码
│       └── package.json      # 依赖配置
├── app.js
└── ...
```

### 2.2 部署云函数
1. 在微信开发者工具中
2. 右键点击 `cloudfunctions/lottery-api` 文件夹
3. 选择 **"创建并部署：云端安装依赖"**
4. 等待部署完成（约1-2分钟）
5. 看到控制台显示 **"部署成功"**

---

## ⚙️ 第三步：修改小程序配置

### 3.1 修改 app.js
确保 `miniprogram/app.js` 配置正确：
```javascript
App({
  onLaunch() {
    console.log('大乐透预测小程序启动');
    
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-5gk8vs2q7ed3e658', // 你的云开发环境ID
        traceUser: true,
      });
      console.log('云开发初始化成功');
    }
  },

  globalData: {
    // 发布时改为false，开发时可为true
    isDev: false,
    // 云开发环境ID
    cloudEnv: 'cloud1-5gk8vs2q7ed3e658'
  }
})
```

### 3.2 验证云函数代码
确认 `miniprogram/cloudfunctions/lottery-api/index.js` 内容：
```javascript
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { action } = event
  switch (action) {
    case 'health':
      return { success: true, message: '云函数运行正常' }
    case 'data_status':
      return { success: true, total_records: 2, latest_period: '25138' }
    // ... 其他功能
  }
}
```

---

## 🧪 第四步：测试云函数

### 4.1 本地测试
在小程序开发者工具控制台中输入：
```javascript
// 测试云函数
wx.cloud.callFunction({
  name: 'lottery-api',
  data: { action: 'health' }
}).then(res => {
  console.log('测试结果:', res.result)
})
```

### 4.2 在页面中测试
在首页 `index.js` 中：
```javascript
// 测试云开发连接
testCloudFunction() {
  wx.cloud.callFunction({
    name: 'lottery-api',
    data: { action: 'health' }
  }).then(res => {
    console.log('云函数测试成功:', res.result)
  }).catch(err => {
    console.error('云函数测试失败:', err)
  })
}
```

---

## 📱 第五步：修改页面调用

### 5.1 确保API工具类正确
`miniprogram/utils/api.js` 应该包含：
```javascript
function callCloudFunction(data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'lottery-api',
      data: data,
      success: (res) => {
        if (res.result) {
          resolve(res.result)
        } else {
          reject(new Error('云函数返回空结果'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}
```

### 5.2 修改页面直接使用云函数
修改 `miniprogram/pages/index/index.js`：
```javascript
// 加载数据状态
loadDataStatus() {
  const that = this
  
  // 直接调用云函数
  wx.cloud.callFunction({
    name: 'lottery-api',
    data: { action: 'data_status' }
  }).then(res => {
    if (res.result.success) {
      that.setData({
        totalRecords: res.result.total_records || 0,
        latestPeriod: res.result.latest_period || '暂无'
      })
    }
  }).catch(err => {
    console.error('调用失败:', err)
    Toast({
      context: that,
      selector: '#t-toast',
      message: '云函数调用失败',
      theme: 'error'
    })
  })
},

// 更新数据
updateData() {
  const that = this
  
  if (that.data.updatingData) return
  that.setData({ updatingData: true })

  wx.cloud.callFunction({
    name: 'lottery-api',
    data: { action: 'update_data' }
  }).then(res => {
    that.setData({ updatingData: false })
    
    if (res.result.success) {
      Toast({
        context: that,
        selector: '#t-toast',
        message: '数据更新成功',
        theme: 'success'
      })
      that.loadDataStatus()
    } else {
      Toast({
        context: that,
        selector: '#t-toast',
        message: '更新失败',
        theme: 'error'
      })
    }
  }).catch(err => {
    that.setData({ updatingData: false })
    Toast({
      context: that,
      selector: '#t-toast',
      message: '云函数调用失败',
      theme: 'error'
    })
  })
}
```

---

## 🚀 第六步：编译和测试

### 6.1 本地测试
1. 点击 **"编译"** 按钮
2. 测试所有功能：
   - 数据状态显示
   - 获取最新数据
   - 生成推荐号码
   - 随机选号

### 6.2 上传体验版
1. 点击右上角 **"上传"**
2. 填写版本号：`1.0.0`
3. 版本说明：`云函数版本`
4. 等待上传完成

### 6.3 体验版测试
1. 进入微信小程序后台
2. 开发管理 → 开发版本
3. 选择体验版 → 生成体验版二维码
4. 扫码测试所有功能

---

## 🐛 常见问题解决

### Q1: 云函数创建失败
**解决方案：**
1. 确保已开通云开发
2. 检查环境ID是否正确
3. 重新创建云函数

### Q2: 云函数调用失败
**解决方案：**
1. 检查云函数是否部署成功
2. 查看云函数日志
3. 确认参数格式正确

### Q3: 体验版还是连接失败
**解决方案：**
1. 确保 `isDev: false`
2. 检查云开发环境ID
3. 重新上传体验版

### Q4: 云函数权限问题
**解决方案：**
```javascript
// 在云函数中添加权限检查
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  // 获取用户信息
  const wxContext = cloud.getWXContext()
  console.log('用户信息:', wxContext)
  
  // 验证是否来自小程序
  if (!wxContext.OPENID) {
    return { success: false, message: '非法调用' }
  }
  
  // 执行业务逻辑...
}
```

---

## 📋 检查清单

部署完成后，逐一检查：

- [ ] 云开发已开通
- [ ] 云函数部署成功
- [ ] 环境ID配置正确
- [ ] 云函数可正常调用
- [ ] 页面功能正常
- [ ] 开发版测试通过
- [ ] 体验版测试通过
- [ ] 错误处理完善

---

## 🎉 完成！

按照以上步骤完成后，你的小程序就可以在体验版中正常使用云函数了，不会再出现网络连接失败的问题。

云函数的优势：
- ✅ 无需配置域名
- ✅ 自动HTTPS
- ✅ 免费额度充足
- ✅ 部署简单
- ✅ 体验版立即可用

如果遇到任何问题，可以查看云开发控制台的日志来排查！