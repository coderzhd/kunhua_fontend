<template>
  <el-dialog
      title="删除病人数据"
      v-model="dialogVisible"
      width="70%"
      :before-close="handleClose"
  >
    <div v-loading="loading">
      <!-- 胚胎数据展示区域 -->
      <div class="embryo-list">
        <div class="select-all">
          <el-checkbox
              v-model="selectAll"
              @change="handleSelectAll"
          >
            全选
          </el-checkbox>
        </div>

        <el-scrollbar>
          <div class="embryo-container">
            <div
                v-for="(embryo, index) in embryoList"
                :key="embryo.id"
                class="embryo-item"
                :class="{ active: selectedEmbryoId === embryo.id }"
            >
              <el-checkbox
                  v-model="embryo.selected"
                  @change="handleCheckboxChange"
              />
              <div
                  class="embryo-card"
                  @click="toggleEmbryo(embryo)"
              >
                胚胎 {{ index + 1 }}
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>

      <!-- 胚胎详细数据展示 -->
      <div v-if="selectedEmbryoId !== null" class="embryo-details">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="病历编号">
            {{ formatValue(selectedEmbryoData?.medical_record_number) }}
          </el-descriptions-item>
          <el-descriptions-item label="取卵周期序号">
            {{ formatValue(selectedEmbryoData?.ovulation_cycle_number) }}
          </el-descriptions-item>
          <el-descriptions-item label="统计日期">
            {{ formatValue(selectedEmbryoData?.date) }}
          </el-descriptions-item>
          <el-descriptions-item label="年龄">
            {{ formatValue(selectedEmbryoData?.female_age) }}
          </el-descriptions-item>
          <el-descriptions-item label="女方BMI">
            {{ formatValue(selectedEmbryoData?.female_bmi) }}
          </el-descriptions-item>
          <el-descriptions-item label="男方年龄">
            {{ formatValue(selectedEmbryoData?.male_age) }}
          </el-descriptions-item>
          <el-descriptions-item label="bFSH">
            {{ formatValue(selectedEmbryoData?.bFSH) }}
          </el-descriptions-item>
          <el-descriptions-item label="bLH">
            {{ formatValue(selectedEmbryoData?.bLH) }}
          </el-descriptions-item>
          <el-descriptions-item label="bPRL">
            {{ formatValue(selectedEmbryoData?.bPRL) }}
          </el-descriptions-item>
          <el-descriptions-item label="bE2">
            {{ formatValue(selectedEmbryoData?.bE2) }}
          </el-descriptions-item>
          <el-descriptions-item label="bPo">
            {{ formatValue(selectedEmbryoData?.bPo) }}
          </el-descriptions-item>
          <el-descriptions-item label="bT">
            {{ formatValue(selectedEmbryoData?.bT) }}
          </el-descriptions-item>
          <el-descriptions-item label="AMH">
            {{ formatValue(selectedEmbryoData?.AMH) }}
          </el-descriptions-item>
          <el-descriptions-item label="Day3FSH">
            {{ formatValue(selectedEmbryoData?.Day3FSH) }}
          </el-descriptions-item>
          <el-descriptions-item label="Day3LH">
            {{ formatValue(selectedEmbryoData?.Day3LH) }}
          </el-descriptions-item>
          <el-descriptions-item label="Day3E2">
            {{ formatValue(selectedEmbryoData?.Day3E2) }}
          </el-descriptions-item>
          <el-descriptions-item label="Day3AMH">
            {{ formatValue(selectedEmbryoData?.D3AMH) }}
          </el-descriptions-item>
          <el-descriptions-item label="HCG日LH">
            {{ formatValue(selectedEmbryoData?.HCG_day_LH) }}
          </el-descriptions-item>
          <el-descriptions-item label="HCG日E2">
            {{ formatValue(selectedEmbryoData?.HCG_day_E2) }}
          </el-descriptions-item>
          <el-descriptions-item label="HCG日Po">
            {{ formatValue(selectedEmbryoData?.HCG_day_Po) }}
          </el-descriptions-item>
          <el-descriptions-item label="HCG日内膜厚度">
            {{ formatValue(selectedEmbryoData?.HCG_day_endometrial_thickness) }}
          </el-descriptions-item>
          <el-descriptions-item label="HCG日内膜类型">
            {{ formatValue(selectedEmbryoData?.HCG_day_endometrial_type) }}
          </el-descriptions-item>
          <el-descriptions-item label="HCG日卵泡数">
            {{ formatValue(selectedEmbryoData?.HCG_day_follicle_count) }}
          </el-descriptions-item>
          <el-descriptions-item label="扳机用药(扳机1用药)">
            {{ formatValue(selectedEmbryoData?.trigger_medication) }}
          </el-descriptions-item>
          <el-descriptions-item label="扳机用药量(扳机1用量)">
            {{ formatValue(selectedEmbryoData?.trigger_dose) }}
          </el-descriptions-item>
          <el-descriptions-item label="左卵巢窦状卵泡">
            {{ formatValue(selectedEmbryoData?.left_ovary_follicles) }}
          </el-descriptions-item>
          <el-descriptions-item label="右卵巢窦状卵泡">
            {{ formatValue(selectedEmbryoData?.right_ovary_follicles) }}
          </el-descriptions-item>
          <el-descriptions-item label="窦卵泡数">
            {{ formatValue(selectedEmbryoData?.antral_follicle_count) }}
          </el-descriptions-item>
          <el-descriptions-item label="治疗周期">
            {{ formatValue(selectedEmbryoData?.treatment_cycle) }}
          </el-descriptions-item>
          <el-descriptions-item label="不孕年限">
            {{ formatValue(selectedEmbryoData?.infertility_years) }}
          </el-descriptions-item>
          <el-descriptions-item label="不孕原因">
            {{ formatValue(selectedEmbryoData?.infertility_cause) }}
          </el-descriptions-item>
          <el-descriptions-item label="CDC_ART病因">
            {{ formatValue(selectedEmbryoData?.cdc_art_cause) }}
          </el-descriptions-item>
          <el-descriptions-item label="不孕类型">
            {{ formatValue(selectedEmbryoData?.infertility_type) }}
          </el-descriptions-item>
          <el-descriptions-item label="不孕对象">
            {{ formatValue(selectedEmbryoData?.infertility_object) }}
          </el-descriptions-item>
          <el-descriptions-item label="适应症">
            {{ formatValue(selectedEmbryoData?.indication) }}
          </el-descriptions-item>
          <el-descriptions-item label="促排方案">
            {{ formatValue(selectedEmbryoData?.stimulation_scheme) }}
          </el-descriptions-item>
          <el-descriptions-item label="促排用药量(Gn起始剂量)">
            {{ formatValue(selectedEmbryoData?.stimulation_dose) }}
          </el-descriptions-item>
          <el-descriptions-item label="授精方式">
            {{ formatValue(selectedEmbryoData?.fertilization_method) }}
          </el-descriptions-item>
          <el-descriptions-item label="sPN状态">
            {{ formatValue(selectedEmbryoData?.spn_status) }}
          </el-descriptions-item>
          <el-descriptions-item label="sPN分级">
            {{ formatValue(selectedEmbryoData?.spn_grade) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD1形态">
            {{ formatValue(selectedEmbryoData?.sd1_morphology) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD1胞质">
            {{ formatValue(selectedEmbryoData?.sd1_cytoplasm) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD2卵裂球">
            {{ formatValue(selectedEmbryoData?.sd2_num) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD2胞核">
            {{ formatValue(selectedEmbryoData?.sd2_nucleus) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD2大小">
            {{ formatValue(selectedEmbryoData?.sd2_size) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD2形态">
            {{ formatValue(selectedEmbryoData?.sd2_morphology) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD2胞质">
            {{ formatValue(selectedEmbryoData?.sd2_cytoplasm) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD2碎片">
            {{ formatValue(selectedEmbryoData?.sd2_fragments) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD3卵裂球数目">
            {{ formatValue(selectedEmbryoData?.sd3_num) }}
          </el-descriptions-item>
          <el-descriptions-item label="GR">
            {{ formatValue(selectedEmbryoData?.gr) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD3胞核">
            {{ formatValue(selectedEmbryoData?.sd3_nucleus) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD3大小">
            {{ formatValue(selectedEmbryoData?.sd3_size) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD3形态">
            {{ formatValue(selectedEmbryoData?.sd3_morphology) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD3胞质">
            {{ formatValue(selectedEmbryoData?.sd3_cytoplasm) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD3致密">
            {{ formatValue(selectedEmbryoData?.sd3_dense) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD3ZP">
            {{ formatValue(selectedEmbryoData?.sd3_zp) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD3空泡">
            {{ formatValue(selectedEmbryoData?.sd3_vacuole) }}
          </el-descriptions-item>
          <el-descriptions-item label="sD3碎片">
            {{ formatValue(selectedEmbryoData?.sd3_fragments) }}
          </el-descriptions-item>
          <el-descriptions-item label="fD5囊胚分级">
            {{ formatValue(selectedEmbryoData?.fd5_grade) }}
          </el-descriptions-item>
          <el-descriptions-item label="fD6囊胚分级">
            {{ formatValue(selectedEmbryoData?.fd6_grade) }}
          </el-descriptions-item>
          <el-descriptions-item label="fD7囊胚分级">
            {{ formatValue(selectedEmbryoData?.fd7_grade) }}
          </el-descriptions-item>
          <el-descriptions-item label="第二极体出现时间">
            {{ formatValue(selectedEmbryoData?.second_polar_body_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="第二极体结束时间">
            {{ formatValue(selectedEmbryoData?.second_polar_end_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="原核出现时间">
            {{ formatValue(selectedEmbryoData?.pronucleus_appearance) }}
          </el-descriptions-item>
          <el-descriptions-item label="原核消失时间">
            {{ formatValue(selectedEmbryoData?.pronucleus_disappearance) }}
          </el-descriptions-item>
          <el-descriptions-item label="初次卵裂的时间">
            {{ formatValue(selectedEmbryoData?.first_cleavage_time) }}
          </el-descriptions-item>
          <el-descriptions-item label="t3">
            {{ formatValue(selectedEmbryoData?.t3) }}
          </el-descriptions-item>
          <el-descriptions-item label="t4">
            {{ formatValue(selectedEmbryoData?.t4) }}
          </el-descriptions-item>
          <el-descriptions-item label="t5">
            {{ formatValue(selectedEmbryoData?.t5) }}
          </el-descriptions-item>
          <el-descriptions-item label="t6">
            {{ formatValue(selectedEmbryoData?.t6) }}
          </el-descriptions-item>
          <el-descriptions-item label="t7">
            {{ formatValue(selectedEmbryoData?.t7) }}
          </el-descriptions-item>
          <el-descriptions-item label="t8">
            {{ formatValue(selectedEmbryoData?.t8) }}
          </el-descriptions-item>
          <el-descriptions-item label="t9">
            {{ formatValue(selectedEmbryoData?.t9) }}
          </el-descriptions-item>
          <el-descriptions-item label="tB">
            {{ formatValue(selectedEmbryoData?.tB) }}
          </el-descriptions-item>
          <el-descriptions-item label="tDead">
            {{ formatValue(selectedEmbryoData?.tDead) }}
          </el-descriptions-item>
          <el-descriptions-item label="tEB">
            {{ formatValue(selectedEmbryoData?.tEB) }}
          </el-descriptions-item>
          <el-descriptions-item label="tHB">
            {{ formatValue(selectedEmbryoData?.tHB) }}
          </el-descriptions-item>
          <el-descriptions-item label="tM">
            {{ formatValue(selectedEmbryoData?.tM) }}
          </el-descriptions-item>
          <el-descriptions-item label="tSB">
            {{ formatValue(selectedEmbryoData?.tSB) }}
          </el-descriptions-item>
          <el-descriptions-item label="tSC">
            {{ formatValue(selectedEmbryoData?.tSC) }}
          </el-descriptions-item>
          <el-descriptions-item label="PPB">
            {{ formatValue(selectedEmbryoData?.PPB) }}
          </el-descriptions-item>
          <el-descriptions-item label="L1">
            {{ formatValue(selectedEmbryoData?.L1) }}
          </el-descriptions-item>
          <el-descriptions-item label="L2">
            {{ formatValue(selectedEmbryoData?.L2) }}
          </el-descriptions-item>
          <el-descriptions-item label="L3">
            {{ formatValue(selectedEmbryoData?.L3) }}
          </el-descriptions-item>
          <el-descriptions-item label="CC2">
            {{ formatValue(selectedEmbryoData?.CC2) }}
          </el-descriptions-item>
          <el-descriptions-item label="s2">
            {{ formatValue(selectedEmbroData?.s2) }}
          </el-descriptions-item>
          <el-descriptions-item label="CC3">
            {{ formatValue(selectedEmbryoData?.CC3) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
            type="danger"
            @click="handleDelete"
            :loading="deleteLoading"
            :disabled="!hasSelectedEmbryos"
        >
          删除数据
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import request from '../utils/request'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  medicalRecordNumber: {
    type: String,
    required: true
  },
  ovulationCycleNumber: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'success'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const deleteLoading = ref(false)
const embryoList = ref([])
const selectedEmbryoId = ref(null)
const selectAll = ref(false)

// 格式化显示值
const formatValue = (value) => {
  return value !== null && value !== undefined && value !== '' ? value : '-'
}

// 获取胚胎数据
const fetchEmbryoData = async () => {
  loading.value = true
  try {
    const params = {phase: 6}
    // 添加取卵周期序号参数
    if (props.ovulationCycleNumber) {
      params.ovulation_cycle_number = props.ovulationCycleNumber
    }

    const response = await request.get(`/patients/${props.medicalRecordNumber}`, {
      params
    })
    if (response.data.flag) {
      embryoList.value = response.data.data.map(item => ({
        ...item,
        selected: false
      }))
    }
  } catch (error) {
    console.error('获取胚胎数据错误:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 切换胚胎选择状态
const toggleEmbryo = (embryo) => {
  if (selectedEmbryoId.value === embryo.id) {
    selectedEmbryoId.value = null
  } else {
    selectedEmbryoId.value = embryo.id
  }
}

// 处理全选
const handleSelectAll = (val) => {
  embryoList.value.forEach(embryo => {
    embryo.selected = val
  })
}

// 处理单个选择框变化
const handleCheckboxChange = () => {
  selectAll.value = embryoList.value.every(embryo => embryo.selected)
}

// 获取选中的胚胎数据
const selectedEmbryoData = computed(() => {
  return embryoList.value.find(embryo => embryo.id === selectedEmbryoId.value)
})

// 是否有选中的胚胎
const hasSelectedEmbryos = computed(() => {
  return embryoList.value.some(embryo => embryo.selected)
})

// 处理删除
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除选中的胚胎数据吗？', '警告', {
      type: 'warning'
    })

    deleteLoading.value = true
    const selectedEmbryos = embryoList.value.filter(embryo => embryo.selected)

    for (const embryo of selectedEmbryos) {
      await request.delete(`/patients/${embryo.id}`)
    }

    ElMessage.success('删除成功')

    // 清除选择状态
    selectAll.value = false
    selectedEmbryoId.value = null

    // 重新获取数据
    await fetchEmbryoData()

    // 只有在所有胚胎都被删除时才关闭对话框
    if (embryoList.value.length === 0) {
      emit('success')
    }

  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除错误:', error)
      ElMessage.error('删除失败')
    }
  } finally {
    deleteLoading.value = false
  }
}

// 处理关闭
const handleClose = () => {
  emit('close')
}

// 初始化时获取数据
onMounted(() => {
  fetchEmbryoData()
})
</script>

<style scoped>
.embryo-list {
  margin-bottom: 20px;
}

.select-all {
  margin-bottom: 10px;
}

.embryo-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.embryo-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.embryo-card {
  padding: 10px 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none; /* 防止文本被选中 */
}

.embryo-card:hover {
  border-color: #409eff;
}

.embryo-item.active .embryo-card {
  background-color: #ecf5ff;
  border-color: #409eff;
}

.embryo-details {
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>