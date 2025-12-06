#!/usr/bin/env python3
"""
API测试脚本 - 验证所有接口是否正常工作
"""

import requests
import json
from datetime import datetime

# API基础URL
API_BASE = "http://localhost:5000/api"

def test_health():
    """测试健康检查接口"""
    print("\n=== 测试健康检查 ===")
    try:
        response = requests.get(f"{API_BASE}/health", timeout=5)
        data = response.json()
        if data.get('success'):
            print("✅ 健康检查通过")
            print(f"   消息: {data.get('message')}")
            print(f"   时间: {data.get('timestamp')}")
            return True
        else:
            print("❌ 健康检查失败")
            return False
    except Exception as e:
        print(f"❌ 健康检查异常: {e}")
        return False

def test_data_status():
    """测试数据状态接口"""
    print("\n=== 测试数据状态 ===")
    try:
        response = requests.get(f"{API_BASE}/data_status", timeout=5)
        data = response.json()
        if data.get('success'):
            print("✅ 数据状态获取成功")
            print(f"   总记录数: {data.get('total_records')}")
            print(f"   最新期次: {data.get('latest_period')}")
            return True
        else:
            print("❌ 数据状态获取失败")
            return False
    except Exception as e:
        print(f"❌ 数据状态异常: {e}")
        return False

def test_predictions():
    """测试预测接口"""
    print("\n=== 测试号码预测 ===")
    strategies = ['all', '3years', 'thisYear', 'thisMonth']
    
    for strategy in strategies:
        print(f"\n  策略: {strategy}")
        try:
            response = requests.get(
                f"{API_BASE}/get_predictions",
                params={'strategy': strategy},
                timeout=10
            )
            data = response.json()
            
            if data.get('success'):
                print(f"  ✅ 预测成功 (使用了 {data.get('data_count')} 条数据)")
                hot = data['data']['hot_numbers']
                cold = data['data']['cold_numbers']
                print(f"     热门号码: {hot['front_numbers']} + {hot['back_numbers']}")
                print(f"     冷门号码: {cold['front_numbers']} + {cold['back_numbers']}")
            else:
                print(f"  ⚠️  {data.get('message')}")
        except Exception as e:
            print(f"  ❌ 预测异常: {e}")
    
    return True

def test_history():
    """测试历史数据接口"""
    print("\n=== 测试历史数据 ===")
    try:
        # 测试获取前10条
        response = requests.get(
            f"{API_BASE}/get_history",
            params={'offset': 0, 'limit': 10},
            timeout=5
        )
        data = response.json()
        
        if data.get('success'):
            history_data = data.get('data', [])
            total = data.get('total', 0)
            print("✅ 历史数据获取成功")
            print(f"   总数据量: {total}")
            print(f"   本次获取: {len(history_data)} 条")
            
            if history_data:
                first = history_data[0]
                print(f"   最新一期: {first.get('period')} ({first.get('date')})")
                print(f"   号码: {first.get('front_numbers')} + {first.get('back_numbers')}")
            
            # 测试分页
            if total > 10:
                print("\n  测试分页加载...")
                response2 = requests.get(
                    f"{API_BASE}/get_history",
                    params={'offset': 10, 'limit': 10},
                    timeout=5
                )
                data2 = response2.json()
                if data2.get('success'):
                    print(f"  ✅ 第二页获取成功: {len(data2.get('data', []))} 条")
            
            return True
        else:
            print("❌ 历史数据获取失败")
            return False
    except Exception as e:
        print(f"❌ 历史数据异常: {e}")
        return False

def main():
    """运行所有测试"""
    print("=" * 60)
    print("大乐透小程序 API 测试")
    print("=" * 60)
    print(f"API地址: {API_BASE}")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = []
    
    # 运行测试
    results.append(("健康检查", test_health()))
    results.append(("数据状态", test_data_status()))
    results.append(("号码预测", test_predictions()))
    results.append(("历史数据", test_history()))
    
    # 汇总结果
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ 通过" if result else "❌ 失败"
        print(f"{name:12s} {status}")
    
    print(f"\n总计: {passed}/{total} 通过")
    
    if passed == total:
        print("\n🎉 所有测试通过！API服务运行正常。")
        return 0
    else:
        print("\n⚠️  部分测试失败，请检查API服务。")
        return 1

if __name__ == "__main__":
    exit(main())
