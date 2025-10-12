import requests
import json
import re
from datetime import datetime, timedelta

def find_lottery_api():
    """尝试找到大乐透数据的API接口"""
    
    # 可能的API端点
    api_endpoints = [
        "https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry",
        "https://webapi.sporttery.cn/gateway/lottery/getHistoryListV1.qry", 
        "https://webapi.sporttery.cn/gateway/lottery/getHistoryPageList.qry",
        "https://www.lottery.gov.cn/api/lottery_kj_detail_new.jspx",
        "https://www.lottery.gov.cn/api/lottery_kj_list_new.jspx"
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.lottery.gov.cn/',
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
    }
    
    # 大乐透的参数
    params_list = [
        {'lotteryId': 'dlt', 'issueCount': 10},
        {'gameNo': '85', 'provinceId': '0', 'pageSize': 10, 'isVerify': 1},
        {'lottery_id': 'dlt', 'limit': 10},
        {'game_code': 'dlt', 'page': 1, 'size': 10}
    ]
    
    for endpoint in api_endpoints:
        print(f"\n尝试API: {endpoint}")
        
        for params in params_list:
            try:
                # GET请求
                response = requests.get(endpoint, params=params, headers=headers, timeout=10)
                print(f"GET {response.status_code}: {response.text[:200]}...")
                
                if response.status_code == 200 and len(response.text) > 100:
                    try:
                        data = response.json()
                        if isinstance(data, dict) and ('data' in data or 'result' in data):
                            print(f"✅ 找到有效API: {endpoint}")
                            print(f"参数: {params}")
                            return endpoint, params, data
                    except:
                        pass
                
                # POST请求
                response = requests.post(endpoint, json=params, headers=headers, timeout=10)
                print(f"POST {response.status_code}: {response.text[:200]}...")
                
                if response.status_code == 200 and len(response.text) > 100:
                    try:
                        data = response.json()
                        if isinstance(data, dict) and ('data' in data or 'result' in data):
                            print(f"✅ 找到有效API: {endpoint}")
                            print(f"参数: {params}")
                            return endpoint, params, data
                    except:
                        pass
                        
            except Exception as e:
                print(f"请求失败: {e}")
    
    print("\n❌ 未找到有效的API接口")
    return None, None, None

if __name__ == "__main__":
    find_lottery_api()