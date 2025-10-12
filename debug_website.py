import requests
from bs4 import BeautifulSoup

def analyze_website():
    url = "https://www.lottery.gov.cn/kj/kjlb.html?dlt"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            print(f"页面标题: {soup.title.string if soup.title else '无标题'}")
            
            # 保存HTML到文件查看
            with open('page_source.html', 'w', encoding='utf-8') as f:
                f.write(response.text)
            print("页面源码已保存到 page_source.html")
            
            # 查找表格
            tables = soup.find_all('table')
            print(f"找到 {len(tables)} 个表格")
            
            # 查找包含数字的元素
            import re
            elements = soup.find_all(text=re.compile(r'\d{2}'))
            print(f"包含两位数字的元素: {len(elements)} 个")
            
            if elements:
                print("前5个:")
                for i, text in enumerate(elements[:5]):
                    print(f"  {text.strip()}")
                    
    except Exception as e:
        print(f"错误: {e}")

if __name__ == "__main__":
    analyze_website()