#!/usr/bin/env python3
"""
环境检查脚本 - 验证开发环境是否配置正确
"""

import os
import sys
import json
import subprocess

def check_python_version():
    """检查Python版本"""
    print("检查 Python 版本...")
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"❌ Python版本过低: {version.major}.{version.minor}.{version.micro}")
        print("   需要 Python 3.8+")
        return False

def check_node_version():
    """检查Node.js版本"""
    print("\n检查 Node.js 版本...")
    try:
        result = subprocess.run(['node', '--version'], 
                              capture_output=True, text=True, timeout=5)
        version = result.stdout.strip()
        print(f"✅ Node.js {version}")
        return True
    except FileNotFoundError:
        print("❌ Node.js 未安装")
        print("   请访问 https://nodejs.org 下载安装")
        return False
    except Exception as e:
        print(f"❌ 检查失败: {e}")
        return False

def check_npm_version():
    """检查npm版本"""
    print("\n检查 npm 版本...")
    try:
        result = subprocess.run(['npm', '--version'], 
                              capture_output=True, text=True, timeout=5)
        version = result.stdout.strip()
        print(f"✅ npm {version}")
        return True
    except FileNotFoundError:
        print("❌ npm 未安装")
        return False
    except Exception as e:
        print(f"❌ 检查失败: {e}")
        return False

def check_data_file():
    """检查数据文件"""
    print("\n检查数据文件...")
    data_file = "full_lottery_data.json"
    
    if os.path.exists(data_file):
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                count = len(data)
                print(f"✅ 数据文件存在: {count} 条记录")
                if count > 0:
                    print(f"   最新期次: {data[0].get('period', 'N/A')}")
                return True
        except Exception as e:
            print(f"⚠️  数据文件存在但读取失败: {e}")
            return False
    else:
        print("⚠️  数据文件不存在")
        print("   运行: python data_crawler.py")
        return False

def check_miniprogram_deps():
    """检查小程序依赖"""
    print("\n检查小程序依赖...")
    miniprogram_path = "miniprogram"
    package_json = os.path.join(miniprogram_path, "package.json")
    node_modules = os.path.join(miniprogram_path, "node_modules")
    miniprogram_npm = os.path.join(miniprogram_path, "miniprogram_npm")
    
    if not os.path.exists(package_json):
        print("❌ package.json 不存在")
        return False
    
    if os.path.exists(node_modules):
        print("✅ node_modules 存在")
        
        # 检查TDesign
        tdesign_path = os.path.join(node_modules, "tdesign-miniprogram")
        if os.path.exists(tdesign_path):
            print("✅ tdesign-miniprogram 已安装")
        else:
            print("⚠️  tdesign-miniprogram 未安装")
            print("   运行: cd miniprogram && npm install")
    else:
        print("⚠️  node_modules 不存在")
        print("   运行: cd miniprogram && npm install")
        return False
    
    if os.path.exists(miniprogram_npm):
        print("✅ miniprogram_npm 已构建")
    else:
        print("⚠️  miniprogram_npm 未构建")
        print("   在微信开发者工具中: 工具 -> 构建npm")
        return False
    
    return True

def check_api_deps():
    """检查API依赖"""
    print("\n检查API服务依赖...")
    requirements_file = "api-server/requirements.txt"
    
    if not os.path.exists(requirements_file):
        print("❌ requirements.txt 不存在")
        return False
    
    try:
        # 尝试导入关键模块
        import flask
        print("✅ Flask 已安装")
        
        import flask_cors
        print("✅ Flask-CORS 已安装")
        
        return True
    except ImportError as e:
        print(f"⚠️  依赖缺失: {e}")
        print("   运行: cd api-server && pip install -r requirements.txt")
        return False

def check_project_structure():
    """检查项目结构"""
    print("\n检查项目结构...")
    
    required_paths = [
        "miniprogram/",
        "miniprogram/pages/index/",
        "miniprogram/pages/history/",
        "miniprogram/app.js",
        "miniprogram/app.json",
        "api-server/",
        "api-server/app.py",
        "data_crawler.py"
    ]
    
    all_exists = True
    for path in required_paths:
        if os.path.exists(path):
            print(f"✅ {path}")
        else:
            print(f"❌ {path} 缺失")
            all_exists = False
    
    return all_exists

def main():
    """主函数"""
    print("=" * 60)
    print("大乐透小程序 - 环境检查")
    print("=" * 60)
    
    results = []
    
    # 运行检查
    results.append(("Python版本", check_python_version()))
    results.append(("Node.js版本", check_node_version()))
    results.append(("npm版本", check_npm_version()))
    results.append(("项目结构", check_project_structure()))
    results.append(("数据文件", check_data_file()))
    results.append(("小程序依赖", check_miniprogram_deps()))
    results.append(("API依赖", check_api_deps()))
    
    # 汇总
    print("\n" + "=" * 60)
    print("检查结果汇总")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅" if result else "⚠️ "
        print(f"{status} {name}")
    
    print(f"\n通过: {passed}/{total}")
    
    if passed == total:
        print("\n🎉 环境配置完成！可以开始开发了。")
        print("\n下一步:")
        print("1. 启动API服务: npm run api")
        print("2. 打开微信开发者工具导入 miniprogram 目录")
        print("3. 在工具中构建npm（如果还没构建）")
        print("4. 点击编译运行小程序")
    else:
        print("\n⚠️  环境配置不完整，请按照提示完成配置。")
        print("\n参考文档: QUICK_START.md")
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    exit(main())
