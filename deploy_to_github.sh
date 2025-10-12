#!/bin/bash

# GitHub仓库部署脚本
# 使用方法：bash deploy_to_github.sh

echo "🚀 开始部署到GitHub..."

# 检查是否已初始化Git仓库
if [ ! -d ".git" ]; then
    echo "📁 初始化Git仓库..."
    git init
fi

# 添加所有文件到暂存区
echo "📦 添加文件到暂存区..."
git add .

# 提交更改
echo "💾 提交更改..."
git commit -m "部署大乐透预测系统到Vercel

- 适配Vercel部署配置
- 添加API路由适配
- 更新前端JavaScript路径
- 完善部署文档

功能特性：
✅ 静态页面展示
✅ 历史数据查询  
✅ 号码预测显示
✅ 响应式设计
⚠️ 数据更新功能受限（Vercel环境限制）"

# 检查是否已设置远程仓库
if git remote -v | grep -q "origin"; then
    echo "📡 推送到现有远程仓库..."
    git push origin main
else
    echo "⚠️ 请先设置GitHub远程仓库："
    echo "git remote add origin https://github.com/您的用户名/彩票推荐.git"
    echo "git branch -M main"
    echo "git push -u origin main"
    
    echo ""
    echo "📋 手动执行以下命令完成部署："
    echo "1. 在GitHub创建新仓库：https://github.com/new"
    echo "2. 仓库名：lottery-prediction"
    echo "3. 执行以下命令："
    echo "   git remote add origin https://github.com/您的用户名/lottery-prediction.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
fi

echo ""
echo "🎉 GitHub推送完成！"
echo ""
echo "📋 下一步："
echo "1. 访问 https://vercel.com"
echo "2. 使用GitHub账号登录"
echo "3. 导入刚推送的仓库"
echo "4. 一键部署到Vercel"
echo ""
echo "🌐 部署后访问地址：https://您的项目名.vercel.app"