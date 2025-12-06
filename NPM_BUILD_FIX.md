# NPM构建问题修复指南

## 🐛 问题描述
```
NPM packages not found. Please confirm npm packages which need to build are belong to `miniprogramRoot` directory.
```

## ✅ 解决方案

### 1️⃣ 正确的项目打开方式

**❌ 错误方式：**
- 在微信开发者工具中直接打开 `miniprogram/` 目录

**✅ 正确方式：**
- 在微信开发者工具中打开项目根目录 `彩票推荐_小程序/`
- 项目配置会自动识别 `miniprogram/` 作为小程序根目录

### 2️⃣ 构建NPM步骤

1. **打开项目根目录**
   ```
   微信开发者工具 → 打开项目 → 选择 "彩票推荐_小程序" 文件夹
   ```

2. **检查配置**
   - 确保 `project.config.json` 中设置了 `"miniprogramRoot": "miniprogram/"`
   - 确保 `setting.nodeModules` 为 `true`

3. **构建NPM**
   ```
   工具 → 构建NPM
   ```
   成功后会看到 `miniprogram/miniprogram_npm/` 目录

### 3️⃣ 验证构建结果

构建成功后应该看到：
```
miniprogram/
├── miniprogram_npm/
│   └── tdesign-miniprogram/
│       ├── button/
│       ├── cell/
│       ├── tag/
│       └── ...
└── ...
```

### 4️⃣ 如果仍然失败

手动清理并重新安装：

```bash
# 进入小程序目录
cd miniprogram

# 删除node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install

# 返回根目录
cd ..

# 重新用微信开发者工具打开项目根目录并构建NPM
```

## 🔧 项目配置说明

当前 `project.config.json` 配置：
- `miniprogramRoot`: "miniprogram/"
- `setting.nodeModules`: true
- `setting.packNpmManually`: false

这个配置告诉微信开发者工具：
- 小程序代码在 `miniprogram/` 目录
- 需要处理npm模块
- 使用自动构建模式

## 📱 测试步骤

1. 用微信开发者工具打开项目根目录
2. 等待项目加载完成
3. 点击"工具 → 构建NPM"
4. 查看控制台输出，应该显示构建成功
5. 检查 `miniprogram/miniprogram_npm/` 目录是否存在
6. 编译小程序，检查TDesign组件是否正常显示

## 🎯 快速命令

```bash
# 一键重置（如有问题）
cd miniprogram && rm -rf node_modules package-lock.json miniprogram_npm && npm install
```

---

**记住：** 微信开发者工具要打开项目根目录，不是miniprogram目录！