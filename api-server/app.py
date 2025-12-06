# API服务文件 - 用于微信小程序后端API
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os
import sys
from datetime import datetime, timedelta
from collections import Counter

# 添加父目录到路径以便导入爬虫模块
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 数据文件路径（使用项目根目录的文件）
DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'full_lottery_data.json')

@app.route('/api/data_status', methods=['GET'])
def data_status():
    """获取数据状态"""
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return jsonify({
                    'success': True,
                    'total_records': len(data),
                    'latest_period': data[0]['period'] if data else None
                })
        else:
            return jsonify({
                'success': True,
                'total_records': 0,
                'latest_period': None
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/get_predictions', methods=['GET'])
def get_predictions():
    """获取预测结果，支持不同策略"""
    try:
        strategy = request.args.get('strategy', 'all')
        
        if not os.path.exists(DATA_FILE):
            return jsonify({
                'success': False,
                'message': '暂无历史数据'
            })
        
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            all_data = json.load(f)
        
        # 根据策略筛选数据
        filtered_data = filter_by_strategy(all_data, strategy)
        
        if not filtered_data:
            return jsonify({
                'success': False,
                'message': '所选时间范围内暂无数据'
            })
        
        # 频率分析
        predictions = analyze_frequency(filtered_data)
        
        return jsonify({
            'success': True,
            'data': predictions,
            'strategy': strategy,
            'data_count': len(filtered_data),
            'last_update': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    except Exception as e:
        print(f"Error in get_predictions: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/get_history', methods=['GET'])
def get_history():
    """获取历史数据，支持分页"""
    try:
        offset = int(request.args.get('offset', 0))
        limit = int(request.args.get('limit', 10))
        
        if not os.path.exists(DATA_FILE):
            return jsonify({
                'success': True,
                'data': [],
                'total': 0
            })
        
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        total = len(data)
        # 分页返回数据
        page_data = data[offset:offset + limit]
        
        return jsonify({
            'success': True,
            'data': page_data,
            'total': total,
            'offset': offset,
            'limit': limit
        })
    except Exception as e:
        print(f"Error in get_history: {e}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/update_data', methods=['POST'])
def update_data():
    """更新数据 - 调用爬虫获取最新数据"""
    try:
        # 导入爬虫模块
        from data_crawler import LotteryCrawler
        
        crawler = LotteryCrawler()
        # 获取最新10期数据并更新
        total_records = crawler.update_data(limit=10)
        
        # 计算新增记录数
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                current_data = json.load(f)
                new_records = min(10, len(current_data))  # 最多新增10条
        else:
            new_records = 0
        
        return jsonify({
            'success': True,
            'message': '数据更新成功',
            'new_records': new_records,
            'total_records': total_records
        })
    except Exception as e:
        print(f"Error in update_data: {e}")
        return jsonify({
            'success': False,
            'message': f'更新失败: {str(e)}'
        }), 500

def filter_by_strategy(data, strategy):
    """根据策略筛选数据"""
    if strategy == 'all':
        return data
    
    now = datetime.now()
    
    if strategy == '3years':
        # 最近3年
        three_years_ago = now - timedelta(days=365*3)
        return [item for item in data if parse_date(item.get('date', '')) >= three_years_ago]
    
    elif strategy == 'thisYear':
        # 今年
        this_year = now.year
        return [item for item in data if parse_date(item.get('date', '')).year == this_year]
    
    elif strategy == 'thisMonth':
        # 本月
        this_month = (now.year, now.month)
        return [item for item in data if (parse_date(item.get('date', '')).year, 
                                          parse_date(item.get('date', '')).month) == this_month]
    
    return data

def parse_date(date_str):
    """解析日期字符串"""
    try:
        # 尝试多种日期格式
        for fmt in ['%Y-%m-%d', '%Y-%m-%d %H:%M:%S', '%Y/%m/%d']:
            try:
                return datetime.strptime(date_str, fmt)
            except ValueError:
                continue
        return datetime(2000, 1, 1)  # 默认日期
    except:
        return datetime(2000, 1, 1)

def analyze_frequency(data):
    """分析号码频率"""
    if not data:
        return {
            'hot_numbers': {'front_numbers': [], 'back_numbers': []},
            'cold_numbers': {'front_numbers': [], 'back_numbers': []}
        }
    
    # 统计前区和后区号码频率
    front_counter = Counter()
    back_counter = Counter()
    
    for record in data:
        # 处理前区号码
        front_nums = record.get('front_numbers', [])
        for num in front_nums:
            try:
                front_counter[int(num)] += 1
            except (ValueError, TypeError):
                continue
        
        # 处理后区号码
        back_nums = record.get('back_numbers', [])
        for num in back_nums:
            try:
                back_counter[int(num)] += 1
            except (ValueError, TypeError):
                continue
    
    # 热门号码（频率最高）- 取前5个前区，前2个后区
    hot_front = sorted(front_counter.items(), key=lambda x: x[1], reverse=True)[:5]
    hot_back = sorted(back_counter.items(), key=lambda x: x[1], reverse=True)[:2]
    
    # 冷门号码（频率最低）- 需要考虑所有可能的号码
    # 前区：1-35
    all_front = set(range(1, 36))
    front_freq = {num: front_counter.get(num, 0) for num in all_front}
    cold_front = sorted(front_freq.items(), key=lambda x: x[1])[:5]
    
    # 后区：1-12
    all_back = set(range(1, 13))
    back_freq = {num: back_counter.get(num, 0) for num in all_back}
    cold_back = sorted(back_freq.items(), key=lambda x: x[1])[:2]
    
    # 格式化为两位数字符串
    def format_num(num):
        return f"{num:02d}"
    
    return {
        'hot_numbers': {
            'front_numbers': [format_num(num) for num, _ in sorted(hot_front, key=lambda x: x[0])],
            'back_numbers': [format_num(num) for num, _ in sorted(hot_back, key=lambda x: x[0])]
        },
        'cold_numbers': {
            'front_numbers': [format_num(num) for num, _ in sorted(cold_front, key=lambda x: x[0])],
            'back_numbers': [format_num(num) for num, _ in sorted(cold_back, key=lambda x: x[0])]
        }
    }

@app.route('/api/health', methods=['GET'])
def health():
    """健康检查接口"""
    return jsonify({
        'success': True,
        'message': 'API服务运行正常',
        'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    })

if __name__ == '__main__':
    # 确保数据文件存在
    if not os.path.exists(DATA_FILE):
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False, indent=2)
        print(f"创建数据文件: {DATA_FILE}")
    
    print(f"数据文件路径: {DATA_FILE}")
    port = 5001
    print(f"API服务启动在 http://0.0.0.0:{port}")
    
    # 启动API服务
    app.run(host='0.0.0.0', port=port, debug=True)
