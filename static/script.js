class LotteryApp {
    constructor() {
        this.currentData = [];
        this.totalRecords = 0;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDataStatus();
        
        // 页面加载时自动模拟点击获取最新数据按钮
        setTimeout(() => {
            document.getElementById('updateDataBtn').click();
        }, 1000); // 延迟1秒执行，确保页面完全加载
        
        // 初始化显示
        this.updateDataStatusDisplay();
    }

    bindEvents() {
        // 绑定更新数据按钮
        document.getElementById('updateDataBtn').addEventListener('click', () => {
            this.updateData();
        });

        // 绑定生成推荐号码按钮
        document.getElementById('generatePredictionBtn').addEventListener('click', () => {
            this.generatePredictions();
        });

        // 绑定查看历史数据按钮
        document.getElementById('toggleHistoryBtn').addEventListener('click', () => {
            this.toggleHistory();
        });

        // 绑定加载历史数据按钮
        document.getElementById('loadHistoryBtn').addEventListener('click', () => {
            this.loadHistoryData();
        });
    }

    async loadDataStatus() {
        try {
            // 适配Vercel部署路径
            const apiBase = window.location.hostname.includes('vercel.app') ? '/api' : '/api';
            const response = await fetch(`${apiBase}/data_status`);
            const data = await response.json();
            
            if (data.success) {
                this.totalRecords = data.total_records;
                this.updateDataStatusDisplay();
            } else {
                console.error('API返回错误:', data.error);
                this.updateDataStatusDisplay();
            }
        } catch (error) {
            console.error('加载数据状态失败:', error);
            this.updateDataStatusDisplay();
        }
    }



    updateDataStatusDisplay() {
        const statusElement = document.getElementById('dataStatus');
        if (statusElement) {
            if (this.totalRecords > 0) {
                statusElement.textContent = `当前数据量: ${this.totalRecords} 条记录`;
                statusElement.style.color = '#4CAF50';
            } else {
                statusElement.textContent = '暂无数据，请先获取数据';
                statusElement.style.color = '#ff9800';
            }
        }
    }

    async updateData() {
        const updateBtn = document.getElementById('updateDataBtn');
        const originalText = updateBtn.textContent;
        
        try {
            // 显示加载状态
            updateBtn.textContent = '正在更新...';
            updateBtn.disabled = true;

            // 获取更新前的数据状态
            const beforeResponse = await fetch('/api/data_status');
            const beforeData = await beforeResponse.json();
            const beforeCount = beforeData.total_records;

            // 执行数据更新
            const apiBase = window.location.hostname.includes('vercel.app') ? '/api' : '/api';
            const updateResponse = await fetch(`${apiBase}/update_data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const updateResult = await updateResponse.json();
            
            if (updateResult.success) {
                // 获取更新后的数据状态
                const afterResponse = await fetch('/api/data_status');
                const afterData = await afterResponse.json();
                const afterCount = afterData.total_records;
                
                const newRecords = afterCount - beforeCount;
                
                if (newRecords > 0) {
                    this.showNotification(`数据更新成功！已新增 ${newRecords} 条记录`, 'success');
                } else {
                    this.showNotification('数据已是最新，没有新的开奖记录', 'info');
                }
                
                this.totalRecords = afterCount;
                this.updateDataStatusDisplay();
                
            } else {
                this.showNotification('数据更新失败，请检查网络连接', 'error');
            }
            
        } catch (error) {
            console.error('更新数据失败:', error);
            this.showNotification('❌ 网络连接失败，请检查网络设置', 'error');
        } finally {
            // 恢复按钮状态
            updateBtn.textContent = originalText;
            updateBtn.disabled = false;
        }
    }

    async generatePredictions() {
        const predictBtn = document.getElementById('generatePredictionBtn');
        const originalText = predictBtn.textContent;
        
        try {
            predictBtn.textContent = '正在生成...';
            predictBtn.disabled = true;

            const apiBase = window.location.hostname.includes('vercel.app') ? '/api' : '/api';
            const response = await fetch(`${apiBase}/get_predictions`);
            const data = await response.json();
            
            if (data.success) {
                this.displayPredictions(data.data);
                this.showNotification('推荐号码生成成功！', 'success');
            } else {
                this.showNotification('生成推荐号码失败: ' + data.message, 'error');
            }
            
        } catch (error) {
            console.error('获取预测失败:', error);
            this.showNotification('获取预测失败，请重试', 'error');
        } finally {
            predictBtn.textContent = originalText;
            predictBtn.disabled = false;
        }
    }

    displayPredictions(data) {
        const resultsContainer = document.getElementById('resultsContainer');
        const historyContainer = document.getElementById('historyContainer');
        
        // 显示预测结果，隐藏历史数据
        resultsContainer.style.display = 'block';
        historyContainer.style.display = 'none';

        // 显示热门号码
        const hotNumbers = document.getElementById('hotNumbers');
        
        if (data.hot_numbers) {
            const hotAllNumbers = [
                ...data.hot_numbers.front_numbers.map(num => 
                    `<span class="history-number history-front-number">${num}</span>`
                ),
                ...data.hot_numbers.back_numbers.map(num => 
                    `<span class="history-number history-back-number">${num}</span>`
                )
            ];
            hotNumbers.innerHTML = hotAllNumbers.join('');
        }

        // 显示冷门号码
        const coldNumbers = document.getElementById('coldNumbers');
        
        if (data.cold_numbers) {
            const coldAllNumbers = [
                ...data.cold_numbers.front_numbers.map(num => 
                    `<span class="history-number history-front-number">${num}</span>`
                ),
                ...data.cold_numbers.back_numbers.map(num => 
                    `<span class="history-number history-back-number">${num}</span>`
                )
            ];
            coldNumbers.innerHTML = coldAllNumbers.join('');
        }

        // 更新最后更新时间
        const lastUpdate = document.getElementById('lastUpdate');
        if (data.last_update) {
            lastUpdate.textContent = `最后更新: ${data.last_update}`;
        }
    }

    createNumberDisplay(title, frontNumbers, backNumbers) {
        return `
            <div class="prediction-group">
                <h3>${title}</h3>
                <div class="numbers-display">
                    <div class="front-numbers">
                        <span class="section-label">前区：</span>
                        ${frontNumbers.map(num => `<span class="number-ball front-ball">${num}</span>`).join('')}
                    </div>
                    <div class="back-numbers">
                        <span class="section-label">后区：</span>
                        ${backNumbers.map(num => `<span class="number-ball back-ball">${num}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    toggleHistory() {
        const historyContainer = document.getElementById('historyContainer');
        const resultsContainer = document.getElementById('resultsContainer');
        
        if (historyContainer.style.display === 'none') {
            // 显示历史数据，隐藏预测结果
            historyContainer.style.display = 'block';
            resultsContainer.style.display = 'none';
            this.loadHistoryData();
        } else {
            // 隐藏历史数据
            historyContainer.style.display = 'none';
        }
    }

    async loadHistoryData() {
        try {
            const limitSelect = document.getElementById('historyLimit');
            const limit = limitSelect ? limitSelect.value : 10;
            
            const apiBase = window.location.hostname.includes('vercel.app') ? '/api' : '/api';
            const response = await fetch(`${apiBase}/get_history?limit=${limit}`);
            const data = await response.json();
            
            if (data.success) {
                this.displayHistoryData(data.data);
            } else {
                this.showNotification('加载历史数据失败: ' + data.message, 'error');
            }
        } catch (error) {
            console.error('加载历史数据失败:', error);
            this.showNotification('网络错误，请重试', 'error');
        }
    }

    displayHistoryData(data) {
        const historyData = document.getElementById('historyData');
        
        if (!data || data.length === 0) {
            historyData.innerHTML = '<p class="no-data">暂无历史数据</p>';
            return;
        }

        const tableHtml = `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>期次</th>
                        <th>开奖日期</th>
                        <th>前区号码</th>
                        <th>后区号码</th>
                        <th>销售额</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr>
                            <td>${item.period}</td>
                            <td>${item.date}</td>
                            <td>
                                <div class="history-numbers">
                                    ${item.front_numbers.map(num => `<span class="history-number history-front-number">${num}</span>`).join('')}
                                </div>
                            </td>
                            <td>
                                <div class="history-numbers">
                                    ${item.back_numbers.map(num => `<span class="history-number history-back-number">${num}</span>`).join('')}
                                </div>
                            </td>
                            <td>${item.sales_amount || ''}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        historyData.innerHTML = tableHtml;
    }

    showNotification(message, type = 'info') {
        // 移除现有的通知
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // 创建新通知
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        // 添加到页面
        document.body.appendChild(notification);

        // 自动消失（成功和提示类消息3秒后消失，错误消息5秒后消失）
        const duration = type === 'error' ? 5000 : 3000;
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    window.lotteryApp = new LotteryApp();
});