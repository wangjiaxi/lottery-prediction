import requests
import json
import csv
import os
from datetime import datetime

class LotteryCrawler:
    def __init__(self):
        self.api_url = "https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry"
        self.data_file_json = "lottery_data.json"
        self.data_file_csv = "lottery_data.csv"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://static.sporttery.cn/',
            'Accept': 'application/json, text/plain, */*'
        }
        
    def get_lottery_data(self, limit=10):
        """从官方API获取大乐透开奖数据"""
        print("正在从官方API获取大乐透开奖数据...")
        
        # API参数
        params = {
            'gameNo': '85',  # 大乐透游戏编号
            'provinceId': '0', 
            'pageSize': limit,
            'isVerify': 1
        }
        
        try:
            response = requests.get(self.api_url, params=params, headers=self.headers, timeout=15)
            
            if response.status_code != 200:
                print(f"API请求失败，状态码: {response.status_code}")
                return []
            
            data = response.json()
            
            if not data.get('success'):
                print(f"API返回错误: {data.get('errorMessage', '未知错误')}")
                return []
            
            # 提取数据列表
            lottery_list = data.get('value', {}).get('list', [])
            
            if not lottery_list:
                print("API返回的数据列表为空")
                return []
            
            print(f"成功获取到 {len(lottery_list)} 条开奖数据")
            
            # 转换为标准格式
            lottery_data = []
            for item in lottery_list:
                try:
                    # 解析开奖结果
                    result_str = item.get('lotteryDrawResult', '')
                    numbers = result_str.split()
                    
                    if len(numbers) >= 7:
                        front_numbers = numbers[:5]  # 前区5个号码
                        back_numbers = numbers[5:7]  # 后区2个号码
                        
                        # 日期保持原样，API返回的数据是正确的
                        draw_time = item.get('lotteryDrawTime', '')
                        
                        lottery_data.append({
                            'period': item.get('lotteryDrawNum', ''),
                            'date': draw_time,
                            'front_numbers': front_numbers,
                            'back_numbers': back_numbers,
                            'sales_amount': item.get('totalSaleAmount', ''),
                            'pool_balance': item.get('poolBalanceAfterdraw', '')
                        })
                except Exception as e:
                    print(f"解析数据项时出错: {e}")
                    continue
            
            print(f"成功解析 {len(lottery_data)} 条有效数据")
            return lottery_data
                
        except Exception as e:
            print(f"获取数据时出错: {e}")
            return []
    
    def save_data(self, data):
        """保存数据到完整数据文件"""
        try:
            # 只保存到完整数据文件
            with open('full_lottery_data.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            print(f"数据已保存到 full_lottery_data.json")
            return True
            
        except Exception as e:
            print(f"保存数据时发生错误: {e}")
            return False
    
    def load_local_data(self):
        """从本地文件加载数据"""
        try:
            if os.path.exists(self.data_file_json):
                with open(self.data_file_json, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                return []
        except Exception as e:
            print(f"加载本地数据时发生错误: {e}")
            return []
    
    def update_data(self, limit=10):
        """更新数据 - 每次只获取最近10期并合并到完整数据文件"""
        print(f"正在获取最近 {limit} 期数据...")
        new_data = self.get_lottery_data(limit)
        
        # 验证数据有效性
        valid_data = []
        current_date = datetime.now()
        
        for item in new_data:
            try:
                # 验证期次格式
                period = item.get('period', '')
                if not period or len(period) != 5:
                    print(f"跳过无效期次: {period}")
                    continue
                
                # 日期验证 - 保持API原始数据
                item_date = item.get('date', '')
                
                # 验证号码格式
                front = item.get('front_numbers', [])
                back = item.get('back_numbers', [])
                
                if len(front) == 5 and len(back) == 2:
                    valid_data.append(item)
                else:
                    print(f"跳过号码格式错误的数据: {item}")
                    
            except Exception as e:
                print(f"验证数据时出错: {e}, 数据: {item}")
                continue
        
        print(f"验证后有效数据: {len(valid_data)} 条")
        new_data = valid_data
        
        if new_data:
            print(f"获取到 {len(new_data)} 期数据")
            
            # 加载完整数据文件
            full_data = []
            if os.path.exists('full_lottery_data.json'):
                with open('full_lottery_data.json', 'r', encoding='utf-8') as f:
                    full_data = json.load(f)
            
            # 去重合并数据
            existing_periods = {item['period'] for item in full_data} if full_data else set()
            
            # 只添加新的期次
            unique_new_data = [item for item in new_data if item['period'] not in existing_periods]
            
            # 额外验证：检查期次是否递增
            if full_data and unique_new_data:
                latest_period = full_data[0].get('period', '') if full_data else ''
                for new_item in unique_new_data:
                    new_period = new_item.get('period', '')
                    if new_period <= latest_period:
                        print(f"警告: 新期次 {new_period} 不大于最新期次 {latest_period}")
            
            if unique_new_data:
                all_data = unique_new_data + full_data
                print(f"新增 {len(unique_new_data)} 期数据:")
                for item in unique_new_data:
                    print(f"  期次 {item['period']}: {item['date']} {item['front_numbers']} + {item['back_numbers']}")
            else:
                all_data = full_data
                print("没有新的数据需要添加，数据已是最新")
            
            # 按期次排序（最新的在前面）
            all_data.sort(key=lambda x: x['period'], reverse=True)
            
            # 保存到完整数据文件
            try:
                with open('full_lottery_data.json', 'w', encoding='utf-8') as f:
                    json.dump(all_data, f, ensure_ascii=False, indent=2)
                

                
                print(f"成功更新完整数据，共 {len(all_data)} 条记录")
                return len(all_data)
            except Exception as e:
                print(f"保存完整数据时发生错误: {e}")
                return 0
        else:
            print("未获取到新数据，请检查网络连接")
            return 0

if __name__ == "__main__":
    crawler = LotteryCrawler()
    crawler.update_data()