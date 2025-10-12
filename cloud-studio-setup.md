# Cloud Studio 部署指南

## 快速部署步骤

### 1. 创建Cloud Studio工作空间
1. 登录腾讯云Cloud Studio
2. 点击"新建工作空间"
3. 选择"空模板"或"Python模板"
4. 工作空间名称：`lottery-prediction`

### 2. 上传项目代码
**方法一：Git克隆**
```bash
git clone https://github.com/wangjiaxi/lottery-prediction.git
cd lottery-prediction
```

**方法二：直接上传**
- 将项目所有文件拖拽到Cloud Studio文件管理器
- 确保文件结构保持不变

### 3. 安装依赖
在终端中执行：
```bash
pip install -r requirements.txt
```

### 4. 启动应用
```bash
python3 app.py
```

### 5. 访问应用
- Cloud Studio会自动生成预览地址
- 格式：`https://{workspace-id}-8080.app.coding.net`
- 点击终端中的"端口"标签查看访问链接

## 环境配置详情

### 端口配置
- **应用端口**：8080
- **外部访问**：Cloud Studio自动映射
- **协议**：HTTP/HTTPS

### 文件结构要求
```
lottery-prediction/
├── app.py              # 主应用文件
├── requirements.txt    # 依赖列表
├── static/            # 静态资源
├── templates/          # 模板文件
├── predictor.py        # 预测算法
├── data_crawler.py    # 数据爬虫
└── full_lottery_data.json  # 历史数据
```

### 依赖包清单
```txt
flask==2.3.3
requests==2.31.0
pandas==2.0.3
beautifulsoup4==4.12.2
lxml==4.9.3
```

## 常见问题解决

### 端口被占用
如果8080端口被占用，修改app.py中的端口：
```python
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)  # 改为5000或其他端口
```

### 依赖安装失败
尝试使用国内镜像源：
```bash
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 数据文件缺失
首次运行会自动生成数据文件，或手动执行：
```bash
python3 full_data_crawler.py
```

## 自动化部署脚本

创建 `setup.sh` 文件：
```bash
#!/bin/bash
echo "正在安装依赖..."
pip install -r requirements.txt

echo "正在检查数据文件..."
if [ ! -f "full_lottery_data.json" ]; then
    echo "正在生成数据文件..."
    python3 full_data_crawler.py
fi

echo "启动应用..."
python3 app.py
```

## 访问地址格式
成功部署后，访问地址格式为：
```
https://{workspace-id}-8080.app.coding.net
```

其中 `{workspace-id}` 是Cloud Studio分配的工作空间ID。