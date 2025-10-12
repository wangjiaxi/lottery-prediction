import requests
import json

def test_working_api():
    """测试有效的API接口"""
    url = "https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry"
    
    # 正确的参数格式
    params = {
        'gameNo': '85',
        'provinceId': '0', 
        'pageSize': 10,
        'isVerify': 1
    }
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://static.sporttery.cn/',
        'Accept': 'application/json, text/plain, */*'
    }
    
    try:
        response = requests.get(url, params=params, headers=headers, timeout=10)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("完整响应数据:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            if data.get('success') and data.get('value'):
                print("\n✅ API调用成功!")
                
                # 提取历史数据
                history_list = data['value'].get('historyPageListResult', {}).get('list', [])
                print(f"获取到 {len(history_list)} 条历史数据")
                
                for i, item in enumerate(history_list[:5]):  # 显示前5条
                    print(f"\n第{i+1}期:")
                    print(f"  期号: {item.get('lotteryDrawNum')}")
                    print(f"  开奖日期: {item.get('lotteryDrawTime')}")
                    print(f"  开奖结果: {item.get('lotteryDrawResult')}")
                    
                return True
            else:
                print(f"❌ API返回错误: {data.get('errorMessage')}")
                
        return False
        
    except Exception as e:
        print(f"请求失败: {e}")
        return False

if __name__ == "__main__":
    test_working_api()