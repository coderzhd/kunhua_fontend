<template>
  <div class="delete-patient-container">
    <div class="page-header">
      <h2>删除病人数据</h2>
      <p>通过病例编号、取卵日期、取卵周期序号查询并删除病人数据</p>
    </div>

    <div class="content-section">
      <el-card class="table-card">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <h3 class="section-title">查询条件</h3>
            </div>
            <div class="header-controls">
              <div class="search-container">
                <el-input
                  v-model="searchForm.medical_record_number"
                  placeholder="请输入病例编号搜索"
                  class="search-input"
                  clearable
                >
                  <template #prefix>
                    <el-icon>
                      <Search/>
                    </el-icon>
                  </template>
                </el-input>
              </div>
              <div class="date-container">
                <el-date-picker
                  v-model="searchForm.date"
                  type="date"
                  placeholder="选择取卵日期筛选"
                  value-format="YYYY-MM-DD"
                  class="date-picker"
                  clearable
                />
              </div>
              <div class="cycle-container">
                <el-input
                  v-model="searchForm.ovulation_cycle_number"
                  placeholder="请输入取卵周期序号"
                  class="cycle-input"
                  clearable
                >
                  <template #prefix>
                    <el-icon>
                      <Document/>
                    </el-icon>
                  </template>
                </el-input>
              </div>
              <el-tag type="info">共 {{ total }} 条记录</el-tag>
            </div>
          </div>
        </template>

        <el-table
          :data="patientList"
          style="width: 100%"
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
          <el-table-column
            label="操作"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                @click="handleDelete(row)"
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

    <!-- 删除病人对话框 -->
    <delete-patient-dialog
      v-if="deleteDialogVisible"
      v-model="deleteDialogVisible"
      :medical-record-number="selectedPatient?.medical_record_number"
      :ovulation-cycle-number="selectedPatient?.ovulation_cycle_number"
      @close="handleDeleteDialogClose"
      @success="handleDeleteSuccess"
    />
  </div>
</template>

<script>
import { ref, reactive, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Document } from '@element-plus/icons-vue'
import request from '../../utils/request'
import DeletePatientDialog from '../../components/DeletePatientDialog.vue'

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
  name: 'DeletePatientData',
  components: {
    DeletePatientDialog,
    Search,
    Document
  },
  setup() {
    const loading = ref(false)
    const deleteDialogVisible = ref(false)
    const selectedPatient = ref(null)
    const patientList = ref([])
    const total = ref(0)
    const currentPage = ref(1)
    const pageSize = ref(10)
    
    const searchForm = reactive({
      medical_record_number: '',
      date: '',
      ovulation_cycle_number: ''
    })

    // 获取病人数据
    const fetchPatients = async () => {
      loading.value = true
      try {
        const params = {
          page_num: currentPage.value,
          page_size: pageSize.value
        }

        if (searchForm.medical_record_number) {
          params.medical_record_number = searchForm.medical_record_number
        }

        if (searchForm.date) {
          const date = new Date(searchForm.date)
          const year = date.getFullYear()
          const month = date.getMonth() + 1
          const day = date.getDate()
          params.date = `${year}/${month}/${day} 0:00`
        }

        if (searchForm.ovulation_cycle_number) {
          params.ovulation_cycle_number = searchForm.ovulation_cycle_number
        }

        const response = await request.get('/patients/', { params })
        
        if (response.data.flag) {
          patientList.value = response.data.data
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
    const debouncedFetch = debounce(() => {
      currentPage.value = 1
      fetchPatients()
    }, 500)

    // 监听搜索条件变化
    watch(
      () => [searchForm.medical_record_number, searchForm.date, searchForm.ovulation_cycle_number],
      () => {
        debouncedFetch()
      },
      { deep: true }
    )

    // 页面加载时获取数据
    onMounted(() => {
      fetchPatients()
    })

    // 处理页码变化
    const handleCurrentChange = (page) => {
      currentPage.value = page
      fetchPatients()
    }

    // 处理每页条数变化
    const handleSizeChange = (size) => {
      pageSize.value = size
      currentPage.value = 1
      fetchPatients()
    }

    const handleDeleteDialogClose = () => {
      deleteDialogVisible.value = false
      selectedPatient.value = null
    }

    const handleDeleteSuccess = () => {
      deleteDialogVisible.value = false
      selectedPatient.value = null
      ElMessage.success('删除成功')
      // 重新查询数据
      fetchPatients()
    }

    const handleDelete = (patient) => {
      selectedPatient.value = patient
      deleteDialogVisible.value = true
    }

    // 格式化日期
    const formatDate = (row, column, cellValue) => {
      if (!cellValue) return ''
      return cellValue.replace(/ 0:00$/, '')
    }

    return {
      searchForm,
      loading,
      deleteDialogVisible,
      selectedPatient,
      patientList,
      total,
      currentPage,
      pageSize,
      handleCurrentChange,
      handleSizeChange,
      handleDeleteDialogClose,
      handleDeleteSuccess,
      handleDelete,
      formatDate
    }
  }
}
</script>

<style scoped>
.delete-patient-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  text-align: center;
  margin-bottom: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 24px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.page-header h2 {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.page-header p {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
}

.content-section {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.table-card {
  border: none;
  box-shadow: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.header-left h3 {
  margin: 0;
  color: #1e3a8a;
  font-size: 18px;
  font-weight: 600;
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

.header-controls {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-container,
.date-container,
.cycle-container {
  min-width: 200px;
}

.search-input,
.cycle-input {
  width: 220px;
}

.date-picker {
  width: 200px;
}

:deep(.el-button .el-icon) {
  vertical-align: middle;
  position: relative;
  top: -1.5px;
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

.pagination-container {
  padding: 20px 24px;
  text-align: right;
  background: #f8fafc;
  border-top: 1px solid #e6e9f0;
}

/* 响应式设计 */
@media screen and (max-width: 1200px) {
  .card-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-controls {
    justify-content: space-between;
  }

  .search-container,
  .date-container,
  .cycle-container {
    flex: 1;
    min-width: 200px;
  }
}

@media screen and (max-width: 768px) {
  .edit-patient-container {
    padding: 16px;
  }

  .page-header {
    padding: 24px 16px;
  }

  .page-header h2 {
    font-size: 24px;
  }

  .header-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container,
  .date-container,
  .cycle-container {
    width: 100%;
  }

  .search-input,
  .cycle-input,
  .date-picker {
    width: 100%;
  }
}
</style>