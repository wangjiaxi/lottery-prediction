// utils/api.js
// HTTP API工具类

const app = getApp()

/**
 * HTTP请求封装
 */
function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBase}${options.url}`,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'content-type': 'application/json'
      },
      timeout: options.timeout || 30000,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else {
          reject(new Error(`请求失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 获取数据状态
 */
function getDataStatus() {
  return request({
    url: '/api/data_status',
    method: 'GET'
  })
}

/**
 * 更新数据
 */
function updateData() {
  return request({
    url: '/api/update_data',
    method: 'POST'
  })
}

/**
 * 获取预测号码
 */
function getPredictions(strategy = 'all') {
  return request({
    url: `/api/get_predictions?strategy=${strategy}`,
    method: 'GET'
  })
}

/**
 * 获取历史数据
 */
function getHistory(offset = 0, limit = 10) {
  return request({
    url: `/api/get_history?offset=${offset}&limit=${limit}`,
    method: 'GET'
  })
}

/**
 * 健康检查
 */
function healthCheck() {
  return request({
    url: '/api/health',
    method: 'GET'
  })
}

module.exports = {
  request,
  getDataStatus,
  updateData,
  getPredictions,
  getHistory,
  healthCheck
}
