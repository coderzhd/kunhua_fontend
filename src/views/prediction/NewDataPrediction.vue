<template>
  <div class="new-prediction-container">
    <div class="page-header">
      <h2>新建数据预测</h2>
      <p>输入新的病人数据进行AI胚胎发育预测</p>
    </div>

    <div class="prediction-content">
      <!-- 数据输入表单 -->
      <el-card class="form-card">
        <template #header>
          <div class="card-header">
            <h3 class="section-title">预测数据录入</h3>
            <div class="header-placeholder"></div>
          </div>
        </template>

        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="140px"
            class="prediction-form"
        >
          <!-- 预测阶段选择 -->
          <div class="form-section">
            <h4 class="section-title">预测设置</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="预测阶段" prop="phase">
                  <el-select v-model="formData.phase" placeholder="请选择预测阶段" style="width: 100%">
                    <el-option label="术前诊断" :value="1"/>
                    <el-option label="促排卵启动后" :value="2"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="是否保存数据">
                  <el-switch v-model="saveData" active-text="保存" inactive-text="不保存"/>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 基础信息 - 仅在保存数据时显示 -->
          <div v-if="saveData" class="form-section">
            <h4 class="section-title">基础信息</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="病历编号" prop="medical_record_number">
                  <el-input v-model="formData.medical_record_number" placeholder="请输入病历编号"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="取卵周期序号" prop="ovulation_cycle_number">
                  <el-input v-model="formData.ovulation_cycle_number" placeholder="请输入取卵周期序号"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="取卵日期" prop="date">
                  <el-date-picker
                      v-model="formData.date"
                      type="date"
                      placeholder="选择日期"
                      value-format="YYYY/M/D 0:00"
                      style="width: 100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 年龄和BMI信息 -->
          <div class="form-section">
            <h4 class="section-title">年龄与体征信息</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="女方年龄" prop="female_age">
                  <el-input-number
                      v-model="formData.female_age"
                      :precision="1"
                      :step="0.1"
                      style="width: 100%"
                      placeholder="女方年龄"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="女方BMI" prop="female_bmi">
                  <el-input-number
                      v-model="formData.female_bmi"
                      :precision="1"
                      :step="0.1"
                      style="width: 100%"
                      placeholder="女方BMI"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="男方年龄" prop="male_age">
                  <el-input-number
                      v-model="formData.male_age"
                      :precision="1"
                      :step="0.1"
                      style="width: 100%"
                      placeholder="男方年龄"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 激素水平 -->
          <div class="form-section">
            <h4 class="section-title">激素水平</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="bFSH">
                  <el-input-number v-model="formData.bFSH" :precision="2" placeholder="bFSH" style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="bLH">
                  <el-input-number v-model="formData.bLH" :precision="2" placeholder="bLH" style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="bE2">
                  <el-input-number v-model="formData.bE2" :precision="2" placeholder="bE2" style="width: 100%"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="AMH">
                  <el-input-number v-model="formData.AMH" :precision="2" placeholder="AMH" style="width: 100%"/>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 阶段2特有字段 -->
          <div v-if="formData.phase === 2" class="form-section">
            <h4 class="section-title">促排卵启动后数据</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="Day3FSH">
                  <el-input-number v-model="formData.Day3FSH" :precision="2" placeholder="Day3FSH" style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Day3LH">
                  <el-input-number v-model="formData.Day3LH" :precision="2" placeholder="Day3LH" style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="Day3E2">
                  <el-input-number v-model="formData.Day3E2" :precision="2" placeholder="Day3E2" style="width: 100%"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="Day3AMH">
                  <el-input-number v-model="formData.Day3AMH" :precision="2" placeholder="Day3AMH" style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="HCG日LH">
                  <el-input-number v-model="formData.HCG_day_LH" :precision="2" placeholder="HCG日LH"
                                   style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="HCG日E2">
                  <el-input-number v-model="formData.HCG_day_E2" :precision="2" placeholder="HCG日E2"
                                   style="width: 100%"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="HCG日Po">
                  <el-input-number v-model="formData.HCG_day_Po" :precision="2" placeholder="HCG日Po"
                                   style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="HCG日内膜厚度">
                  <el-input-number v-model="formData.HCG_day_endometrial_thickness" :precision="2"
                                   placeholder="HCG日内膜厚度" style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="HCG日内膜类型">
                  <el-input v-model="formData.HCG_day_endometrial_type" placeholder="HCG日内膜类型"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="HCG日卵泡数">
                  <el-input-number v-model="formData.HCG_day_follicle_count" :min="0" placeholder="HCG日卵泡数"
                                   style="width: 100%"/>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 卵泡信息 -->
          <div class="form-section">
            <h4 class="section-title">卵泡信息</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="左卵巢窦状卵泡数">
                  <el-input-number v-model="formData.left_ovary_follicles" :min="0" placeholder="左卵巢窦状卵泡数"
                                   style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="右卵巢窦状卵泡数">
                  <el-input-number v-model="formData.right_ovary_follicles" :min="0" placeholder="右卵巢窦状卵泡数"
                                   style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="窦卵泡数">
                  <el-input-number v-model="formData.antral_follicle_count" :min="0" placeholder="窦卵泡数"
                                   style="width: 100%"/>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 治疗信息 -->
          <div class="form-section">
            <h4 class="section-title">治疗信息</h4>
            <el-row :gutter="20" v-if="formData.phase === 1">
              <el-col :span="8">
                <el-form-item label="促排方案" prop="stimulation_scheme">
                  <el-select v-model="formData.stimulation_scheme" placeholder="请选择促排方案" style="width: 100%">
                    <el-option label="LPS" value="LPS"/>
                    <el-option label="PPOS" value="PPOS"/>
                    <el-option label="超短方案" value="超短方案"/>
                    <el-option label="超长方案" value="超长方案"/>
                    <el-option label="促排周期" value="促排周期"/>
                    <el-option label="低刺激方案" value="低刺激方案"/>
                    <el-option label="短方案" value="短方案"/>
                    <el-option label="改良超长方案" value="改良超长方案"/>
                    <el-option label="改良黄体期长方案" value="改良黄体期长方案"/>
                    <el-option label="改良黄长方案" value="改良黄长方案"/>
                    <el-option label="改良长方案" value="改良长方案"/>
                    <el-option label="黄体期超长方案" value="黄体期超长方案"/>
                    <el-option label="黄体期促排方案" value="黄体期促排方案"/>
                    <el-option label="黄体期长方案" value="黄体期长方案"/>
                    <el-option label="降调-替代周期" value="降调-替代周期"/>
                    <el-option label="拮抗剂方案" value="拮抗剂方案"/>
                    <el-option label="灵活方案" value="灵活方案"/>
                    <el-option label="卵泡期长方案" value="卵泡期长方案"/>
                    <el-option label="全CC方案" value="全CC方案"/>
                    <el-option label="替代周期" value="替代周期"/>
                    <el-option label="自然周期" value="自然周期"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="促排用药量">
                  <el-input-number v-model="formData.stimulation_dose" :precision="2"
                                   placeholder="促排用药量(Gn起始剂量)"
                                   style="width: 100%"/>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20" v-if="formData.phase === 2">
              <el-col :span="8">
                <el-form-item label="扳机用药">
                  <el-select v-model="formData.trigger_medication" placeholder="扳机用药(扳机1用药)"
                             style="width: 100%">
                    <el-option label="HCG" value="HCG"/>
                    <el-option label="HCG(国产)" value="HCG(国产)"/>
                    <el-option label="HCG(进口)" value="HCG(进口)"/>
                    <el-option label="艾泽" value="艾泽"/>
                    <el-option label="保福赐" value="保福赐"/>
                    <el-option label="达必佳" value="达必佳"/>
                    <el-option label="达菲林" value="达菲林"/>
                    <el-option label="金磊" value="金磊"/>
                    <el-option label="曲普瑞林" value="曲普瑞林"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="扳机用药量">
                  <el-input-number v-model="formData.trigger_dose" :precision="2" placeholder="扳机用药量（扳机1用量）"
                                   style="width: 100%"/>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 不孕信息 -->
          <div class="form-section">
            <h4 class="section-title">不孕信息</h4>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="不孕年限">
                  <el-input-number v-model="formData.infertility_years" :min="0" placeholder="不孕年限"
                                   style="width: 100%"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="不孕原因">
                  <el-input v-model="formData.infertility_cause" placeholder="请输入不孕原因"/>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="不孕类型">
                  <el-select v-model="formData.infertility_type" placeholder="请选择不孕类型" style="width: 100%">
                    <el-option label="原发性不孕" value="原发性不孕"/>
                    <el-option label="继发性不孕" value="继发性不孕"/>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="不孕对象">
                  <el-select v-model="formData.infertility_object" placeholder="请选择不孕对象" style="width: 100%">
                    <el-option label="女方因素" value="女方因素"/>
                    <el-option label="男方因素" value="男方因素"/>
                    <el-option label="双方因素" value="双方因素"/>
                    <el-option label="不明原因" value="不明原因"/>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="适应症">
                  <el-input v-model="formData.indication" placeholder="请输入适应症"/>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <el-button @click="resetForm">重置</el-button>
            <el-button type="primary" @click="handlePredict" :loading="predicting">开始预测</el-button>
          </div>
        </el-form>
      </el-card>

      <!-- 预测结果 -->
      <el-card v-if="predictionResult" class="result-card">
        <template #header>
          <h3>预测结果</h3>
        </template>

        <div class="result-content">
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="result-item">
                <div class="result-label">卵子利用率</div>
                <div class="result-value">{{ (predictionResult.egg_utilization_rate * 100).toFixed(2) }}%</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="result-item">
                <div class="result-label">临床妊娠期望</div>
                <div class="result-value">
                  {{ predictionResult.clinical_pregnancy_expectancy === 1 ? '阳性' : '阴性' }}
                </div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="result-item">
                <div class="result-label">妊娠期望置信度</div>
                <div class="result-value">
                  {{ (predictionResult.clinical_pregnancy_expectancy_confidence * 100).toFixed(2) }}%
                </div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import {ref, reactive, watch} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import request from '../../utils/request'

