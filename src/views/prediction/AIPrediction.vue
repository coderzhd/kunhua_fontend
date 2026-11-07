<template>
  <div class="prediction-container">
    <div class="page-header">
      <h2>现有数据预测</h2>
      <p>基于现有病人数据的AI胚胎发育预测</p>
    </div>

    <div class="prediction-content">
      <!-- 病人选择区域 -->
      <el-card class="patient-selection-card">
        <template #header>
          <div class="card-header">
            <h3 class="section-title">选择病人进行预测</h3>
            <div class="header-controls">
              <div class="search-container">
                <el-input
                    v-model="searchQuery"
                    placeholder="请输入病历编号搜索"
                    class="search-input"
                    clearable
                    @input="handleSearch"
                    @clear="handleClear"
                >
                  <template #prefix>
                    <el-icon>
                      <Search/>
                    </el-icon>
                  </template>
                </el-input>
              </div>
              <div class="calendar-container">
                <el-date-picker
                    v-model="selectedDate"
                    type="date"
                    placeholder="选择取卵日期"
                    @change="handleDateSelect"
                    value-format="YYYY-MM-DD"
                    class="date-picker"
                    clearable
                />
              </div>
            </div>
          </div>
        </template>

        <div class="table-section">
          <el-table
              :data="patients"
              style="width: 100%"
              @row-click="handleRowClick"
              :header-cell-style="{ background: '#f5f7fa', color: '#606266' }"
              border
              stripe
              highlight-current-row
              v-loading="loading"
          >
            <el-table-column
                prop="medical_record_number"
                label="病历编号"
                width="150"
                align="center"
            />
            <el-table-column
                prop="ovulation_cycle_number"
                label="取卵周期序号"
                width="150"
                align="center"
            />
            <el-table-column
                prop="date"
                label="取卵日期"
                align="center"
                width="130"
                :formatter="formatDate"
            />
            <el-table-column
                prop="female_age"
                label="年龄"
                width="95"
                align="center"
            />
            <el-table-column
                prop="female_bmi"
                label="BMI"
                width="95"
                align="center"
            />
            <el-table-column
                prop="treatment_cycle"
                label="治疗周期"
                width="115"
                align="center"
            />
            <el-table-column
                prop="infertility_years"
                label="不孕年限"
                width="115"
                align="center"
            />
            <el-table-column
                prop="infertility_type"
                label="不孕类型"
                width="120"
                align="center"
            />
            <el-table-column
                prop="infertility_object"
                label="不孕对象"
                width="120"
                align="center"
            />
            <el-table-column
                prop="infertility_cause"
                label="不孕原因"
                align="center"
            />
            <el-table-column
                prop="cdc_art_cause"
                label="CDC_ART病因"
                align="center"
            />
            <el-table-column
                prop="indication"
                label="适应症"
                align="center"
            />
          </el-table>
        </div>

        <div class="pagination-container">
          <el-pagination
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="pageSize"
              layout="total, sizes, prev, pager, next, jumper"
              :total="total"
              background
          />
        </div>
      </el-card>
    </div>

    <!-- 复用现有的病人详情预测弹窗 -->
    <patient-detail-dialog
        v-if="selectedPatient"
        :visible="dialogVisible"
        :patient="selectedPatient"
        @close="handleDialogClose"
    />
  </div>
</template>

<script>
import {ref, onMounted} from 'vue'
import {Search} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import PatientDetailDialog from '../../components/PatientDetailDialog.vue'
import request from '../../utils/request'

