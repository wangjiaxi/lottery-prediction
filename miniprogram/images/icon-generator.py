#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成简单的PNG图标文件
"""

import base64
from PIL import Image, ImageDraw
import os

def create_home_icon(size=(40, 40), color=(102, 102, 102), output_path="home.png"):
    """创建首页图标"""
    img = Image.new('RGBA', size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # 简单的房屋形状
    w, h = size
    # 屋顶三角形
    roof_points = [(w//4, h//2), (w//2, h//4), (3*w//4, h//2)]
    draw.polygon(roof_points, fill=color)
    # 房屋主体
    draw.rectangle([w//4, h//2, 3*w//4, 3*h//4], fill=color)
    # 门
    draw.rectangle([w//2-4, h//2+4, w//2+4, 3*h//4], fill=(255, 255, 255))
    
    img.save(output_path)
    print(f"Created: {output_path}")

def create_history_icon(size=(40, 40), color=(102, 102, 102), output_path="history.png"):
    """创建历史图标（时钟）"""
    img = Image.new('RGBA', size, (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    w, h = size
    center = (w//2, h//2)
    radius = min(w, h)//2 - 4
    
    # 外圆
    draw.ellipse([center[0]-radius, center[1]-radius, 
                  center[0]+radius, center[1]+radius], 
                 outline=color, width=3)
    # 时针和分针
    draw.line([center, (center[0], center[1]-radius+8)], fill=color, width=2)
    draw.line([center, (center[0]+radius-8, center[1])], fill=color, width=2)
    # 中心点
    draw.ellipse([center[0]-2, center[1]-2, center[0]+2, center[1]+2], fill=color)
    
    img.save(output_path)
    print(f"Created: {output_path}")

def main():
    """创建所有图标"""
    images_dir = "/Users/wangjiaxi/Desktop/彩票推荐_小程序/miniprogram/images"
    os.chdir(images_dir)
    
    # 创建未选中的图标（灰色）
    create_home_icon(color=(102, 102, 102), output_path="home.png")
    create_history_icon(color=(102, 102, 102), output_path="history.png")
    
    # 创建选中的图标（主题色）
    create_home_icon(color=(0, 82, 217), output_path="home-active.png")
    create_history_icon(color=(0, 82, 217), output_path="history-active.png")
    
    print("所有图标创建完成！")

if __name__ == "__main__":
    try:
        main()
    except ImportError:
        print("需要安装Pillow库: pip install Pillow")
        print("或者使用下面的方案二：移除图标配置")