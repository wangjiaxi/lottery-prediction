# Vercel 部署指南

## 部署前准备

### 1. 注册Vercel账号
- 访问 [Vercel官网](https://vercel.com)
- 使用GitHub账号登录（推荐）
- 完成账号验证

### 2. 准备GitHub仓库
确保您的项目已经推送到GitHub仓库：
```bash
git init
git add .
git commit -m "准备Vercel部署"
git remote add origin https://github.com/yourusername/lottery-prediction.git
git push -u origin main
```

## 部署步骤

### 方法一：通过Vercel控制台部署（推荐）

1. **登录Vercel控制台**
   - 访问 https://vercel.com/dashboard
   - 点击 "New Project"

2. **导入GitHub仓库**
   - 选择您的GitHub账号
   - 授权Vercel访问仓库
   - 选择 "lottery-prediction" 仓库

3. **配置项目设置**
   - **Framework Preset**: Other
   - **Root Directory**: . (默认)
   - **Build Command**: 留空（Python项目不需要构建）
   - **Output Directory**: 留空
   - **Install Command**: `pip install -r requirements.txt`

4. **环境变量配置**
   - 不需要特殊环境变量
   - 保持默认设置即可

5. **开始部署**
   - 点击 "Deploy"
   - 等待部署完成（约2-5分钟）

### 方法二：通过Vercel CLI部署

1. **安装Vercel CLI**
```bash
npm install -g vercel
```

2. **登录Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
vercel
```

4. **按照提示配置**
- 是否覆盖现有设置？`y`
- 项目名称：`lottery-prediction`
- 其他设置保持默认

## 部署后配置

### 自定义域名（可选）
1. 在Vercel项目设置中点击 "Domains"
2. 添加您的自定义域名
3. 按照提示配置DNS记录

### 环境变量（如果需要）
在Vercel项目设置的 "Environment Variables" 中添加：
```
PYTHON_VERSION=3.9
```

## 访问您的应用

部署完成后，您将获得一个类似以下的URL：
- `https://lottery-prediction.vercel.app`
- 或您设置的自定义域名

## 功能说明

### ✅ 正常工作
- 静态页面展示
- 历史数据查询
- 号码预测显示（基于静态数据）
- 响应式设计

### ⚠️ 受限功能
- **数据更新功能**：Vercel Serverless环境无法执行数据爬取
- **实时数据**：使用预加载的静态数据文件

## 数据更新方案

由于Vercel的限制，数据更新需要以下替代方案：

### 方案一：本地更新后重新部署
1. 在本地运行数据更新：
```bash
python app.py
# 访问 http://localhost:8080/api/update_data 更新数据
```

2. 提交更新的数据文件到GitHub：
```bash
git add full_lottery_data.json
git commit -m "更新彩票数据"
git push
```

3. Vercel会自动重新部署

### 方案二：使用外部API（推荐）
将数据爬取功能部署到其他支持Python的云服务：
- **Railway**：支持Python后台任务
- **Heroku**：支持定时任务
- **腾讯云SCF**：国内云函数服务

## 故障排除

### 常见问题

1. **部署失败**
   - 检查 `requirements.txt` 文件是否存在
   - 确认Python版本兼容性
   - 查看Vercel部署日志

2. **API请求404**
   - 确认 `vercel.json` 配置正确
   - 检查API路由配置

3. **静态资源加载失败**
   - 确认静态文件路径正确
   - 检查Vercel的静态文件配置

### 查看日志
在Vercel控制台的 "Deployments" 中查看详细日志。

## 性能优化建议

1. **启用缓存**
   - 配置适当的缓存头
   - 使用Vercel的Edge缓存

2. **优化静态资源**
   - 压缩CSS/JS文件
   - 使用CDN加速

3. **监控性能**
   - 使用Vercel Analytics
   - 监控API响应时间

## 技术支持

- Vercel文档：https://vercel.com/docs
- Python部署指南：https://vercel.com/guides/python
- 问题反馈：GitHub Issues

---

**部署状态**: ✅ 配置完成  
**最后更新**: 2025-10-12  
**部署方式**: Vercel Serverless Functions