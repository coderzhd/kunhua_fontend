import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 全局错误处理状态
let isShowingAuthError = false
let authErrorTimer = null

// 创建 axios 实例
// const request = axios.create({
//   baseURL: 'http://127.0.0.1:8000',
//   timeout: 5000
// })
const request = axios.create({
  // baseURL: process.env.VUE_APP_BASE_API,
  // timeout: 20000
  baseURL: process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000',
  timeout: 100000
})

// 检查 token 是否过期
const isTokenExpired = () => {
  const expiresIn = localStorage.getItem('token_expires')
  if (!expiresIn) return true

  // 将非标准的日期字符串替换为标准的 ISO 8601 格式 (用 'T' 替换空格)
  const standardizedExpiresIn = expiresIn.replace(' ', 'T')

  // 使用标准化的字符串创建 Date 对象。
  const expiresDate = new Date(standardizedExpiresIn)

  // 步骤 3: 获取当前时间
  const now = new Date()

  // 直接比较两个 Date 对象。不再需要任何手动的时区加减！
  return !(expiresDate instanceof Date && !isNaN(expiresDate)) || now >= expiresDate

}

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 登录接口不检查 token
    if (config.url === '/login/') {
      return config
    }

    // 检查 token 是否过期
    if (isTokenExpired()) {
      // token 过期，清除本地存储并跳转到登录页
      if (!isShowingAuthError) {
        isShowingAuthError = true
        localStorage.removeItem('access_token')
        localStorage.removeItem('token_expires')
        localStorage.removeItem('user')
        clearStatisticsCache() // 清除统计页面缓存
        router.push('/login')
        ElMessage.error('登录已过期，请重新登录')
        
        // 3秒后重置状态
        authErrorTimer = setTimeout(() => {
          isShowingAuthError = false
        }, 3000)
      }
      return Promise.reject(new Error('Token expired'))
    }

    // 从 localStorage 获取 token
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 清除所有统计页面缓存
const clearStatisticsCache = () => {
  const statisticsCacheKeys = [
    'statistics_overview',
    'statistics_age_distribution', 
    'statistics_monthly_trends',
    'statistics_infertility_causes',
    'statistics_stimulation_schemes',
    'statistics_infertility_objects',
    'statistics_hormone_distribution'
  ]
  statisticsCacheKeys.forEach(key => {
    localStorage.removeItem(key)
  })
}

// 响应拦截器
request.interceptors.response.use(
  response => {
    return response
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // token 无效 - 防止重复提示
          if (!isShowingAuthError) {
            isShowingAuthError = true
            
            // 清除认证信息和缓存
            localStorage.removeItem('access_token')
            localStorage.removeItem('token_expires')
            localStorage.removeItem('user')
            clearStatisticsCache() // 清除统计页面缓存
            
            ElMessage.error('登录已过期，请重新登录')
            router.push('/login')
            
            // 3秒后重置状态，允许新的错误提示
            authErrorTimer = setTimeout(() => {
              isShowingAuthError = false
            }, 3000)
          }
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(error.response.data?.message || '未知错误')
      }
    } else {
      ElMessage.error('网络错误，请检查您的网络连接')
    }
    return Promise.reject(error)
  }
)

// 清理认证错误状态的函数
export const clearAuthErrorState = () => {
  if (authErrorTimer) {
    clearTimeout(authErrorTimer)
    authErrorTimer = null
  }
  isShowingAuthError = false
}

export default request