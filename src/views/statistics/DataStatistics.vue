<template>
  <div class="data-statistics">
    <el-card class="overview-card">
      <template #header>
        <div class="card-header">
          <h3 class="section-title">数据统计概览</h3>
          <el-button type="primary" @click="refreshData" :loading="loading">
            刷新数据
          </el-button>
        </div>
      </template>

      <!-- 统计概览卡片 -->
      <el-row :gutter="20" class="overview-section">
        <el-col :span="6">
          <div class="stat-card" v-loading="loading">
            <div class="stat-icon total">
              <el-icon>
                <User/>
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.total_patients }}</div>
              <div class="stat-label">病人量</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" v-loading="loading">
            <div class="stat-icon monthly">
              <el-icon>
                <Calendar/>
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ overview.current_month_patients }}</div>
              <div class="stat-label">本月系统导入数据</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" v-loading="loading">
            <div class="stat-icon age">
              <el-icon>
                <Female/>
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ parseFloat(overview.avg_age).toFixed(1) }}</div>
              <div class="stat-label">女方平均年龄</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card" v-loading="loading">
            <div class="stat-icon male-age">
              <el-icon>
                <Clock/>
              </el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ parseFloat(overview.avg_infertility_years).toFixed(1) }}</div>
              <div class="stat-label">平均不孕年限</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 图表区域 -->
    <el-row :gutter="20" class="charts-section">
      <!-- 年龄分布图 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>女方年龄统计</span>
          </template>
          <div ref="ageChart" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>

      <!-- 月度趋势图 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>月度趋势分析</span>
          </template>
          <div ref="monthlyChart" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-section">
      <!-- 不孕原因分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>不孕原因分布</span>
          </template>
          <div ref="causesChart" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>

      <!-- 促排方案分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>促排方案分布</span>
          </template>
          <div ref="schemesChart" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="charts-section">
      <!-- 不孕对象分布 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>不孕对象统计</span>
          </template>
          <div ref="objectsChart" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>

      <!-- 激素水平分析 -->
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>激素水平分析</span>
          </template>
          <div ref="hormoneChart" style="width: 100%; height: 350px;"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {ref, reactive, onMounted, onBeforeUnmount} from 'vue'
import * as echarts from 'echarts'
import {ElMessage} from 'element-plus'
import {User, Calendar, Clock, DataAnalysis, Female} from '@element-plus/icons-vue'
import request, {clearAuthErrorState} from '@/utils/request'