export default {
  name: 'NewDataPrediction',
  setup() {
    const formRef = ref()
    const predicting = ref(false)
    const saveData = ref(false)
    const predictionResult = ref(null)

    // 表单数据
    const formData = reactive({
      medical_record_number: '',
      ovulation_cycle_number: '',
      date: '',
      female_age: null,
      female_bmi: null,
      male_age: null,
      bFSH: null,
      bLH: null,
      bE2: null,
      AMH: null,
      left_ovary_follicles: null,
      right_ovary_follicles: null,
      antral_follicle_count: null,
      infertility_years: null,
      infertility_cause: '',
      infertility_type: '',
      infertility_object: '',
      indication: '',
      stimulation_scheme: '',
      stimulation_dose: null,
      phase: 1,
      // 阶段2特有字段
      Day3FSH: null,
      Day3LH: null,
      Day3E2: null,
      Day3AMH: null,
      HCG_day_LH: null,
      HCG_day_E2: null,
      HCG_day_Po: null,
      HCG_day_endometrial_thickness: null,
      HCG_day_endometrial_type: '',
      HCG_day_follicle_count: null,
      trigger_medication: '',
      trigger_dose: null
    })

    // 动态表单验证规则
    const getFormRules = () => {
      const baseRules = {
        phase: [
          {required: true, message: '请选择预测阶段', trigger: 'change'}
        ]
      }

      // 只有在保存数据时才验证基础信息字段
      if (saveData.value) {
        baseRules.medical_record_number = [
          {required: true, message: '请输入病历编号', trigger: 'blur'}
        ]
        baseRules.ovulation_cycle_number = [
          {required: true, message: '请输入取卵周期序号', trigger: 'blur'}
        ]
        baseRules.date = [
          {required: true, message: '请选择取卵日期', trigger: 'blur'}
        ]
      }

      return baseRules
    }

    const formRules = ref(getFormRules())

    // 监听保存数据状态变化，更新验证规则
    watch(saveData, (newValue) => {
      formRules.value = getFormRules()
      // 当取消保存数据时，清空基础信息字段
      if (!newValue) {
        formData.medical_record_number = ''
        formData.ovulation_cycle_number = ''
        formData.date = ''
      }
    })

    // 监听预测阶段变化
    watch(() => formData.phase, (newPhase, oldPhase) => {
      // 当从阶段2切换到阶段1时，清空阶段2特有字段
      if (oldPhase === 2 && newPhase === 1) {
        formData.Day3FSH = null
        formData.Day3LH = null
        formData.Day3E2 = null
        formData.Day3AMH = null
        formData.HCG_day_LH = null
        formData.HCG_day_E2 = null
        formData.HCG_day_Po = null
        formData.HCG_day_endometrial_thickness = null
        formData.HCG_day_endometrial_type = ''
        formData.HCG_day_follicle_count = null
        formData.ovulation_induction_drug = ''
        formData.ovulation_induction_dose = null
      }
      // 清空之前的预测结果
      predictionResult.value = null
    })

    // 重置表单
    const resetForm = () => {
      // 重置表单验证状态
      formRef.value?.resetFields()

      // 手动重置所有表单数据到初始值
      Object.assign(formData, {
        medical_record_number: '',
        ovulation_cycle_number: '',
        date: '',
        female_age: null,
        female_bmi: null,
        male_age: null,
        bFSH: null,
        bLH: null,
        bE2: null,
        AMH: null,
        left_ovary_follicles: null,
        right_ovary_follicles: null,
        antral_follicle_count: null,
        infertility_years: null,
        infertility_cause: '',
        infertility_type: '',
        infertility_object: '',
        indication: '',
        stimulation_scheme: '',
        stimulation_dose: null,
        phase: 1,
        // 阶段2特有字段
        Day3FSH: null,
        Day3LH: null,
        Day3E2: null,
        Day3AMH: null,
        HCG_day_LH: null,
        HCG_day_E2: null,
        HCG_day_Po: null,
        HCG_day_endometrial_thickness: null,
        HCG_day_endometrial_type: '',
        HCG_day_follicle_count: null,
        trigger_medication: '',
        trigger_dose: null
      })

      // 重置保存数据开关
      saveData.value = false

      // 清空预测结果
      predictionResult.value = null
    }

    // 处理预测
    const handlePredict = async () => {
      try {
        // 更新验证规则并进行表单验证
        formRules.value = getFormRules()
        await formRef.value?.validate()

        predicting.value = true
        predictionResult.value = null

        // 构建请求数据
        const requestData = {
          patient_data: formData,
          phase: formData.phase,
          save_data: saveData.value
        }

        // 调用新的预测接口
        const response = await request.post('/predict/new-data', requestData)

        if (response.data.flag) {
          predictionResult.value = response.data.data
          ElMessage.success('预测完成！')

          if (saveData.value) {
            ElMessage.success('数据已保存到数据库')
          }
        } else {
          ElMessage.error(response.data.message || '预测失败')
        }
      } catch (error) {
        console.error('预测错误:', error)
        if (error.message) {
          ElMessage.error('表单验证失败，请检查输入')
        } else {
          ElMessage.error('预测失败，请稍后重试')
        }
      } finally {
        predicting.value = false
      }
    }

    return {
      formRef,
      formData,
      formRules,
      predicting,
      saveData,
      predictionResult,
      resetForm,
      handlePredict
    }
  }
}
</script>

<style scoped>
.new-prediction-container {
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
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-card, .result-card {
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

.header-placeholder {
  height: 32px;
  min-width: 1px;
}

.result-card h3 {
  margin: 0;
  color: #1e3a8a;
  font-size: 16px;
  font-weight: 600;
}

.prediction-form {
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e6e9f0;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}


.form-actions {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e6e9f0;
}

.form-actions .el-button {
  margin: 0 12px;
  padding: 12px 32px;
  font-size: 14px;
}

.result-content {
  padding: 24px;
}

.result-item {
  text-align: center;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e6e9f0;
}

.result-label {
  color: #64748b;
  font-size: 14px;
  margin-bottom: 8px;
}

.result-value {
  color: #1e3a8a;
  font-size: 24px;
  font-weight: 600;
}

/* 表单样式优化 */
:deep(.el-form-item__label) {
  color: #374151;
  font-weight: 500;
}

:deep(.el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 6px;
}

:deep(.el-date-editor.el-input) {
  border-radius: 6px;
}

:deep(.el-input-number .el-input__wrapper) {
  border-radius: 6px;
}
</style>