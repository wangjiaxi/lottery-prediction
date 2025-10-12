import json
import os
from collections import Counter
from datetime import datetime

class LotteryPredictor:
    def _get_data_file(self):
        """获取数据文件路径，优先使用完整数据"""
        if os.path.exists('full_lottery_data.json'):
            return 'full_lottery_data.json'
        elif os.path.exists('lottery_data.json'):
            return 'lottery_data.json'
        else:
            return 'lottery_data.json'
    
    def __init__(self):
        self.data_file = self._get_data_file()
        self.data = self.load_data()
    
    def _get_data_file(self):
        """获取数据文件路径，优先使用完整数据"""
        if os.path.exists('full_lottery_data.json'):
            return 'full_lottery_data.json'
        elif os.path.exists('lottery_data.json'):
            return 'lottery_data.json'
        else:
            return 'lottery_data.json'
    
    def load_data(self):
        """加载历史数据"""
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            else:
                return []
        except Exception as e:
            print(f"加载数据时发生错误: {e}")
            return []
    
    def refresh_data(self):
        """刷新数据"""
        self.data = self.load_data()
    
    def analyze_frequency(self):
        """分析号码出现频率"""
        if not self.data:
            return None
        
        # 统计前区号码频率 (1-35)
        front_counter = Counter()
        # 统计后区号码频率 (1-12)
        back_counter = Counter()
        
        for record in self.data:
            # 前区号码
            for num in record.get('front_numbers', []):
                front_counter[int(num)] += 1
            
            # 后区号码
            for num in record.get('back_numbers', []):
                back_counter[int(num)] += 1
        
        return {
            'front_frequency': dict(front_counter),
            'back_frequency': dict(back_counter),
            'total_records': len(self.data)
        }
    
    def get_hot_numbers(self):
        """获取热门号码（出现频率最高）"""
        analysis = self.analyze_frequency()
        if not analysis:
            return None
        
        # 前区热门号码 (取前5个)
        front_hot = sorted(analysis['front_frequency'].items(), key=lambda x: x[1], reverse=True)[:5]
        front_hot_numbers = sorted([num for num, count in front_hot])
        
        # 后区热门号码 (取前2个)
        back_hot = sorted(analysis['back_frequency'].items(), key=lambda x: x[1], reverse=True)[:2]
        back_hot_numbers = sorted([num for num, count in back_hot])
        
        return {
            'front_numbers': front_hot_numbers,
            'back_numbers': back_hot_numbers,
            'front_details': front_hot,
            'back_details': back_hot,
            'type': 'hot',
            'description': '基于历史数据出现频率最高的号码'
        }
    
    def get_cold_numbers(self):
        """获取冷门号码（出现频率最低）"""
        analysis = self.analyze_frequency()
        if not analysis:
            return None
        
        # 确保所有号码都在统计中（包括从未出现的）
        all_front_numbers = {i: analysis['front_frequency'].get(i, 0) for i in range(1, 36)}
        all_back_numbers = {i: analysis['back_frequency'].get(i, 0) for i in range(1, 13)}
        
        # 前区冷门号码 (取前5个)
        front_cold = sorted(all_front_numbers.items(), key=lambda x: x[1])[:5]
        front_cold_numbers = sorted([num for num, count in front_cold])
        
        # 后区冷门号码 (取前2个)
        back_cold = sorted(all_back_numbers.items(), key=lambda x: x[1])[:2]
        back_cold_numbers = sorted([num for num, count in back_cold])
        
        return {
            'front_numbers': front_cold_numbers,
            'back_numbers': back_cold_numbers,
            'front_details': front_cold,
            'back_details': back_cold,
            'type': 'cold',
            'description': '基于历史数据出现频率最低的号码'
        }
    
    def get_predictions(self):
        """获取预测结果"""
        if not self.data:
            return {
                'error': '暂无历史数据，请先获取最新数据',
                'data_count': 0
            }
        
        hot_prediction = self.get_hot_numbers()
        cold_prediction = self.get_cold_numbers()
        
        return {
            'hot_numbers': hot_prediction,
            'cold_numbers': cold_prediction,
            'data_count': len(self.data),
            'last_update': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
    
    def get_statistics(self):
        """获取统计信息"""
        analysis = self.analyze_frequency()
        if not analysis:
            return None
        
        return {
            'total_records': analysis['total_records'],
            'front_most_frequent': max(analysis['front_frequency'].items(), key=lambda x: x[1]) if analysis['front_frequency'] else None,
            'back_most_frequent': max(analysis['back_frequency'].items(), key=lambda x: x[1]) if analysis['back_frequency'] else None,
            'front_least_frequent': min(analysis['front_frequency'].items(), key=lambda x: x[1]) if analysis['front_frequency'] else None,
            'back_least_frequent': min(analysis['back_frequency'].items(), key=lambda x: x[1]) if analysis['back_frequency'] else None,
        }

if __name__ == "__main__":
    predictor = LotteryPredictor()
    predictions = predictor.get_predictions()
    print(json.dumps(predictions, indent=2, ensure_ascii=False))