export default {
  name: 'DataStatistics',
  components: {
    User,
    Calendar,
    Clock,
    DataAnalysis,
    Female
  },
  setup() {
    const loading = ref(false)
    const overview = reactive({
      total_patients: 0,
      current_month_patients: 0,
      avg_age: 0,
      avg_infertility_years: 0
    })
    const charts = reactive({})
    const ageChart = ref(null)
    const monthlyChart = ref(null)
    const causesChart = ref(null)
    const schemesChart = ref(null)
    const objectsChart = ref(null)
    const hormoneChart = ref(null)

    // 初始化图表
    const initCharts = () => {
      charts.ageChart = echarts.init(ageChart.value)
      charts.monthlyChart = echarts.init(monthlyChart.value)
      charts.causesChart = echarts.init(causesChart.value)
      charts.schemesChart = echarts.init(schemesChart.value)
      charts.objectsChart = echarts.init(objectsChart.value)
      charts.hormoneChart = echarts.init(hormoneChart.value)

      // 为所有图表显示加载动画
      Object.values(charts).forEach(chart => {
        if (chart) {
          chart.showLoading('default', {
            text: '加载中...',
            color: '#409EFF',
            textColor: '#000',
            maskColor: 'rgba(255, 255, 255, 0.8)',
            zlevel: 0
          })
        }
      })

      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)
    }

    // 处理窗口大小变化
    const handleResize = () => {
      Object.values(charts).forEach(chart => {
        if (chart) {
          chart.resize()
        }
      })
    }

    // 缓存相关常量
    const CACHE_KEYS = {
      OVERVIEW: 'statistics_overview',
      AGE_DISTRIBUTION: 'statistics_age_distribution',
      MONTHLY_TRENDS: 'statistics_monthly_trends',
      INFERTILITY_CAUSES: 'statistics_infertility_causes',
      STIMULATION_SCHEMES: 'statistics_stimulation_schemes',
      INFERTILITY_OBJECTS: 'statistics_infertility_objects',
      HORMONE_DISTRIBUTION: 'statistics_hormone_distribution'
    }
    const CACHE_EXPIRY = 30 * 60 * 1000 // 30分钟过期

    // 检查缓存是否有效
    const isCacheValid = (cacheKey) => {
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return false

      try {
        const {data, timestamp} = JSON.parse(cached)
        return Date.now() - timestamp < CACHE_EXPIRY
      } catch {
        return false
      }
    }

    // 获取缓存数据
    const getCachedData = (cacheKey) => {
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null

      try {
        const {data} = JSON.parse(cached)
        return data
      } catch {
        return null
      }
    }

    // 设置缓存数据
    const setCachedData = (cacheKey, data) => {
      const cacheData = {
        data,
        timestamp: Date.now()
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    }

    // 清除所有缓存
    const clearAllCache = () => {
      Object.values(CACHE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    }

    // 加载所有数据
    const loadData = async () => {
      loading.value = true
      try {
        const results = await Promise.allSettled([
          loadOverview(),
          loadAgeDistribution(),
          loadMonthlyTrends(),
          loadInfertilityCauses(),
          loadStimulationSchemes(),
          loadInfertilityObjects(),
          loadHormoneDistribution()
        ])

        // 检查是否有非认证错误的失败请求
        const failedResults = results.filter(result =>
            result.status === 'rejected' &&
            !result.reason?.message?.includes('Token expired') &&
            result.reason?.response?.status !== 401
        )

        if (failedResults.length > 0) {
          console.error('部分数据加载失败:', failedResults)
          ElMessage.warning(`${failedResults.length} 个数据模块加载失败，请重试`)
        } else if (results.every(result => result.status === 'fulfilled')) {
          ElMessage.success('数据加载完成')
        }
      } catch (error) {
        console.error('数据加载失败:', error)
        // 只在非认证错误时显示错误消息
        if (!error.message?.includes('Token expired') && error.response?.status !== 401) {
          ElMessage.error('数据加载失败，请重试')
        }
      } finally {
        loading.value = false
      }
    }

    // 刷新数据
    const refreshData = async () => {
      // 清除所有缓存，强制重新获取数据
      clearAllCache()

      // 为所有图表显示加载动画
      Object.values(charts).forEach(chart => {
        if (chart) {
          chart.showLoading('default', {
            text: '加载中...',
            color: '#409EFF',
            textColor: '#000',
            maskColor: 'rgba(255, 255, 255, 0.8)',
            zlevel: 0
          })
        }
      })
      await loadData()
    }

    // 加载概览数据
    const loadOverview = async () => {
      try {
        // 检查缓存
        if (isCacheValid(CACHE_KEYS.OVERVIEW)) {
          const cachedData = getCachedData(CACHE_KEYS.OVERVIEW)
          if (cachedData) {
            Object.assign(overview, cachedData)
            return
          }
        }

        // 从后端获取数据
        const response = await request.get('/statistics/overview')
        if (response.data.flag) {
          Object.assign(overview, response.data.data)

          // 缓存数据
          setCachedData(CACHE_KEYS.OVERVIEW, response.data.data)
        }
        loading.value = false
      } catch (error) {
        console.error('加载概览数据失败:', error)
        // 只在非认证错误时显示错误消息
        if (!error.message?.includes('Token expired') && error.response?.status !== 401) {
          ElMessage.error('加载概览数据失败')
        }
        throw error // 重新抛出错误供上层处理
      }
    }

    // 加载女方年龄统计
    const loadAgeDistribution = async () => {
      try {
        let data

        // 检查缓存
        if (isCacheValid(CACHE_KEYS.AGE_DISTRIBUTION)) {
          data = getCachedData(CACHE_KEYS.AGE_DISTRIBUTION)
        }

        if (!data) {
          // 从后端获取数据
          const response = await request.get('/statistics/age-distribution')
          if (response.data.flag) {
            data = response.data.data
            // 缓存数据
            setCachedData(CACHE_KEYS.AGE_DISTRIBUTION, data)
          }
        }

        if (data) {
          const option = {
            title: {
              text: '女方年龄统计',
              left: 'center'
            },
            tooltip: {
              tooltip: {
                trigger: 'item',
                formatter: '{b}<br/>{a}: {c}'
              }
            },
            xAxis: {
              type: 'category',
              data: data.map(item => item.age_range)
            },
            yAxis: {
              type: 'value',
            },
            series: [{
              type: 'bar',
              data: data.map(item => item.count),
              itemStyle: {
                color: '#409EFF'
              }
            }]
          }
          charts.ageChart.hideLoading()
          charts.ageChart.setOption(option)
        }
      } catch (error) {
        console.error('加载年龄分布数据失败:', error)
        // 只在非认证错误时显示错误消息
        if (!error.message?.includes('Token expired') && error.response?.status !== 401) {
          ElMessage.error('加载年龄分布数据失败')
        }
        throw error // 重新抛出错误供上层处理
      }
    }

    // 加载月度趋势
    const loadMonthlyTrends = async () => {
      try {
        let data

        // 检查缓存
        if (isCacheValid(CACHE_KEYS.MONTHLY_TRENDS)) {
          data = getCachedData(CACHE_KEYS.MONTHLY_TRENDS)
        }

        if (!data) {
          // 从后端获取数据
          const response = await request.get('/statistics/monthly-trends')
          if (response.data.flag) {
            data = response.data.data
            // 缓存数据
            setCachedData(CACHE_KEYS.MONTHLY_TRENDS, data)
          }
        }

        if (data) {
          const option = {
            title: {
              text: '月度趋势',
              left: 'center'
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross'
              }
            },
            xAxis: {
              type: 'category',
              data: data.map(item => item.month),
              axisLabel: {
                interval: 6, // 显示所有标签
                rotate: 45, // 旋转45度
                fontSize: 10
              }
            },
            yAxis: {
              type: 'value',
              name: '病例数'
            },
            series: [{
              name: '病例数',
              type: 'line',
              data: data.map(item => item.count),
              smooth: true,
              itemStyle: {
                color: '#67C23A'
              },
              areaStyle: {
                color: 'rgba(103, 194, 58, 0.2)'
              }
            }]
          }
          charts.monthlyChart.hideLoading()
          charts.monthlyChart.setOption(option)
        }
      } catch (error) {
        console.error('加载月度趋势数据失败:', error)
        // 只在非认证错误时显示错误消息
        if (!error.message?.includes('Token expired') && error.response?.status !== 401) {
          ElMessage.error('加载月度趋势数据失败')
        }
        throw error // 重新抛出错误供上层处理
      }
    }

    // 加载不孕原因分布
    const loadInfertilityCauses = async () => {
      try {
        let data

        // 检查缓存
        if (isCacheValid(CACHE_KEYS.INFERTILITY_CAUSES)) {
          data = getCachedData(CACHE_KEYS.INFERTILITY_CAUSES)
        }

        if (!data) {
          // 从后端获取数据
          const response = await request.get('/statistics/infertility-causes')
          if (response.data.flag) {
            data = response.data.data
            // 缓存数据
            setCachedData(CACHE_KEYS.INFERTILITY_CAUSES, data)
          }
        }

        if (data) {
          const option = {
            title: {
              text: '不孕原因分布',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            series: [{
              name: '不孕原因',
              type: 'pie',
              radius: '60%',
              data: data.map(item => ({
                value: item.count,
                name: item.cause
              })),
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }]
          }
          charts.causesChart.hideLoading()
          charts.causesChart.setOption(option)
        }
      } catch (error) {
        console.error('加载不孕原因分布数据失败:', error)
        // 只在非认证错误时显示错误消息
        if (!error.message?.includes('Token expired') && error.response?.status !== 401) {
          ElMessage.error('加载不孕原因分布数据失败')
        }
        throw error // 重新抛出错误供上层处理
      }
    }

    // 加载促排方案分布
    const loadStimulationSchemes = async () => {
      try {
        let data

        // 检查缓存
        if (isCacheValid(CACHE_KEYS.STIMULATION_SCHEMES)) {
          data = getCachedData(CACHE_KEYS.STIMULATION_SCHEMES)
        }

        if (!data) {
          // 从后端获取数据
          const response = await request.get('/statistics/stimulation_schemes')
          if (response.data.flag) {
            data = response.data.data
            // 缓存数据
            setCachedData(CACHE_KEYS.STIMULATION_SCHEMES, data)
          }
        }

        if (data) {
          const option = {
            title: {
              text: '促排方案分布',
              left: 'center'
            },
            tooltip: {
              trigger: 'item',
              formatter: function (params) {
                const percent = ((params.value / params.data.total) * 100).toFixed(4)
                return `${params.seriesName}<br/>${params.name}: ${params.value} (${percent}%)`
              }
            },
            series: [{
              name: '促排方案',
              type: 'pie',
              radius: ['40%', '70%'],
              data: data.map(item => {
                const total = data.reduce((sum, d) => sum + d.count, 0)
                return {
                  value: item.count,
                  name: item.scheme,
                  total: total
                }
              }),
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }]
          }
          charts.schemesChart.hideLoading()
          charts.schemesChart.setOption(option)
        }
      } catch (error) {
        console.error('加载促排方案分布数据失败:', error)
        // 只在非认证错误时显示错误消息
        if (!error.message?.includes('Token expired') && error.response?.status !== 401) {
          ElMessage.error('加载促排方案分布数据失败')
        }
        throw error // 重新抛出错误供上层处理
      }
    }

    // 加载不孕对象统计
    const loadInfertilityObjects = async () => {
      try {
        let data

        // 检查缓存
        if (isCacheValid(CACHE_KEYS.INFERTILITY_OBJECTS)) {
          data = getCachedData(CACHE_KEYS.INFERTILITY_OBJECTS)
        }

        if (!data) {
          // 从后端获取数据
          const response = await request.get('/statistics/infertility-objects')
          if (response.data.flag) {
            data = response.data.data
            // 缓存数据
            setCachedData(CACHE_KEYS.INFERTILITY_OBJECTS, data)
          }
        }

        if (data) {
          const option = {
            title: {
              text: '不孕对象统计',
              left: 'center'
            },
            tooltip: {
              tooltip: {
                trigger: 'item',
                formatter: '{b}<br/>{a}: {c}'
              }
            },
            xAxis: {
              type: 'category',
              data: data.map(item => item.object)
            },
            yAxis: {
              type: 'value',
            },
            series: [{
              type: 'bar',
              data: data.map(item => item.count),
              itemStyle: {
                color: '#E6A23C'
              }
            }]
          }
          charts.objectsChart.hideLoading()
          charts.objectsChart.setOption(option)
        }
      } catch (error) {
        console.error('加载不孕对象分布数据失败:', error)
        // 只在非认证错误时显示错误消息
        if (!error.message?.includes('Token expired') && error.response?.status !== 401) {
          ElMessage.error('加载不孕对象分布数据失败')
        }
        throw error // 重新抛出错误供上层处理
      }
    }

    // 加载激素水平分析
    const loadHormoneDistribution = async () => {
      try {
        let data

        // 检查缓存
        if (isCacheValid(CACHE_KEYS.HORMONE_DISTRIBUTION)) {
          data = getCachedData(CACHE_KEYS.HORMONE_DISTRIBUTION)
        }

        if (!data) {
          // 从后端获取数据
          const response = await request.get('/statistics/hormone-distribution')
          if (response.data.flag) {
            data = response.data.data
            // 缓存数据
            setCachedData(CACHE_KEYS.HORMONE_DISTRIBUTION, data)
          }
        }

        if (data) {
          const option = {
            title: {
              text: '激素水平分析',
              left: 'center'
            },
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'cross'
              }
            },
            legend: {
              data: ['AMH', 'bFSH', 'bLH', 'bE2'],
              top: 30
            },
            xAxis: {
              type: 'category',
              data: data.map(item => item.age_range),
              name: '年龄段',
              nameLocation: 'center',
              nameGap: 30
            },
            yAxis: [
              {
                type: 'value',
                name: 'AMH / bFSH / bLH 平均值',
                position: 'left',
                axisLine: {
                  show: true,
                  lineStyle: {
                    color: '#5470C6'
                  }
                }
              },
              {
                type: 'value',
                name: 'bE2 平均值',
                position: 'right',
                axisLine: {
                  show: true,
                  lineStyle: {
                    color: '#E6A23C'
                  }
                }
              }
            ],
            series: [
              {
                name: 'AMH',
                type: 'line',
                data: data.map(item => item.avg_amh),
                smooth: true,
                itemStyle: {
                  color: '#F56C6C'
                }
              },
              {
                name: 'bFSH',
                type: 'line',
                data: data.map(item => item.avg_bfsh),
                smooth: true,
                itemStyle: {
                  color: '#409EFF'
                }
              },
              {
                name: 'bLH',
                type: 'line',
                data: data.map(item => item.avg_blh),
                smooth: true,
                itemStyle: {
                  color: '#67C23A'
                }
              },
              {
                name: 'bE2',
                type: 'line',
                yAxisIndex: 1,
                data: data.map(item => item.avg_be2),
                smooth: true,
                itemStyle: {
                  color: '#E6A23C'
                }
              }
            ]
          }
          charts.hormoneChart.hideLoading()
          charts.hormoneChart.setOption(option)
        }
      } catch (error) {
        console.error('加载激素水平分析数据失败:', error)
        // 只在非认证错误时显示错误消息
        if (!error.message?.includes('Token expired') && error.response?.status !== 401) {
          ElMessage.error('加载激素水平分析数据失败')
        }
        throw error // 重新抛出错误供上层处理
      }
    }

    // 生命周期钩子
    onMounted(() => {
      initCharts()
      loadData()
    })

    onBeforeUnmount(() => {
      // 销毁图表实例
      Object.values(charts).forEach(chart => {
        if (chart) {
          chart.dispose()
        }
      })
      // 移除事件监听器
      window.removeEventListener('resize', handleResize)
      // 清理认证错误状态
      clearAuthErrorState()
    })

    return {
      loading,
      overview,
      charts,
      ageChart,
      monthlyChart,
      causesChart,
      schemesChart,
      objectsChart,
      hormoneChart,
      refreshData,
      clearAllCache
    }
  }
}
</script>

<style scoped>
.data-statistics {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  color: #1e3a8a;
  font-size: 18px;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 20px;
  background: #2563eb;
  border-radius: 2px;
}

.overview-card {
  margin-bottom: 20px;
}

.overview-section {
  margin: 20px 0;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
}

.stat-icon.total {
  background: rgba(255, 255, 255, 0.2);
}

.stat-icon.monthly {
  background: rgba(255, 255, 255, 0.2);
}

.stat-icon.age {
  background: rgba(255, 255, 255, 0.2);
}

.stat-icon.male-age {
  background: rgba(255, 255, 255, 0.2);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.charts-section {
  margin-top: 20px;
}

.charts-section .el-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.charts-section .el-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.3s ease;
}
</style>