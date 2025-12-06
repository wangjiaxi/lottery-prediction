// utils/api.js
// API工具类 - 支持HTTP和云开发

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
 * 云函数调用封装
 */
function callCloudFunction(data) {
  return new Promise((resolve, reject) => {
    if (!wx.cloud) {
      reject(new Error('云开发未初始化'))
      return
    }
    
    wx.cloud.callFunction({
      name: 'lottery-api',
      data: data,
      success: (res) => {
        if (res.result) {
          resolve(res.result)
        } else {
          reject(new Error('云函数返回空结果'))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 统一API调用 - 自动选择HTTP或云开发
 */
function apiCall(method, data = {}) {
  // 优先使用云开发（体验版友好）
  if (wx.cloud && !app.globalData.isDev) {
    return callCloudFunction({ action: method, ...data })
  } else {
    // 降级到HTTP请求
    return httpRequest(method, data)
  }
}

/**
 * HTTP请求映射
 */
function httpRequest(action, data = {}) {
  const mapping = {
    'health': { url: '/api/health', method: 'GET' },
    'data_status': { url: '/api/data_status', method: 'GET' },
    'update_data': { url: '/api/update_data', method: 'POST' },
    'get_predictions': { 
      url: `/api/get_predictions?strategy=${data.strategy || 'all'}`, 
      method: 'GET' 
    },
    'get_history': { 
      url: `/api/get_history?offset=${data.offset || 0}&limit=${data.limit || 10}`, 
      method: 'GET' 
    }
  }
  
  const config = mapping[action] || { url: '/api/health', method: 'GET' }
  return request({ ...config, data })
}

/**
 * 获取数据状态
 */
function getDataStatus() {
  return apiCall('data_status')
}

/**
 * 更新数据
 */
function updateData() {
  return apiCall('update_data')
}

/**
 * 获取预测号码
 */
function getPredictions(strategy = 'all') {
  return apiCall('get_predictions', { strategy })
}

/**
 * 获取历史数据
 */
function getHistory(offset = 0, limit = 10) {
  return apiCall('get_history', { offset, limit })
}

/**
 * 健康检查
 */
function healthCheck() {
  return apiCall('health')
}

module.exports = {
  request,
  callCloudFunction,
  apiCall,
  getDataStatus,
  updateData,
  getPredictions,
  getHistory,
  healthCheck
}
