#!/bin/bash

# 腾讯云快速部署脚本
# 使用前提：已有腾讯云服务器

echo "🚀 开始部署API服务器到腾讯云..."

# 服务器信息（请替换为你的服务器信息）
SERVER_IP="YOUR_SERVER_IP"
SERVER_USER="root"
SERVER_PORT="22"

# 本地文件
PROJECT_DIR="/Users/wangjiaxi/Desktop/彩票推荐_小程序"
API_DIR="lottery-api"

echo "📦 打包API服务器文件..."
cd $PROJECT_DIR
tar -czf api-server.tar.gz api-server/

echo "📤 上传到服务器..."
scp -P $SERVER_PORT api-server.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

echo "🔧 在服务器上部署..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_IP << 'EOF'
# 安装依赖
apt update
apt install -y python3 python3-pip nginx

# 解压项目
cd /var/www
mkdir -p $API_DIR
tar -xzf /tmp/api-server.tar.gz -C $API_DIR --strip-components=1
cd $API_DIR

# 安装Python依赖
pip3 install -r requirements.txt

# 创建systemd服务
cat > /etc/systemd/system/lottery-api.service << 'EOL'
[Unit]
Description=Lottery API Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/lottery-api
ExecStart=/usr/bin/python3 app.py
Restart=always
Environment=PYTHONPATH=/var/www/lottery-api

[Install]
WantedBy=multi-user.target
EOL

# 启动服务
systemctl daemon-reload
systemctl enable lottery-api
systemctl start lottery-api

# 配置Nginx反向代理
cat > /etc/nginx/sites-available/lottery-api << 'EOL'
server {
    listen 80;
    server_name YOUR_DOMAIN.com;  # 替换为你的域名
    
    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOL

ln -s /etc/nginx/sites-available/lottery-api /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

echo "✅ 服务器部署完成"
EOF

echo "🧹 清理本地文件..."
rm api-server.tar.gz

echo "🎉 部署完成！"
echo "📝 请记得："
echo "1. 将 YOUR_SERVER_IP 替换为真实IP"
echo "2. 将 YOUR_DOMAIN.com 替换为真实域名"
echo "3. 申请SSL证书（推荐使用Let's Encrypt）"
echo "4. 在小程序后台配置域名"