// 防抖函数
const debounce = (fn, delay) => {
  let timer = null
  return function (...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

export default {
  name: 'AIPrediction',
  components: {
    PatientDetailDialog,
    Search
  },
  setup() {
    const patients = ref([])
    const total = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const loading = ref(false)
    const searchQuery = ref('')
    const selectedDate = ref('')
    const dialogVisible = ref(false)
    const selectedPatient = ref(null)

    // 获取病人数据
    const fetchPatients = async (searchValue = '', selectedDateValue = '') => {
      loading.value = true
      try {
        const params = {
          page_num: currentPage.value,
          page_size: pageSize.value
        }

        if (searchValue) {
          params.medical_record_number = searchValue
        }

        if (selectedDateValue) {
          const date = new Date(selectedDateValue)
          const year = date.getFullYear()
          const month = date.getMonth() + 1
          const day = date.getDate()
          params.date = `${year}/${month}/${day} 0:00`
        }

        const response = await request.get('/patients/', {params})

        if (response.data.flag) {
          patients.value = response.data.data
          total.value = response.data.total
        } else {
          ElMessage.error(response.data.message || '获取数据失败')
        }
      } catch (error) {
        console.error('获取病人数据错误:', error)
        ElMessage.error('获取数据失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }

    // 创建防抖版本的搜索函数
    const debouncedFetch = debounce((value) => {
      fetchPatients(value, selectedDate.value)
    }, 500)

    // 页面加载时获取数据
    onMounted(() => {
      fetchPatients()
    })

    // 处理搜索输入
    const handleSearch = (query) => {
      searchQuery.value = query
      currentPage.value = 1
      debouncedFetch(query)
    }

    // 处理清空搜索
    const handleClear = () => {
      searchQuery.value = ''
      currentPage.value = 1
      fetchPatients('', selectedDate.value)
    }

    // 处理日期选择
    const handleDateSelect = (date) => {
      selectedDate.value = date
      currentPage.value = 1
      fetchPatients(searchQuery.value, date)
    }

    // 处理页码变化
    const handleCurrentChange = (page) => {
      currentPage.value = page
      fetchPatients(searchQuery.value, selectedDate.value)
    }

    // 处理每页条数变化
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      fetchPatients(searchQuery.value, selectedDate.value)
    }

    const handleRowClick = (row) => {
      selectedPatient.value = row
      dialogVisible.value = true
    }

    const handleDialogClose = () => {
      dialogVisible.value = false
      selectedPatient.value = null
    }

    // 格式化日期
    const formatDate = (row, column, cellValue) => {
      if (!cellValue) return ''
      return cellValue.replace(/ 0:00$/, '')
    }

    return {
      patients,
      total,
      currentPage,
      pageSize,
      loading,
      searchQuery,
      selectedDate,
      dialogVisible,
      selectedPatient,
      handleSearch,
      handleClear,
      handleDateSelect,
      handleCurrentChange,
      handleSizeChange,
      handleRowClick,
      handleDialogClose,
      formatDate
    }
  }
}
</script>

<style scoped>
.prediction-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 24px;
  background: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.page-header h2 {
  color: #1e3a8a;
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  color: #64748b;
  margin: 0;
  font-size: 14px;
}

.prediction-content {
  background: #ffffff;
  border-radius: 8px;
}

.patient-selection-card {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

/* 搜索和日期选择区域 */
.header-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-container {
  width: 320px;
}

.search-input :deep(.el-input__wrapper) {
  border: 1px solid #e2e8f0;
  box-shadow: none !important;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:hover),
.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #2563eb;
  background: #ffffff;
}

.calendar-container {
  width: 240px;
}

.date-picker :deep(.el-input__wrapper) {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  box-shadow: none !important;
  border-radius: 6px;
}

.date-picker :deep(.el-input__wrapper:hover),
.date-picker :deep(.el-input__wrapper.is-focus) {
  border-color: #2563eb;
  background: #ffffff;
}

.table-section {
  padding: 0;
}

.pagination-container {
  padding: 20px 24px;
  text-align: right;
  background: #f8fafc;
  border-top: 1px solid #e6e9f0;
}

/* 表格样式 */
:deep(.el-table) {
  --el-table-border-color: #e6e9f0;
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: #f1f5f9;
}

:deep(.el-table th) {
  background-color: var(--el-table-header-bg-color) !important;
  font-weight: 600;
  color: #1e3a8a;
  padding: 16px;
  border-bottom: 2px solid #e6e9f0;
}

:deep(.el-table td) {
  padding: 16px;
  color: #475569;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #f8fafc;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: var(--el-table-row-hover-bg-color) !important;
}
</style>