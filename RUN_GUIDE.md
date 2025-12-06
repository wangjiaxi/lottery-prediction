# 🚀 运行指南

## 立即开始 (3步)

### 第1步: 构建小程序依赖

在**微信开发者工具**中：

1. 打开工具，点击"导入项目"
2. 选择 `miniprogram` 目录
3. 点击菜单：**工具 → 构建npm**
4. 等待构建完成（看到 `miniprogram_npm` 目录生成）

### 第2步: 启动API服务

打开终端，运行：

```bash
cd /Users/wangjiaxi/Desktop/彩票推荐_小程序
npm run api
```

看到 `API服务启动在 http://0.0.0.0:5000` 表示成功。

### 第3步: 运行小程序

在**微信开发者工具**中：

1. 点击右上角"详情"
2. 本地设置 → 勾选 "不校验合法域名..."
3. 点击"编译"
4. 小程序运行成功！

## 📱 功能演示

### 首次使用

1. **获取数据**
   - 点击首页的"获取最新数据"按钮
   - 等待数据爬取完成（约10-30秒）
   - 看到数据总量更新

2. **生成推荐**
   - 选择推荐策略（默认"全部数据"）
   - 点击"生成推荐号码"
   - 查看热门和冷门号码

3. **随机选号**
   - 点击"随机生成"按钮
   - 立即生成一组随机号码

4. **查看历史**
   - 切换到"历史数据"标签
   - 浏览开奖记录
   - 点击"加载更多"查看更多

## 🔧 常用命令

```bash
# 环境检查
python3 check_setup.py

# 测试API
python3 test_api.py

# 启动API服务
npm run api

# 手动更新数据
npm run crawler

# 完整数据爬取
npm run full-crawler
```

## ⚙️ 配置说明

### API地址配置

修改 `miniprogram/app.js`:

```javascript
globalData: {
  // 本地开发
  apiBase: 'http://localhost:5000/api'
  
  // 生产环境 (需要HTTPS)
  // apiBase: 'https://your-domain.com/api'
}
```

### 小程序AppID配置

修改 `miniprogram/project.config.json`:

```json
{
  "appid": "你的小程序AppID"
}
```

## 📊 数据说明

### 数据文件位置
```
/Users/wangjiaxi/Desktop/彩票推荐_小程序/full_lottery_data.json
```

### 数据格式
```json
[
  {
    "period": "24129",
    "date": "2024-11-11",
    "front_numbers": ["01", "05", "12", "23", "35"],
    "back_numbers": ["03", "11"],
    "sales_amount": "...",
    "pool_balance": "..."
  }
]
```

### 数据来源
- 官方API自动爬取
- 每次更新最多获取10期新数据
- 自动去重和排序

## 🐛 常见问题

### 1. 组件找不到

**错误**: `Component is not found in path "tdesign-miniprogram/button/button"`

**解决**:
```bash
cd miniprogram
rm -rf node_modules miniprogram_npm
npm install
# 然后在微信开发者工具中: 工具 → 构建npm
```

### 2. API请求失败

**错误**: 提示"网络连接失败"

**检查**:
- API服务是否在运行？
- 是否勾选了"不校验合法域名"？
- `app.js` 中的 `apiBase` 地址是否正确？

### 3. 数据为空

**解决**:
```bash
# 手动运行爬虫
python3 data_crawler.py
```

### 4. 构建npm失败

**解决**:
1. 确保 `package.json` 存在于 `miniprogram/` 目录
2. 检查 Node.js 版本 (需要 v14+)
3. 删除 `node_modules` 重新安装

## 📁 目录结构

```
当前项目/
├── miniprogram/           ← 在微信开发者工具中打开这个
│   ├── pages/
│   ├── app.js            ← 配置API地址
│   └── package.json
├── api-server/
│   └── app.py            ← API服务主文件
├── full_lottery_data.json ← 数据文件
└── README.md
```

## 🎯 快速测试

### 测试API服务
```bash
# 确保API正在运行，然后：
curl http://localhost:5000/api/health
# 应该返回: {"success": true, "message": "..."}
```

### 测试数据接口
```bash
curl http://localhost:5000/api/data_status
# 应该返回: {"success": true, "total_records": ..., "latest_period": "..."}
```

## 📚 进一步阅读

- **快速开始**: [QUICK_START.md](QUICK_START.md)
- **详细设置**: [MINIPROGRAM_SETUP.md](MINIPROGRAM_SETUP.md)
- **项目总结**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)
- **主文档**: [README.md](README.md)

## ⚡ 性能提示

### 提升响应速度
- 定期清理小程序缓存
- 保持数据文件不要过大（建议<5MB）
- 使用分页加载历史数据

### 节省流量
- 历史数据按需加载
- 避免频繁刷新数据
- 合理设置请求超时时间

## 🎉 开始使用

一切就绪！现在你可以：

1. ✅ 在微信开发者工具中编译运行
2. ✅ 测试所有功能
3. ✅ 根据需要调整配置
4. ✅ 准备发布到生产环境

有问题？查看 [QUICK_START.md](QUICK_START.md) 或提交 Issue。

---

**祝开发愉快！** 🎊
