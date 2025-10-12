from flask import Flask, render_template, jsonify, request
import os
import json
import sys
import logging

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# 尝试导入本地模块，如果失败则返回模拟数据
try:
    from data_crawler import LotteryCrawler
    from predictor import LotteryPredictor
    
    # 初始化爬虫和预测器
    crawler = LotteryCrawler()
    predictor = LotteryPredictor()
    
    # 标记为本地模式
    LOCAL_MODE = True
except ImportError as e:
    logger.warning(f"本地模块导入失败: {e}")
    LOCAL_MODE = False

def get_static_data():
    """获取静态数据"""
    data_file = 'full_lottery_data.json'
    if os.path.exists(data_file):
        try:
            with open(data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"读取数据文件失败: {e}")
    return []

@app.route('/')
def index():
    """主页 - 重定向到静态页面"""
    return render_template('index.html')

@app.route('/api/update_data', methods=['POST'])
def update_data():
    """更新数据API"""
    if not LOCAL_MODE:
        return jsonify({
            'success': False,
            'message': 'Vercel部署模式下数据更新功能受限'
        })
    
    try:
        # 获取更新前的数据状态
        before_data = get_static_data()
        before_count = len(before_data)
        
        # 获取最新数据
        count = crawler.update_data()
        
        # 刷新预测器数据
        predictor.refresh_data()
        
        # 获取更新后的数据状态
        after_data = get_static_data()
        after_count = len(after_data)
        
        new_records = after_count - before_count
        
        if new_records > 0:
            message = f'数据更新成功！新增 {new_records} 条记录，当前共 {after_count} 条记录'
        else:
            message = f'数据已是最新，没有新的开奖记录，当前共 {after_count} 条记录'
        
        return jsonify({
            'success': True,
            'message': message,
            'count': count,
            'new_records': new_records,
            'total_records': after_count
        })
    except Exception as e:
        logger.error(f"数据更新失败: {e}")
        return jsonify({
            'success': False,
            'message': f'数据更新失败: {str(e)}'
        })

@app.route('/api/get_predictions', methods=['GET'])
def get_predictions():
    """获取预测结果API"""
    try:
        if LOCAL_MODE:
            # 刷新预测器数据
            predictor.refresh_data()
            # 获取预测结果
            predictions = predictor.get_predictions()
        else:
            # 静态模式下的模拟数据
            static_data = get_static_data()
            if static_data:
                # 简单的频率统计
                from collections import Counter
                all_numbers = []
                for record in static_data[:100]:  # 只使用最近100期数据
                    if 'numbers' in record:
                        all_numbers.extend(record['numbers'].split())
                
                number_counts = Counter(all_numbers)
                hot_numbers = [num for num, count in number_counts.most_common(5)]
                cold_numbers = [num for num, count in number_counts.most_common()[-5:]]
                
                predictions = {
                    'hot_numbers': hot_numbers,
                    'cold_numbers': cold_numbers,
                    'total_records': len(static_data)
                }
            else:
                # 默认数据
                predictions = {
                    'hot_numbers': ['01', '05', '10', '15', '20'],
                    'cold_numbers': ['30', '31', '32', '33', '34'],
                    'total_records': 0
                }
        
        return jsonify({
            'success': True,
            'data': predictions
        })
    except Exception as e:
        logger.error(f"获取预测结果失败: {e}")
        return jsonify({
            'success': False,
            'message': f'获取预测结果失败: {str(e)}'
        })

@app.route('/api/data_status', methods=['GET'])
def data_status():
    """获取数据状态"""
    try:
        static_data = get_static_data()
        latest_period = static_data[0]['period'] if static_data else None
        
        return jsonify({
            'success': True,
            'total_records': len(static_data),
            'latest_period': latest_period,
            'data_source': 'static' if not LOCAL_MODE else 'local',
            'mode': 'vercel'
        })
    except Exception as e:
        logger.error(f"获取数据状态失败: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/get_history', methods=['GET'])
def get_history():
    """获取历史数据API"""
    try:
        limit = int(request.args.get('limit', 10))
        static_data = get_static_data()
        history_data = static_data[:limit] if static_data else []
        
        return jsonify({
            'success': True,
            'data': history_data
        })
    except Exception as e:
        logger.error(f"获取历史数据失败: {e}")
        return jsonify({
            'success': False,
            'message': f'获取历史数据失败: {str(e)}'
        })

# Vercel需要这个处理函数
def handler(request, context):
    from flask import Request, Response
    from werkzeug.wrappers import Response as WerkzeugResponse
    
    # 将Vercel请求转换为Flask请求
    environ = {
        'REQUEST_METHOD': request.method,
        'PATH_INFO': request.path,
        'QUERY_STRING': request.query_string or '',
        'SERVER_NAME': 'localhost',
        'SERVER_PORT': '80',
        'wsgi.version': (1, 0),
        'wsgi.url_scheme': 'http',
        'wsgi.input': request.body,
        'wsgi.errors': sys.stderr,
        'wsgi.multithread': False,
        'wsgi.multiprocess': True,
        'wsgi.run_once': False
    }
    
    # 添加headers
    for key, value in request.headers.items():
        environ[f'HTTP_{key.upper().replace("-", "_")}'] = value
    
    # 调用Flask应用
    with app.request_context(environ):
        try:
            response = app.full_dispatch_request()
        except Exception as e:
            response = app.make_response(app.handle_exception(e))
    
    # 转换响应
    return {
        'statusCode': response.status_code,
        'headers': dict(response.headers),
        'body': response.get_data(as_text=True)
    }

if __name__ == '__main__':
    app.run(debug=True)