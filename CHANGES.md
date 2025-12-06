# 变更日志

## Version 2.0.0 - 2025-11-12

### 🎉 重大更新：完全重构为TDesign小程序

#### 架构变更
- ❌ **移除**: Web版本（Flask前端、HTML/CSS/JS）
- ✅ **保留**: 微信小程序版本
- ✅ **升级**: 使用TDesign组件库重构UI

#### 新增功能

##### 首页
- ✅ 数据状态展示（总量、最新期次）
- ✅ 一键获取最新数据（自动爬虫）
- ✅ 智能推荐系统
  - 4种策略：全部数据、最近3年、今年、本月
  - 热门号码推荐（高频统计）
  - 冷门号码推荐（低频统计）
- ✅ 随机选号功能
- ✅ 号码统一显示（7个号码同行）
- ✅ 免责声明展示

##### 历史数据页
- ✅ 时间倒序展示
- ✅ 初始加载10期
- ✅ 分页加载（每次10期）
- ✅ 加载更多按钮
- ✅ 期次信息卡片展示

#### API增强

新增接口：
- `GET /api/health` - 健康检查
- `GET /api/data_status` - 数据状态
- `POST /api/update_data` - 更新数据（调用爬虫）
- `GET /api/get_predictions?strategy=xxx` - 智能推荐
- `GET /api/get_history?offset=0&limit=10` - 分页历史

推荐策略：
- `all` - 全部历史数据
- `3years` - 最近3年数据
- `thisYear` - 今年数据
- `thisMonth` - 本月数据

#### UI/UX改进

##### 组件使用
- `t-button` - 所有操作按钮
- `t-cell-group` - 数据状态展示
- `t-radio-group` - 策略选择
- `t-tag` - 标签展示
- `t-divider` - 内容分割
- `t-toast` - 提示反馈

##### 设计规范
- 采用TDesign设计语言
- 品牌蓝主题色 (#0052D9)
- 渐变色号码球
- 卡片式布局
- 统一圆角设计（16rpx）

#### 数据管理

##### 统一存储
- 单一数据文件：`full_lottery_data.json`
- 所有功能共享同一数据源
- 保证数据一致性

##### 数据格式
```json
{
  "period": "期次",
  "date": "日期",
  "front_numbers": ["前区5个号码"],
  "back_numbers": ["后区2个号码"],
  "sales_amount": "销售额",
  "pool_balance": "奖池余额"
}
```

#### 文件变更

##### 新增文件
```
miniprogram/
├── pages/index/
│   ├── index.wxml ✨ 新设计
│   ├── index.js ✨ 新功能
│   ├── index.wxss ✨ 新样式
│   └── index.json ✨ 新增
├── pages/history/
│   ├── history.wxml ✨ 新设计
│   ├── history.js ✨ 分页逻辑
│   ├── history.wxss ✨ 新样式
│   └── history.json ✨ 新增
├── utils/
│   └── api.js ✨ API封装
├── app.wxss ✨ 全局样式
└── package.json ✨ TDesign依赖

文档/
├── MINIPROGRAM_SETUP.md ✨ 开发指南
├── QUICK_START.md ✨ 快速启动
├── PROJECT_SUMMARY.md ✨ 项目总结
├── RUN_GUIDE.md ✨ 运行指南
├── CHANGES.md ✨ 本文件
├── check_setup.py ✨ 环境检查
├── test_api.py ✨ API测试
└── .gitignore ✨ Git配置
```

##### 删除文件
```
❌ app.py (Web主应用)
❌ predictor.py (预测算法)
❌ static/ (静态文件)
❌ templates/ (HTML模板)
❌ api/ (旧API)
❌ vercel.json (Vercel配置)
❌ Procfile (Heroku配置)
❌ runtime.txt
❌ VERCEL_DEPLOYMENT.md
❌ DEPLOYMENT.md
❌ deploy_to_github.sh
❌ cloud-studio.yaml
❌ cloud-studio-setup.md
❌ DEPLOYMENT_GUIDE.md
❌ 其他Web部署文件
```

##### 更新文件
```
✏️ README.md - 小程序专用文档
✏️ package.json - 更新脚本命令
✏️ api-server/app.py - 完全重写
✏️ miniprogram/app.js - 简化
✏️ miniprogram/app.json - 全局组件
```

#### 技术栈

##### 前端
- 微信小程序原生框架
- TDesign Miniprogram v1.x
- JavaScript ES6+

##### 后端
- Python 3.11
- Flask 3.0+
- Flask-CORS

##### 数据处理
- pandas
- BeautifulSoup4
- requests

#### 开发工具

##### 新增脚本
```bash
# 环境检查
python3 check_setup.py

# API测试
python3 test_api.py

# 启动API
npm run api

# 数据爬取
npm run crawler
npm run full-crawler
```

#### 兼容性

##### 支持
- ✅ 微信开发者工具 1.06.0+
- ✅ 小程序基础库 2.32.0+
- ✅ Python 3.8+
- ✅ Node.js 14+

##### 浏览器端
- ❌ 不再支持Web浏览器访问
- ✅ 仅支持微信小程序

#### 性能优化

- ✅ 分页加载历史数据
- ✅ API请求超时控制
- ✅ Toast统一提示管理
- ✅ 数据增量更新

#### 安全性

- ✅ CORS配置
- ✅ 请求超时设置
- ✅ 数据验证
- ✅ 错误处理

#### 文档完善

- ✅ README.md - 项目主文档
- ✅ QUICK_START.md - 5分钟快速启动
- ✅ MINIPROGRAM_SETUP.md - 详细开发指南
- ✅ RUN_GUIDE.md - 运行指南
- ✅ PROJECT_SUMMARY.md - 项目总结
- ✅ CHANGES.md - 变更日志

#### Bug修复

- ✅ 数据同步问题
- ✅ 号码显示格式统一
- ✅ 分页逻辑优化
- ✅ 错误提示完善

#### 已知问题

- ⚠️ 生产环境需要HTTPS
- ⚠️ 需要在微信公众平台配置服务器域名
- ⚠️ 爬虫依赖官方API稳定性

#### 升级指南

从v1.x升级：

1. **备份数据**
   ```bash
   cp full_lottery_data.json full_lottery_data.json.backup
   ```

2. **安装依赖**
   ```bash
   cd miniprogram
   npm install
   ```

3. **构建npm**
   - 在微信开发者工具中：工具 → 构建npm

4. **更新配置**
   - 修改 `app.js` 中的 `apiBase`
   - 配置 `project.config.json` 中的 AppID

5. **启动服务**
   ```bash
   npm run api
   ```

#### 迁移说明

##### 从Web版迁移
- Web版本已完全移除
- 所有功能已迁移至小程序
- 数据格式保持兼容
- API接口全新设计

##### 数据迁移
- 无需迁移，继续使用 `full_lottery_data.json`
- 新旧数据格式兼容
- 建议定期备份数据文件

#### 致谢

- TDesign团队 - 优秀的组件库
- 微信团队 - 小程序平台
- 贡献者 - 测试和反馈

---

**发布日期**: 2025年11月12日  
**版本号**: 2.0.0  
**状态**: ✅ 稳定版
