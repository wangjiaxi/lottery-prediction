# 大乐透号码预测系统 - Vercel部署版

基于历史数据的智能彩票号码预测网站，已适配Vercel平台部署。

## 🌐 在线访问
- **Vercel部署地址**: https://lottery-prediction.vercel.app
- **GitHub仓库**: https://github.com/您的用户名/lottery-prediction

## 🚀 快速部署

### 一键部署到Vercel
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/您的用户名/lottery-prediction)

### 手动部署步骤
1. **Fork或克隆本仓库**
```bash
git clone https://github.com/您的用户名/lottery-prediction.git
cd lottery-prediction
```

2. **部署到Vercel**
   - 访问 [Vercel官网](https://vercel.com)
   - 使用GitHub账号登录
   - 导入本仓库
   - 一键部署

## 📋 功能特性

### ✅ 正常工作功能
- **静态页面展示** - 现代化响应式界面
- **历史数据查询** - 查看详细开奖记录
- **号码预测显示** - 基于静态数据的智能推荐
- **移动端适配** - 完美支持手机访问

### ⚠️ 受限功能（Vercel环境限制）
- **数据更新功能** - Serverless环境无法执行数据爬取
- **实时数据** - 使用预加载的静态数据文件

## 🔧 技术架构

### 后端技术
- **Python Flask** - Web框架（适配Vercel Serverless）
- **Vercel Functions** - 无服务器函数部署

### 前端技术  
- **HTML5/CSS3** - 页面结构和样式
- **JavaScript** - 动态交互功能
- **响应式设计** - 移动端适配

### 部署平台
- **Vercel** - 全球CDN加速
- **GitHub** - 代码版本管理

## 📁 项目结构

```
lottery-prediction/
├── api/
│   └── app.py              # Vercel适配的Flask应用
├── static/                # 静态资源
│   ├── style.css          # 主样式文件
│   ├── script.js          # 前端逻辑（已适配Vercel）
│   └── ...
├── templates/             # HTML模板
│   └── index.html         # 主页面
├── vercel.json           # Vercel配置文件
├── requirements.txt      # Python依赖
├── deploy_to_github.sh   # GitHub部署脚本
└── README_VERCEL.md      # 本文件
```

## 🎯 使用说明

1. **访问网站**：打开部署后的URL
2. **查看数据状态**：系统显示当前数据量
3. **生成推荐**：点击"生成推荐号码"查看预测结果
4. **查看历史**：点击"查看历史数据"浏览开奖记录

## 🔄 数据更新方案

由于Vercel环境限制，数据更新需要以下方式：

### 方案一：本地更新后重新部署
1. 在本地运行数据更新
2. 提交更新的数据文件到GitHub
3. Vercel自动重新部署

### 方案二：使用外部API服务
将数据爬取功能部署到其他云服务：
- Railway、Heroku、腾讯云SCF等

## 🌍 访问性能

- **全球CDN**：Vercel提供全球边缘节点
- **自动HTTPS**：免费SSL证书
- **即时缓存**：智能缓存策略
- **高可用性**：99.9%可用性保证

## 📊 监控分析

- **Vercel Analytics**：实时访问统计
- **性能监控**：API响应时间监控
- **错误追踪**：自动错误报告

## 🔒 安全特性

- **HTTPS加密**：全站SSL加密
- **安全头设置**：自动安全头配置
- **DDoS防护**：自动流量防护
- **隐私保护**：不收集用户数据

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目！

## 📄 许可证

本项目仅供学习和研究使用，请遵守相关法律法规。

## ⚠️ 免责声明

本系统提供的号码推荐仅供娱乐参考，不保证中奖概率。请理性购彩，量力而行。

---

**部署平台**: Vercel  
**最后更新**: 2025-10-12  
**技术支持**: GitHub Issues