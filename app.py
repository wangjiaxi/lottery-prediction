from flask import Flask, render_template, jsonify, request
from data_crawler import LotteryCrawler
from predictor import LotteryPredictor
import os
import json

app = Flask(__name__)

# 初始化爬虫和预测器
crawler = LotteryCrawler()
predictor = LotteryPredictor()

@app.route('/')
def index():
    """主页"""
    return render_template('index.html')

@app.route('/api/update_data', methods=['POST'])
def update_data():
    """更新数据API"""
    try:
        # 获取更新前的数据状态
        before_response = data_status()
        before_data = before_response.get_json()
        before_count = before_data.get('total_records', 0)
        
        # 获取最新数据
        count = crawler.update_data()
        
        # 刷新预测器数据
        predictor.refresh_data()
        
        # 获取更新后的数据状态
        after_response = data_status()
        after_data = after_response.get_json()
        after_count = after_data.get('total_records', 0)
        
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
        return jsonify({
            'success': False,
            'message': f'数据更新失败: {str(e)}'
        })

@app.route('/api/get_predictions', methods=['GET'])
def get_predictions():
    """获取预测结果API"""
    try:
        # 刷新预测器数据
        predictor.refresh_data()
        
        # 获取预测结果
        predictions = predictor.get_predictions()
        
        return jsonify({
            'success': True,
            'data': predictions
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取预测结果失败: {str(e)}'
        })

@app.route('/api/get_statistics', methods=['GET'])
def get_statistics():
    """获取统计信息API"""
    try:
        stats = predictor.get_statistics()
        return jsonify({
            'success': True,
            'data': stats
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取统计信息失败: {str(e)}'
        })

@app.route('/api/data_status', methods=['GET'])
def data_status():
    """获取数据状态"""
    try:
        # 优先检查完整数据文件
        if os.path.exists('full_lottery_data.json'):
            with open('full_lottery_data.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                return jsonify({
                    'success': True,
                    'total_records': len(data),
                    'latest_period': data[0]['period'] if data else None,
                    'data_source': 'full'
                })
        # 如果没有完整数据，使用普通数据文件
        elif os.path.exists('lottery_data.json'):
            with open('lottery_data.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                return jsonify({
                    'success': True,
                    'total_records': len(data),
                    'latest_period': data[0]['period'] if data else None,
                    'data_source': 'partial'
                })
        else:
            return jsonify({
                'success': True,
                'total_records': 0,
                'latest_period': None,
                'data_source': 'none'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/get_history', methods=['GET'])
def get_history():
    """获取历史数据API"""
    try:
        limit = int(request.args.get('limit', 10))
        
        # 刷新预测器数据
        predictor.refresh_data()
        
        # 获取指定数量的历史数据
        history_data = predictor.data[:limit] if predictor.data else []
        
        return jsonify({
            'success': True,
            'data': history_data
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'获取历史数据失败: {str(e)}'
        })

if __name__ == '__main__':
    # 创建静态文件夹
    if not os.path.exists('static'):
        os.makedirs('static')
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    # 运行应用
    app.run(debug=True, host='0.0.0.0', port=8080)