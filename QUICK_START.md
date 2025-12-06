# 快速启动指南

## 🚀 5分钟快速开始

### 第一步：安装依赖

```bash
# 进入小程序目录
cd miniprogram

# 安装npm依赖
npm install
```

### 第二步：构建npm（重要！）

1. 打开微信开发者工具
2. 导入项目，选择 `miniprogram` 目录
3. 点击菜单栏：**工具 -> 构建npm**
4. 等待构建完成（会生成 `miniprogram_npm` 目录）

### 第三步：获取初始数据

```bash
# 回到项目根目录
cd ..

# 运行数据爬虫
python data_crawler.py
```

执行成功后，会生成 `full_lottery_data.json` 文件。

### 第四步：启动API服务器

```bash
# 进入API服务器目录
cd api-server

# 安装Python依赖
pip install -r requirements.txt

# 启动服务器
python app.py
```

看到 `API服务启动在 http://0.0.0.0:5000` 表示成功。

### 第五步：配置小程序

1. 在微信开发者工具中，点击右上角"详情"
2. 进入"本地设置"
3. 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"
4. （可选）修改 `miniprogram/app.js` 中的 `apiBase` 地址

### 第六步：运行小程序

1. 在微信开发者工具中点击"编译"
2. 小程序应该能正常显示
3. 首页会显示数据状态

## ✅ 验证是否成功

### 首页功能测试

1. **数据状态** - 应该显示获取到的数据总量
2. **获取最新数据** - 点击按钮测试数据更新
3. **生成推荐号码** - 选择策略并生成推荐
4. **随机选号** - 点击随机生成按钮

### 历史数据页测试

1. 切换到"历史数据"标签
2. 应该显示最近10期数据
3. 点击"加载更多"测试分页功能

## ⚠️ 常见问题

### 1. npm构建失败

**问题**: 点击"构建npm"没有反应或报错

**解决**:
```bash
# 删除node_modules重新安装
cd miniprogram
rm -rf node_modules
npm install
```

然后在微信开发者工具中重新构建npm。

### 2. 组件找不到

**问题**: 控制台报错 "Component is not found in path..."

**解决**: 
- 确保已经执行"构建npm"
- 检查 `miniprogram_npm` 目录是否存在
- 检查 `app.json` 中的组件路径是否正确

### 3. API请求失败

**问题**: 提示"网络连接失败"

**解决**:
- 确保API服务器正在运行
- 检查 `app.js` 中的 `apiBase` 地址
- 确保已勾选"不校验合法域名"

### 4. 数据获取失败

**问题**: 点击"获取最新数据"无响应

**解决**:
```bash
# 手动运行爬虫
python data_crawler.py

# 检查是否生成了 full_lottery_data.json 文件
ls -lh full_lottery_data.json
```

### 5. 样式显示异常

**问题**: 页面布局混乱或组件样式不正常

**解决**:
- 清除缓存：工具 -> 清除缓存
- 重新编译项目
- 检查 `app.wxss` 是否正确加载

## 📱 开发环境要求

- **微信开发者工具**: 最新稳定版
- **Node.js**: v14.0.0 或更高版本
- **Python**: 3.11 或更高版本
- **操作系统**: macOS / Windows / Linux

## 🔧 推荐开发工具

- **VS Code**: 编辑代码
- **微信开发者工具**: 调试小程序
- **Postman**: 测试API接口
- **Git**: 版本控制

## 📚 下一步

成功启动后，建议阅读：

1. [MINIPROGRAM_SETUP.md](MINIPROGRAM_SETUP.md) - 详细开发指南
2. [README.md](README.md) - 项目完整文档
3. [TDesign文档](https://tdesign.tencent.com/miniprogram) - 组件库文档

## 💡 开发提示

### 热更新

修改代码后：
- `.wxml` / `.wxss` / `.js` 文件修改后会自动刷新
- `.json` 配置文件修改需要重新编译
- `npm` 包更新需要重新构建npm

### 调试技巧

1. **Console面板** - 查看日志输出
2. **Network面板** - 查看API请求
3. **Storage面板** - 查看本地存储
4. **Wxml面板** - 查看页面结构

### 数据管理

- 开发阶段每次修改API后重启服务器
- 定期备份 `full_lottery_data.json`
- 测试前确保有足够的历史数据

## 🎉 完成

现在你已经成功启动了小程序！开始探索各项功能吧。

如有问题，请查看文档或提交Issue。
