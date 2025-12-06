# 🚀 启动检查清单

## ✅ 开发环境检查

- [ ] 已安装微信开发者工具
- [ ] 已安装Python 3.x
- [ ] 已安装Node.js (用于npm)

## 📁 项目结构确认

当前项目应该包含：
```
彩票推荐_小程序/                 ← 微信开发者工具打开这个目录
├── project.config.json         ← 项目配置文件
├── miniprogram/                ← 小程序根目录
│   ├── package.json           ← npm依赖配置
│   ├── node_modules/          ← npm包
│   ├── app.js                ← 小程序入口
│   ├── app.json              ← 小程序配置
│   ├── pages/                ← 页面目录
│   │   ├── index/            ← 首页
│   │   └── history/          ← 历史页
│   └── utils/                ← 工具类
├── api-server/                ← API服务器
├── full_lottery_data.json     ← 数据文件
└── 文档/                     ← 各种文档
```

## 🔧 快速启动步骤

### 1. 打开项目
```
微信开发者工具 → 导入项目 → 选择 "彩票推荐_小程序" 文件夹
```

### 2. 构建NPM
```
工具 → 构建NPM
```
**✅ 成功标志：** 出现 `miniprogram/miniprogram_npm/` 目录

### 3. 启动API服务器
```bash
cd api-server
python app.py
```
**✅ 成功标志：** 看到 `API服务器已启动` 提示

### 4. 编译小程序
```
点击微信开发者工具中的 "编译" 按钮
```
**✅ 成功标志：** 小程序界面正常显示，TDesign组件渲染正确

## 🐛 常见问题解决

### 问题1：NPM构建失败
**症状：** `NPM packages not found`
**解决：** 
1. 确认打开的是项目根目录（不是miniprogram目录）
2. 删除 `miniprogram/node_modules` 重新 `npm install`
3. 查看 [NPM_BUILD_FIX.md](NPM_BUILD_FIX.md)

### 问题2：API连接失败
**症状：** 网络请求失败
**解决：**
1. 确保API服务器正在运行
2. 在开发设置中勾选"不校验合法域名"
3. 检查API地址是否正确

### 问题3：TDesign组件不显示
**症状：** 组件显示为空白
**解决：**
1. 确认已成功构建NPM
2. 检查 `app.json` 中是否正确引用组件
3. 查看控制台是否有错误信息

## 📱 功能测试清单

### 首页功能
- [ ] 数据状态正常显示
- [ ] "获取最新数据"按钮点击有反馈
- [ ] 4种推荐策略可切换
- [ ] 推荐号码正常生成
- [ ] 随机选号功能正常
- [ ] 号码在同一行显示
- [ ] 底部免责声明显示

### 历史页面功能  
- [ ] 历史数据正常加载
- [ ] 初始显示10期数据
- [ ] "加载更多"功能正常
- [ ] 数据按时间倒序排列

## 🔍 调试技巧

### 查看API状态
```bash
python test_api.py
```

### 检查数据文件
```bash
python3 check_setup.py
```

### 查看小程序日志
微信开发者工具 → 调试器 → Console

---

## 📞 获取帮助

如遇到问题：
1. 查看 [NPM_BUILD_FIX.md](NPM_BUILD_FIX.md) - NPM构建问题
2. 查看 [MINIPROGRAM_SETUP.md](MINIPROGRAM_SETUP.md) - 详细设置指南
3. 查看 [RUN_GUIDE.md](RUN_GUIDE.md) - 运行指南
4. 运行检查脚本：`python3 check_setup.py`

---

**记住最重要的两点：**
1. 🎯 用微信开发者工具打开**项目根目录**
2. 🔧 一定要**构建NPM**才能使用TDesign组件