import requests
import json
import csv
import time
from datetime import datetime

class FullDataCrawler:
    def __init__(self):
        self.api_url = "https://webapi.sporttery.cn/gateway/lottery/getHistoryPageListV1.qry"
        self.output_json = "full_lottery_data.json"
        self.output_csv = "full_lottery_data.csv"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Referer': 'https://static.sporttery.cn/',
            'Accept': 'application/json, text/plain, */*'
        }
        
    def get_total_pages(self):
        """获取总页数"""
        params = {
            'gameNo': '85',
            'provinceId': '0',
            'pageSize': 1,  # 只获取1条数据来获取分页信息
            'isVerify': 1
        }
        
        try:
            response = requests.get(self.api_url, params=params, headers=self.headers, timeout=15)
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    total = data.get('value', {}).get('total', 0)
                    page_size = data.get('value', {}).get('pageSize', 10)
                    pages = data.get('value', {}).get('pages', 0)
                    
                    print(f"总记录数: {total}")
                    print(f"每页大小: {page_size}")
                    print(f"总页数: {pages}")
                    return pages, total
            return 0, 0
        except Exception as e:
            print(f"获取分页信息失败: {e}")
            return 0, 0
    
    def get_page_data(self, page_no, page_size=100):
        """获取指定页的数据"""
        params = {
            'gameNo': '85',
            'provinceId': '0',
            'pageSize': page_size,
            'pageNo': page_no,
            'isVerify': 1
        }
        
        try:
            print(f"正在获取第 {page_no} 页数据...")
            response = requests.get(self.api_url, params=params, headers=self.headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    lottery_list = data.get('value', {}).get('list', [])
                    print(f"第 {page_no} 页获取到 {len(lottery_list)} 条数据")
                    return lottery_list
                else:
                    print(f"第 {page_no} 页API返回错误: {data.get('errorMessage')}")
            else:
                print(f"第 {page_no} 页请求失败，状态码: {response.status_code}")
                
            return []
        except Exception as e:
            print(f"第 {page_no} 页获取数据失败: {e}")
            return []
    
    def parse_lottery_data(self, lottery_list):
        """解析开奖数据"""
        parsed_data = []
        
        for item in lottery_list:
            try:
                # 解析开奖结果
                result_str = item.get('lotteryDrawResult', '')
                numbers = result_str.split()
                
                if len(numbers) >= 7:
                    front_numbers = numbers[:5]  # 前区5个号码
                    back_numbers = numbers[5:7]  # 后区2个号码
                    
                    parsed_data.append({
                        'period': item.get('lotteryDrawNum', ''),
                        'date': item.get('lotteryDrawTime', ''),
                        'front_numbers': front_numbers,
                        'back_numbers': back_numbers,
                        'sales_amount': item.get('totalSaleAmount', ''),
                        'pool_balance': item.get('poolBalanceAfterdraw', ''),
                        'draw_time': item.get('lotteryDrawTime', ''),
                        'unsorted_result': item.get('lotteryUnsortDrawresult', '')
                    })
            except Exception as e:
                print(f"解析数据项时出错: {e}")
                continue
        
        return parsed_data
    
    def save_data(self, data):
        """保存数据到文件"""
        try:
            # 按期次排序（最新的在前面）
            data.sort(key=lambda x: x['period'], reverse=False)
            
            # 保存为JSON格式
            with open(self.output_json, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            
            # 保存为CSV格式
            with open(self.output_csv, 'w', newline='', encoding='utf-8') as f:
                writer = csv.writer(f)
                writer.writerow(['期次', '开奖日期', '前区1', '前区2', '前区3', '前区4', '前区5', '后区1', '后区2', '销售额', '奖池金额', '未排序结果'])
                
                for item in data:
                    row = [
                        item['period'],
                        item['date'],
                        *item['front_numbers'],
                        *item['back_numbers'],
                        item.get('sales_amount', ''),
                        item.get('pool_balance', ''),
                        item.get('unsorted_result', '')
                    ]
                    writer.writerow(row)
            
            print(f"完整数据已保存到 {self.output_json} 和 {self.output_csv}")
            return True
            
        except Exception as e:
            print(f"保存数据时发生错误: {e}")
            return False
    
    def crawl_all_data(self):
        """爬取所有历史数据"""
        print("开始爬取大乐透完整历史数据...")
        
        # 获取总页数
        total_pages, total_records = self.get_total_pages()
        
        if total_pages == 0:
            print("无法获取分页信息，尝试默认爬取前10页")
            total_pages = 10
        
        print(f"预计需要爬取 {total_pages} 页数据")
        
        all_data = []
        page_size = 100  # 每页获取100条数据
        
        for page_no in range(1, total_pages + 1):
            page_data = self.get_page_data(page_no, page_size)
            if page_data:
                parsed_data = self.parse_lottery_data(page_data)
                all_data.extend(parsed_data)
                print(f"已获取 {len(all_data)} 条数据")
                
                # 添加延迟避免请求过快
                time.sleep(0.5)
            else:
                print(f"第 {page_no} 页获取失败，停止爬取")
                break
        
        if all_data:
            # 去重（按期次）
            unique_data = {}
            for item in all_data:
                unique_data[item['period']] = item
            
            final_data = list(unique_data.values())
            final_data.sort(key=lambda x: x['period'], reverse=True)  # 按期次倒序
            
            print(f"去重后共获得 {len(final_data)} 条唯一数据")
            
            # 保存数据
            if self.save_data(final_data):
                print(f"✅ 爬取完成！共保存 {len(final_data)} 条大乐透历史开奖数据")
                return True
            else:
                print("❌ 数据保存失败")
                return False
        else:
            print("❌ 未获取到任何数据")
            return False

def main():
    crawler = FullDataCrawler()
    crawler.crawl_all_data()

if __name__ == "__main__":
    main()