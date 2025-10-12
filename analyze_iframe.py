import requests
from bs4 import BeautifulSoup
import json
import re

def get_iframe_data():
    """获取iframe中的真实数据"""
    # 从JavaScript中提取的iframe URL
    base_url = "https://static.sporttery.cn/res_1_0/jcw/default/html/kj/"
    iframe_url = base_url + "dlt.html"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.lottery.gov.cn/'
    }
    
    try:
        print(f"正在访问iframe: {iframe_url}")
        response = requests.get(iframe_url, headers=headers, timeout=10)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            # 保存iframe内容
            with open('iframe_content.html', 'w', encoding='utf-8') as f:
                f.write(response.text)
            print("iframe内容已保存到 iframe_content.html")
            
            # 解析内容
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 查找表格
            tables = soup.find_all('table')
            print(f"iframe中找到 {len(tables)} 个表格")
            
            # 查找包含数字的行
            rows = soup.find_all('tr')
            print(f"找到 {len(rows)} 行数据")
            
            lottery_data = []
            for i, row in enumerate(rows[:10]):  # 查看前10行
                cells = row.find_all(['td', 'th'])
                if len(cells) >= 5:  # 至少要有期号和号码
                    row_text = [cell.get_text().strip() for cell in cells]
                    print(f"第{i+1}行: {row_text}")
                    
                    # 尝试提取期号和号码
                    if len(row_text) >= 3:
                        period = row_text[0] if row_text[0] else row_text[1]
                        if re.match(r'\d{5}', period):  # 期号格式
                            print(f"  -> 可能的期号: {period}")
                            
                            # 查找号码
                            for cell_text in row_text[1:]:
                                numbers = re.findall(r'\d{2}', cell_text)
                                if len(numbers) >= 5:
                                    print(f"  -> 可能的号码: {numbers}")
            
        else:
            print(f"请求失败: {response.status_code}")
            
    except Exception as e:
        print(f"错误: {e}")

if __name__ == "__main__":
    get_iframe_data()