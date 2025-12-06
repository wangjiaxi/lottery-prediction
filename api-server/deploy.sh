#!/bin/bash

# API服务部署脚本
echo "开始部署大乐透预测API服务..."

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python3"
    exit 1
fi

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "激活虚拟环境..."
source venv/bin/activate

# 安装依赖
echo "安装依赖包..."
pip install -r requirements.txt

# 检查数据文件
if [ ! -f "full_lottery_data.json" ]; then
    echo "初始化数据文件..."
    echo '[]' > full_lottery_data.json
fi

# 启动服务
echo "启动API服务..."
python app.py