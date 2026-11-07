<template>
  <div class="app">
    <div class="app-header">
      <div class="header-top">
        <h1 class="app-title">AI辅助胚胎发育预测系统</h1>
        <div class="user-info">
          <el-button type="primary" size="small" @click="goToNewVersion" style="margin-right: 10px;">
            新版页面
          </el-button>
          <span class="username">{{ username }}</span>
          <el-button type="text" @click="handleLogout">登出</el-button>
        </div>
      </div>
      <div class="header-controls">
        <div class="search-container">
          <el-input
              v-model="searchQuery"
              placeholder="请输入病例编号搜索"
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
              :locale="zhCn"
          />
        </div>
      </div>
    </div>

    <div class="content">
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <h4>病例数据列表</h4>
            <div class="header-right">
              <el-button
                  v-if="userRole === 'admin'"
                  type="primary"
                  @click="handleAddPatient"
                  :icon="Plus"
              >
                新增病人数据
              </el-button>
              <el-tag type="info">共 {{ total }} 条记录</el-tag>
            </div>
          </div>
        </template>

        <el-table
            ref="patientTable"
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
              width="120"
              align="center"
          />
          <el-table-column
              prop="ovulation_cycle_number"
              label="取卵周期序号"
              width="120"
              align="center"
          />
          <el-table-column
              prop="date"
              label="取卵日期"
              align="center"
              width="120"
              :formatter="formatDate"
          />
          <el-table-column
              prop="female_age"
              label="女方年龄"
              width="100"
              align="center"
          />
          <el-table-column
              prop="female_bmi"
              label="女方BMI"
              width="100"
              align="center"
          />
          <el-table-column
              prop="treatment_cycle"
              label="治疗周期"
              width="100"
              align="center"
          />
          <el-table-column
              prop="infertility_years"
              label="不孕年限"
              width="100"
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
              prop="indication"
              label="适应症"
              align="center"
          />
          <el-table-column
              v-if="userRole === 'admin'"
              label="操作"
              width="200"
              align="center"
          >
            <template #default="{ row }">
              <el-button
                  type="primary"
                  size="small"
                  @click.stop="handleEdit(row)"
              >
                修改
              </el-button>
              <el-button
                  type="danger"
                  size="small"
                  @click.stop="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

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

    <patient-detail-dialog
        v-if="selectedPatient"
        :visible="dialogVisible"
        :patient="selectedPatient"
        @close="handleDialogClose"
    />

    <add-patient-dialog
        v-if="addDialogVisible"
        v-model="addDialogVisible"
        @close="handleAddDialogClose"
        @success="handleAddSuccess"
    />

    <delete-patient-dialog
        v-if="deleteDialogVisible"
        v-model="deleteDialogVisible"
        :medical-record-number="selectedPatient?.medical_record_number"
        :ovulation-cycle-number="selectedPatient?.ovulation_cycle_number"
        @close="handleDeleteDialogClose"
        @success="handleDeleteSuccess"
    />

    <edit-patient-dialog
        v-if="editDialogVisible"
        v-model="editDialogVisible"
        :medical-record-number="selectedPatient?.medical_record_number"
        :ovulation-cycle-number="selectedPatient?.ovulation_cycle_number"
        @close="handleEditDialogClose"
        @success="handleEditSuccess"
    />
  </div>
</template>

