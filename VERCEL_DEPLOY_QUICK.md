# 🚀 Vercel快速部署指南

## 方案一：使用Vercel部署API（最简单）

### 1. 安装Vercel CLI
```bash
npm i -g vercel
```

### 2. 创建vercel.json配置
在`api-server`目录创建`vercel.json`：
```json
{
  "version": 2,
  "builds": [
    {
      "src": "app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "app.py"
    }
  ]
}
```

### 3. 部署到Vercel
```bash
cd api-server
vercel --prod
```

### 4. 获取部署URL
部署后会得到类似URL：`https://lottery-api-xxx.vercel.app`

### 5. 修改小程序配置
更新`miniprogram/app.js`：
```javascript
globalData: {
  apiBase: 'https://lottery-api-xxx.vercel.app', // 替换为你的Vercel URL
  isDev: false
}
```

---

## 方案二：使用腾讯云服务器（推荐生产环境）

### 1. 购买腾讯云服务器
- 系统：Ubuntu 20.04 LTS
- 配置：1核2G（最低要求）
- 带宽：1Mbps起步

### 2. 使用快速部署脚本
```bash
chmod +x DEPLOY_CLOUD_API.sh
./DEPLOY_CLOUD_API.sh
```

### 3. 配置域名和SSL
```bash
# 安装SSL证书
apt install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

### 4. 修改小程序配置
```javascript
globalData: {
  apiBase: 'https://your-domain.com', // 替换为你的域名
  isDev: false
}
```

---

## 方案三：使用免费的云函数

### 1. 微信云开发（推荐）
在小程序中使用云函数替代外部API：

#### 创建云函数
```javascript
// cloudfunctions/lottery-api/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

exports.main = async (event, context) => {
  const { action } = event
  
  switch(action) {
    case 'data_status':
      return { success: true, total_records: 2793, latest_period: '25138' }
    // 其他功能...
  }
}
```

#### 修改小程序调用
```javascript
// 直接使用云函数，无需网络配置
const res = await wx.cloud.callFunction({
  name: 'lottery-api',
  data: { action: 'data_status' }
})
```

---

## 📋 小程序域名配置

### 1. 登录微信公众平台
进入：开发 -> 开发管理 -> 开发设置 -> 服务器域名

### 2. 配置request合法域名
添加：
```
https://your-domain.com
https://lottery-api-xxx.vercel.app
```

### 3. 配置uploadFile合法域名（如需要）
添加相同的域名

### 4. 重新上传体验版
域名配置生效后，需要重新上传体验版

---

## ⚡ 快速测试

### 本地测试
```bash
# 测试API是否可访问
curl https://your-domain.com/api/health
```

### 小程序测试
1. 重新编译小程序
2. 上传体验版
3. 测试各项功能

---

## 🐛 常见问题

### Q: 体验版还是连接失败？
A: 检查以下几点：
- 域名是否正确配置在小程序后台
- SSL证书是否有效（必须HTTPS）
- 服务器是否正常运行
- API路径是否正确

### Q: Vercel部署失败？
A: 可能的原因：
- Python版本兼容性
- 依赖包过大
- 超时限制

### Q: 腾讯云部署复杂？
A: 使用脚本可以一键部署，或者选择Vercel方案

---

## 🎯 推荐方案选择

| 需求 | 推荐方案 | 原因 |
|------|----------|------|
| 快速测试 | Vercel | 免费，部署简单 |
| 生产环境 | 腾讯云 | 稳定，可控性强 |
| 最简单 | 云开发 | 无需服务器配置 |

选择最适合你需求的方案进行部署！