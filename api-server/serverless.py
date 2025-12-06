# Vercel Serverless Entry Point
import json
import os
from datetime import datetime
from collections import Counter

# 模拟数据文件（Vercel环境）
MOCK_DATA = [
    {
        "period": "25138",
        "date": "2024-12-04",
        "front_numbers": ["05", "12", "18", "25", "33"],
        "back_numbers": ["04", "11"]
    }
]

def handler(request):
    """Vercel serverless handler"""
    try:
        # 解析请求路径
        path = request.path
        method = request.method
        
        # 路由分发
        if path == '/api/health' and method == 'GET':
            return health_check()
        elif path == '/api/data_status' and method == 'GET':
            return data_status()
        elif path == '/api/update_data' and method == 'POST':
            return update_data()
        elif path == '/api/get_predictions' and method == 'GET':
            strategy = request.args.get('strategy', 'all')
            return get_predictions(strategy)
        elif path == '/api/get_history' and method == 'GET':
            offset = int(request.args.get('offset', 0))
            limit = int(request.args.get('limit', 10))
            return get_history(offset, limit)
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'success': False, 'message': '接口不存在'})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'success': False, 'message': str(e)})
        }

def health_check():
    """健康检查"""
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': True,
            'message': 'API服务运行正常',
            'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    }

def data_status():
    """数据状态"""
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': True,
            'total_records': len(MOCK_DATA),
            'latest_period': MOCK_DATA[0]['period'] if MOCK_DATA else None
        })
    }

def update_data():
    """更新数据（模拟）"""
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': True,
            'message': '数据更新成功',
            'new_records': 0,
            'total_records': len(MOCK_DATA)
        })
    }

def get_predictions(strategy='all'):
    """获取预测号码（模拟）"""
    predictions = {
        'hot_numbers': {
            'front_numbers': ['05', '12', '18', '25', '33'],
            'back_numbers': ['04', '11']
        },
        'cold_numbers': {
            'front_numbers': ['01', '08', '15', '22', '30'],
            'back_numbers': ['02', '09']
        }
    }
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': True,
            'data': predictions,
            'strategy': strategy,
            'data_count': len(MOCK_DATA),
            'last_update': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    }

def get_history(offset=0, limit=10):
    """获取历史数据（模拟）"""
    # 生成更多模拟数据
    history_data = []
    for i in range(50):  # 生成50条模拟数据
        period = f"251{38-i:02d}"
        date = f"2024-12-{(4-i%30)+1:02d}"
        history_data.append({
            "period": period,
            "date": date,
            "front_numbers": [f"{(i*1+j*7)%35+1:02d}" for j in range(5)],
            "back_numbers": [f"{(i*3+j*5)%12+1:02d}" for j in range(2)]
        })
    
    # 分页
    page_data = history_data[offset:offset + limit]
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'success': True,
            'data': page_data,
            'total': len(history_data),
            'offset': offset,
            'limit': limit
        })
    }

# Vercel入口点
def lambda_handler(event, context):
    """AWS Lambda兼容入口点（Vercel使用）"""
    class MockRequest:
        def __init__(self, event):
            self.path = event.get('path', '')
            self.method = event.get('httpMethod', 'GET')
            self.args = event.get('queryStringParameters', {}) or {}
    
    request = MockRequest(event)
    response = handler(request)
    
    return {
        'statusCode': response['statusCode'],
        'headers': response['headers'],
        'body': response['body']
    }