<script>
import PatientDetailDialog from '../components/PatientDetailDialog.vue'
import request from '../utils/request'
import {ref, computed, onMounted} from 'vue'
import {Search, Plus} from '@element-plus/icons-vue'
import {useRouter} from 'vue-router'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import {ElMessage} from 'element-plus'
import AddPatientDialog from '../components/AddPatientDialog.vue'
import DeletePatientDialog from '../components/DeletePatientDialog.vue'
import EditPatientDialog from '../components/EditPatientDialog.vue'

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
  name: 'Home',
  components: {
    PatientDetailDialog,
    Search,
    AddPatientDialog,
    DeletePatientDialog,
    EditPatientDialog,
  },
  setup() {
    const router = useRouter()
    const username = ref('')
    const patients = ref([])
    const total = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const loading = ref(false)
    const searchQuery = ref('')
    const selectedDate = ref('')
    const dialogVisible = ref(false)
    const selectedPatient = ref(null)
    const addDialogVisible = ref(false)
    const deleteDialogVisible = ref(false)
    const editDialogVisible = ref(false)
    const patientTable = ref(null)

    // 获取病人数据
    const fetchPatients = async (searchValue = '', selectedDateValue = '') => {
      loading.value = true
      try {
        const params = {
          page_num: currentPage.value,
          page_size: pageSize.value
        }

        // 如果有搜索值，添加到请求参数中
        if (searchValue) {
          params.medical_record_number = searchValue
        }

        // 如果有日期值，添加到请求参数中
        if (selectedDateValue) {
          // 将日期格式化为 "YYYY/M/D 0:00"
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
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user) {
        router.push('/login')
        return
      }
      username.value = user.username
      fetchPatients()
    })

    const handleLogout = () => {
      localStorage.removeItem('user')
      router.push('/login')
    }

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
      // 清除表格选中行的高亮状态
      if (patientTable.value) {
        patientTable.value.setCurrentRow()
      }
    }

    // 从localStorage获取用户角色
    const userRole = computed(() => {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      return user.role || ''
    })

    // 处理新增病人数据按钮点击
    const handleAddPatient = () => {
      addDialogVisible.value = true
    }

    // 处理新增对话框关闭
    const handleAddDialogClose = () => {
      addDialogVisible.value = false
    }

    // 处理新增成功
    const handleAddSuccess = () => {
      addDialogVisible.value = false
      searchQuery.value = '' // 清空搜索栏
      fetchPatients() // 重新获取病人列表
      ElMessage.success('新增病人数据成功')
    }

    const handleDelete = (row) => {
      selectedPatient.value = row
      deleteDialogVisible.value = true
    }

    const handleDeleteDialogClose = () => {
      deleteDialogVisible.value = false
      selectedPatient.value = null
    }

    const handleDeleteSuccess = () => {
      deleteDialogVisible.value = false
      selectedPatient.value = null
      searchQuery.value = '' // 清空搜索栏
      fetchPatients() // 重新获取病人列表
    }

    const handleEdit = (row) => {
      selectedPatient.value = row
      editDialogVisible.value = true
    }

    const handleEditDialogClose = () => {
      editDialogVisible.value = false
      selectedPatient.value = null
    }

    const handleEditSuccess = () => {
      editDialogVisible.value = false
      selectedPatient.value = null
      searchQuery.value = '' // 清空搜索栏
      fetchPatients() // 重新获取病人列表
    }

    // 跳转到新版页面
    const goToNewVersion = () => {
      router.push('/')
    }

    // 格式化日期，移除时间后缀
    const formatDate = (row, column, cellValue) => {
      if (!cellValue) return ''
      // 移除 ' 0:00' 后缀
      return cellValue.replace(/ 0:00$/, '')
    }

    return {
      patients,
      total,
      currentPage,
      pageSize,
      loading,
      username,
      handleCurrentChange,
      handleSizeChange,
      handleLogout,
      handleRowClick,
      handleDialogClose,
      dialogVisible,
      selectedPatient,
      searchQuery,
      selectedDate,
      handleSearch,
      handleDateSelect,
      zhCn,
      handleClear,
      userRole,
      addDialogVisible,
      handleAddPatient,
      handleAddDialogClose,
      handleAddSuccess,
      Plus,
      deleteDialogVisible,
      handleDelete,
      handleDeleteDialogClose,
      handleDeleteSuccess,
      editDialogVisible,
      handleEdit,
      handleEditDialogClose,
      handleEditSuccess,
      patientTable,
      formatDate,
      goToNewVersion,
    }
  }
}
</script>

<style scoped>
.app {
  padding: 24px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 头部样式优化 */
.app-header {
  margin-bottom: 24px;
  background: #ffffff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e6e9f0;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e6e9f0;
}

.app-title {
  color: #1e3a8a;
  font-size: 24px;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 24px;
  background: #2563eb;
  border-radius: 2px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: #475569;
  font-size: 14px;
  font-weight: 500;
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

/* 表格卡片样式 */
.table-card {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e6e9f0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e6e9f0;
  background: #f8fafc;
  border-radius: 8px 8px 0 0;
}

.card-header h4 {
  font-size: 16px;
  color: #1e3a8a;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 表格样式优化 */
.content :deep(.el-table) {
  --el-table-border-color: #e6e9f0;
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: #f1f5f9;
}

.content :deep(.el-table th) {
  background-color: var(--el-table-header-bg-color) !important;
  font-weight: 600;
  color: #1e3a8a;
  padding: 16px;
  border-bottom: 2px solid #e6e9f0;
}

.content :deep(.el-table td) {
  padding: 16px;
  color: #475569;
}

.content :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background: #f8fafc;
}

.content :deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: var(--el-table-row-hover-bg-color) !important;
}

/* 分页器样式 */
.pagination-container {
  padding: 20px 24px;
  text-align: right;
  background: #f8fafc;
  border-top: 1px solid #e6e9f0;
  border-radius: 0 0 8px 8px;
}

:deep(.el-pagination.is-background) {
  --el-pagination-hover-color: #2563eb;
  --el-pagination-button-color: #475569;
  --el-pagination-hover-bg-color: #f1f5f9;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #2563eb;
  color: #ffffff;
}

/* 标签样式 */
:deep(.el-tag) {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: #475569;
  border-radius: 4px;
  padding: 0 12px;
  height: 28px;
  font-weight: 500;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .app {
    padding: 16px;
  }

  .header-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container,
  .calendar-container {
    width: 100%;
  }

  .app-header {
    padding: 16px;
  }

  .table-card {
    margin: 0 -8px;
  }
}
</style>