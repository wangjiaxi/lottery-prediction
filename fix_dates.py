#!/usr/bin/env python3
"""
修复数据中的日期错误问题
"""

import json
import os

def fix_dates():
    """修复数据文件中的错误日期"""
    
    # 读取数据文件
    data_files = [
        'full_lottery_data.json',
        'miniprogram/cloudfunctions/lottery-api/lottery_data.json'
    ]
    
    for file_path in data_files:
        if not os.path.exists(file_path):
            print(f"文件不存在: {file_path}")
            continue
            
        print(f"正在修复文件: {file_path}")
        
        # 读取数据
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 修复日期
        fixed_count = 0
        for item in data:
            date = item.get('date', '')
            if '2025' in date:
                # 修正年份为2024
                item['date'] = date.replace('2025', '2024')
                fixed_count += 1
                
                # 特殊修复期次25139的日期
                if item.get('period') == '25139':
                    item['date'] = '2024-12-04'
        
        print(f"  修复了 {fixed_count} 条记录的日期")
        
        # 显示前几条记录的修复情况
        for i, item in enumerate(data[:5]):
            print(f"  期次 {item['period']}: {item['date']} {item['front_numbers']} + {item['back_numbers']}")
        
        # 保存修复后的数据
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"  修复完成并保存: {file_path}")
        print()

def validate_data():
    """验证数据有效性"""
    print("验证数据有效性...")
    
    with open('full_lottery_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    issues = []
    
    for i, item in enumerate(data):
        # 检查期次
        period = item.get('period', '')
        if not period or len(period) != 5:
            issues.append(f"第{i+1}条: 无效期次 {period}")
        
        # 检查日期
        date = item.get('date', '')
        if '2025' in date:
            issues.append(f"第{i+1}条: 仍有2025年日期 {date}")
        
        # 检查号码
        front = item.get('front_numbers', [])
        back = item.get('back_numbers', [])
        
        if len(front) != 5:
            issues.append(f"第{i+1}条: 前区号码数量错误 {front}")
        if len(back) != 2:
            issues.append(f"第{i+1}条: 后区号码数量错误 {back}")
        
        # 只检查前10条，避免输出过多
        if i >= 10:
            break
    
    if issues:
        print("发现问题:")
        for issue in issues[:10]:  # 只显示前10个问题
            print(f"  {issue}")
    else:
        print("✅ 数据验证通过")
    
    print(f"总记录数: {len(data)}")

if __name__ == "__main__":
    fix_dates()
    validate_data()