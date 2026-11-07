<template>
  <el-dialog
      title="病人详情分析"
      :model-value="visible"
      width="85%"
      @close="handleClose"
      class="medical-dialog"
  >
    <div class="patient-detail">
      <!-- 顶部病人基本信息 -->
      <div class="patient-basic-info">
        <div class="section-title">基础信息</div>

        <div class="info-item">
          <span class="label">病历编号：</span>
          <span class="value">{{ phaseData?.medical_record_number || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">取卵周期序号：</span>
          <span class="value">{{ phaseData?.ovulation_cycle_number || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">年龄：</span>
          <span class="value">{{ phaseData?.female_age || '-' }}岁</span>
        </div>
        <div class="info-item">
          <span class="label">男方年龄：</span>
          <span class="value">{{ phaseData?.male_age || '-' }}岁</span>
        </div>
        <div class="info-item">
          <span class="label">女方BMI：</span>
          <span class="value">{{ phaseData?.female_bmi || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">治疗周期：</span>
          <span class="value">{{ phaseData?.treatment_cycle || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">不孕年限：</span>
          <span class="value">{{ phaseData?.infertility_years || '-' }}年</span>
        </div>
        <div class="info-item">
          <span class="label">不孕类型：</span>
          <span class="value">{{ phaseData?.infertility_type || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">不孕对象：</span>
          <span class="value">{{ phaseData?.infertility_object || '-' }}</span>
        </div>
        <div class="info-item">
          <span class="label">不孕原因：</span>
          <span class="value">{{ phaseData?.infertility_cause || '-' }}</span>
        </div>
      </div>

      <div class="phase-selector">
        <div class="section-title">治疗阶段</div>
        <el-radio-group v-model="currentPhase" @change="handlePhaseChange" size="large">
          <el-radio-button label="1">
            <el-icon>
              <UserFilled/>
            </el-icon>
            基本信息
          </el-radio-button>
          <el-radio-button label="2">
            <el-icon>
              <Timer/>
            </el-icon>
            促排卵监测
          </el-radio-button>
          <el-radio-button label="3">
            <el-icon>
              <Cellphone/>
            </el-icon>
            胚胎D3形态学特征
          </el-radio-button>
          <el-radio-button label="4">
            <el-icon>
              <Monitor/>
            </el-icon>
            囊胚特征
          </el-radio-button>
          <el-radio-button label="5">
            <el-icon>
              <DataLine/>
            </el-icon>
            胚胎D3形态学特征带时序数据
          </el-radio-button>
          <el-radio-button label="6">
            <el-icon>
              <TrendCharts/>
            </el-icon>
            囊胚特征带时序数据
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 胚胎选择器 -->
      <div v-if="currentPhase >= 3 && embryoList.length > 0" class="embryo-selector">
        <div class="section-title">胚胎选择
          <el-switch
              v-model="removePhase1And2"
              @change="removePhase1And2Func"
              active-text="去除基本信息、促排卵监测特征"
          />
        </div>
        <el-collapse v-model="currentEmbryo" @change="handleEmbryoChange" accordion>
          <el-collapse-item v-for="(embryo, index) in embryoList"
                            :key="index"
                            :name="index">
            <template #title="{ isActive }">
              <div :class="['title-wrapper', { 'is-active': isActive }]">
                <div v-if="currentPhase==='3'||currentPhase==='5'" style="display: flex;gap: 10px;align-items: center;">
                  <span>
                    胚胎&nbsp;{{index + 1}}
                  </span>
                  <div v-if="predictionDataPhaseGreaterEq3[currentPhase+''].remove.length===embryoList.length&&removePhase1And2" style="display: flex;gap: 10px;align-items: center;">
                    <div class="prediction-item-collapse">
                      <span class="label">囊胚形成期望：</span>
                      <span class="value">{{ (predictionDataPhaseGreaterEq3[currentPhase+''].remove[index]?.囊胚形成期望 * 100).toFixed(2) }}%</span>
                    </div>
                    <div class="prediction-item-collapse">
                      <span class="label">优质囊胚期望：</span>
                      <span class="value">{{ (predictionDataPhaseGreaterEq3[currentPhase+''].remove[index]?.优质囊胚期望 * 100).toFixed(2) }}%</span>
                    </div>
                    <div class="prediction-item-collapse">
                      <span class="label">新鲜移植临床妊娠期望：</span>
                      <span class="value">{{ (predictionDataPhaseGreaterEq3[currentPhase+''].remove[index]?.新鲜移植临床妊娠期望 * 100).toFixed(2) }}%</span>
                    </div>
                    <div class="prediction-item-collapse">
                      <span class="label">冷冻移植临床妊娠期望：</span>
                      <span class="value">{{ (predictionDataPhaseGreaterEq3[currentPhase+''].remove[index]?.冷冻移植临床妊娠期望 * 100).toFixed(2) }}%</span>
                    </div>
                  </div>
                  <div v-else-if="predictionDataPhaseGreaterEq3[currentPhase+''].notRemove.length===embryoList.length&&!removePhase1And2" style="display: flex;gap: 10px;align-items: center;">
                    <div class="prediction-item-collapse">
                      <span class="label">囊胚形成期望：</span>
                      <span class="value">{{ (predictionDataPhaseGreaterEq3[currentPhase+''].notRemove[index]?.囊胚形成期望 * 100).toFixed(2) }}%</span>
                    </div>
                    <div class="prediction-item-collapse">
                      <span class="label">优质囊胚期望：</span>
                      <span class="value">{{ (predictionDataPhaseGreaterEq3[currentPhase+''].notRemove[index]?.优质囊胚期望 * 100).toFixed(2) }}%</span>
                    </div>
                    <div class="prediction-item-collapse">
                      <span class="label">新鲜移植临床妊娠期望：</span>
                      <span class="value">{{ (predictionDataPhaseGreaterEq3[currentPhase+''].notRemove[index]?.新鲜移植临床妊娠期望 * 100).toFixed(2) }}%</span>
                    </div>
                    <div class="prediction-item-collapse">
                      <span class="label">冷冻移植临床妊娠期望：</span>
                      <span class="value">{{ (predictionDataPhaseGreaterEq3[currentPhase+''].notRemove[index]?.冷冻移植临床妊娠期望 * 100).toFixed(2) }}%</span>
                    </div>
                  </div>
                  <div v-else class="skeleton-loader">
                    <div class="skeleton-shimmer">
                    </div>
                  </div>
                </div>
                <div v-if="currentPhase==='4'||currentPhase==='6'" style="display: flex;gap: 10px;align-items: center;">
                  <span>
                    胚胎&nbsp;{{index + 1}}
                  </span>
                  <div v-if="predictionDataPhaseGreaterEq3[currentPhase+''].remove.length===embryoList.length&&removePhase1And2" style="display: flex;gap: 10px;align-items: center;">
                    <div class="prediction-item-collapse">
                      <span class="label">妊娠成功率：</span>
                      <span class="value">{{ (predictionDataPhaseGreaterEq3[currentPhase+''].remove[index]?.妊娠成功率 * 100).toFixed(2) }}%</span>
                    </div>
                  </div>
                  <div v-else-if="predictionDataPhaseGreaterEq3[currentPhase+''].notRemove.length===embryoList.length&&!removePhase1And2" style="display: flex;gap: 10px;align-items: center;">
                    <div class="prediction-item-collapse">
                      <span class="label">妊娠成功率：</span>
                      <span class="value">{{ (predictionDataPhaseGreaterEq3[currentPhase+''].notRemove[index]?.妊娠成功率 * 100).toFixed(2) }}%</span>
                    </div>
                  </div>
                  <div v-else class="skeleton-loader">
                    <div class="skeleton-shimmer">
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <el-descriptions :column="4" border>
              <el-descriptions-item
                  v-for="(value, key) in currentPhaseData"
                  :key="key"
                  :label="key"
              >
                {{ formatValue(value) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-collapse-item>
        </el-collapse>
<!--        <el-radio-group v-model="currentEmbryo" @change="handleEmbryoChange" size="large">-->
<!--          <el-radio-button-->
<!--              v-for="(embryo, index) in embryoList"-->
<!--              :key="index"-->
<!--              :label="index"-->
<!--          >-->
<!--            胚胎 {{ index + 1 }}-->
<!--          </el-radio-button>-->
<!--        </el-radio-group>-->
      </div>

      <!-- 阶段数据展示 -->
      <div class="phase-data" v-loading="loading" v-if="currentPhase==='1'||currentPhase==='2'">
        <div style="display: flex;justify-content: left;gap: 20px">
          <div class="section-title">检测指标</div>
        </div>

        <el-descriptions v-if="currentPhase==='1'||currentPhase==='2'" :column="4" border>
          <el-descriptions-item
              v-for="(value, key) in currentPhaseData"
              :key="key"
              :label="key"
          >
            {{ formatValue(value) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 预测结果 -->
      <div class="prediction-section" v-if="currentPhase < 3">
        <el-button v-if="currentPhase === '1'" type="primary" v-loading="aiLoading||loading" v-popover="popoverRef" v-click-outside="onClickOutsidePhase1">
          AI预测
        </el-button>
        <el-button v-else-if="currentPhase === '2'" type="primary" v-loading="aiLoading||loading" v-popover="popover2Ref" v-click-outside="onClickOutsidePhase2">
          AI预测
        </el-button>
        <el-button
            v-else
            v-loading="aiLoading"
            type="primary"
            @click="handlePredict"
            size="large"
            :icon="Histogram"
        >
          生成预测结果
        </el-button>
        <div v-show="showPrediction&&((predictionTableData&&currentPhase==='1')||(predictionTablePhase2Data&&currentPhase==='2'))" class="prediction-result">
          <el-card>
            <template #header>
              <div class="prediction-header">
                <el-icon>
                  <DataAnalysis/>
                </el-icon>
                <span>AI预测结果分析</span>
              </div>
            </template>
            <div class="prediction-content">
              <!-- 阶段一和阶段二的预测结果 -->
              <div v-show="currentPhase==='1'">
                <el-table :data="predictionTableData.results" style="width: 100%" v-if="predictionTableData">
                  <el-table-column label="剂量/促排方案" :min-width="150" fixed >
                    <template #default="scope">
                      <span>{{ predictionTableData.dose[scope.$index] }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column v-for="(row,index) in predictionTableData.schemes" :key="index" :label="row" :min-width="150" align="center">
                    <template #default="scope">
                      <div :class="isMark(predictionTableData.dose[scope.$index],row,scope.row[index].egg_utilization_rate)?'highlight':''">
                        <span>{{ (scope.row[index].egg_utilization_rate * 100).toFixed(2) }}%</span>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <div v-show="currentPhase==='2'">
                <el-table :data="predictionTablePhase2Data.results" style="width: 100%" v-if="predictionTablePhase2Data">
                  <el-table-column label="用药量/扳机用药" :min-width="150" fixed >
                    <template #default="scope">
                      <span>{{ predictionTablePhase2Data.dose[scope.$index] }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column v-for="(row,index) in predictionTablePhase2Data.schemes" :key="index" :label="row" :min-width="150" align="center">
                    <template #default="scope">
                      <div :class="isMarkPhase2(predictionTablePhase2Data.dose[scope.$index],row,scope.row[index].egg_utilization_rate)?'highlight':''">
                        <span>{{ (scope.row[index].egg_utilization_rate * 100).toFixed(2) }}%</span>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 阶段三和阶段五的预测结果 -->
              <template v-if="['3', '5'].includes(currentPhase)&&predictionData">
                <div class="prediction-item">
                  <span class="label">囊胚形成期望：</span>
                  <span class="value">{{ (predictionData.囊胚形成期望 * 100).toFixed(2) }}%</span>
                </div>
                <div class="prediction-item">
                  <span class="label">优质囊胚期望：</span>
                  <span class="value">{{ (predictionData.优质囊胚期望 * 100).toFixed(2) }}%</span>
                </div>
                <div class="prediction-item">
                  <span class="label">新鲜移植临床妊娠期望：</span>
                  <span class="value">{{ (predictionData.新鲜移植临床妊娠期望 * 100).toFixed(2) }}%</span>
                </div>
                <div class="prediction-item">
                  <span class="label">冷冻移植临床妊娠期望：</span>
                  <span class="value">{{ (predictionData.冷冻移植临床妊娠期望 * 100).toFixed(2) }}%</span>
                </div>
              </template>

              <!-- 阶段四和阶段六的预测结果 -->
              <template v-if="['4', '6'].includes(currentPhase)&&predictionData">
                <div class="prediction-item">
                  <span class="label">临床妊娠期望：</span>
                  <span class="value">{{ (predictionData.临床妊娠期望 * 100).toFixed(2) }}%</span>
                </div>
              </template>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 方案选择 -->
<!--      <div class="treatment-options">-->
<!--        <div class="section-title" >治疗方案</div>-->
<!--        <el-form :model="patientForm" label-position="top" class="phase-form">-->
<!--          <el-row :gutter="30">-->
<!--            &lt;!&ndash; 一阶段：促排方案 + 促排用药量 &ndash;&gt;-->
<!--            <template v-if="currentPhase === '1'">-->
<!--              <el-col :span="12">-->
<!--                <el-form-item label="促排方案">-->
<!--                  <el-select v-model="patientForm.促排方案" class="custom-select">-->
<!--                    <el-option v-if="predictionTableData" v-for="item in predictionTableData.topThree" :key="item.scheme" :label="item.scheme" :value="item.scheme" @click="handlePhase1StimulateSelect(item)">-->
<!--                      <span :style="item.is_mark===true?{color:'#409EFF'}:{}">-->
<!--                        {{ item.scheme }}-->
<!--                      </span>-->
<!--                      <span style="-->
<!--                            float: right;-->
<!--                            color: var(&#45;&#45;el-text-color-secondary);-->
<!--                            font-size: 13px;">-->
<!--                        {{ item.dose }}-->
<!--                        </span>-->
<!--                    </el-option>-->
<!--                    <el-option v-else disabled label="请先进行基本信息AI预测" value=""/>-->
<!--                  </el-select>-->
<!--                </el-form-item>-->
<!--              </el-col>-->
<!--              <el-col :span="12">-->
<!--                <el-form-item label="促排用药量(Gn起始剂量)">-->
<!--                  <el-input-number v-model="patientForm.促排用药量" :min="0" :precision="2" class="custom-select"/>-->
<!--                </el-form-item>-->
<!--              </el-col>-->
<!--            </template>-->

<!--            &lt;!&ndash; 二阶段：扳机用药 + 扳机用药量 &ndash;&gt;-->
<!--            <template v-else-if="currentPhase === '2'">-->
<!--              <el-col :span="12">-->
<!--                <el-form-item label="扳机用药(扳机1用药)">-->
<!--                  <el-select v-model="patientForm.扳机用药" class="custom-select">-->
<!--                    <el-option v-if="predictionTablePhase2Data" v-for="item in predictionTablePhase2Data.topThree" :key="item.scheme" :label="item.scheme" :value="item.scheme" @click="handlePhase2StimulateSelect(item)">-->
<!--                      <span :style="item.is_mark===true?{color:'#409EFF'}:{}">-->
<!--                        {{ item.scheme }}-->
<!--                      </span>-->
<!--                      <span style="-->
<!--                            float: right;-->
<!--                            color: var(&#45;&#45;el-text-color-secondary);-->
<!--                            font-size: 13px;">-->
<!--                        {{ item.dose }}-->
<!--                        </span>-->
<!--                    </el-option>-->
<!--                    <el-option v-else disabled label="请先进行促排卵监测AI预测" value=""/>-->
<!--                  </el-select>-->
<!--                </el-form-item>-->
<!--              </el-col>-->
<!--              <el-col :span="12">-->
<!--                <el-form-item label="扳机用药量(扳机1用量)">-->
<!--                  <el-input-number v-model="patientForm.扳机用药量" :min="0" :precision="2" class="custom-select"/>-->
<!--                </el-form-item>-->
<!--              </el-col>-->
<!--            </template>-->

<!--            &lt;!&ndash; 其他阶段：授精方式 &ndash;&gt;-->
<!--            <template v-else>-->
<!--              <el-col :span="12">-->
<!--                <el-form-item label="授精方式">-->
<!--                  <el-select v-model="patientForm.授精方式" class="custom-select">-->
<!--                    <el-option label="IVF" value="IVF"/>-->
<!--                    <el-option label="ICSI" value="ICSI"/>-->
<!--                    <el-option label="ICSII" value="ICSII"/>-->
<!--                    <el-option label="解融" value="解融"/>-->
<!--                  </el-select>-->
<!--                </el-form-item>-->
<!--              </el-col>-->
<!--            </template>-->
<!--          </el-row>-->
<!--        </el-form>-->
<!--      </div>-->
    </div>
  </el-dialog>
  <el-popover
      ref="popoverRef"
      trigger="click"
      virtual-triggering
      placement="top"
      width="550"
  >
    <template #default>
      <RangeSelector
          ref="rangeSelector"
          :max-interval="150"
          :default-step="phase1step"
          :title="'促排用药量(Gn起始剂量)'"
          @change="handleRangeChangePhase1"
      />
      <div style="display: flex;justify-content: space-around;">
        <el-button
            v-loading="aiLoading"
            type="primary"
            @click="handlePredict"
            size="large"
            :icon="Histogram"
        >
          生成预测结果
        </el-button>
      </div>
    </template>
  </el-popover>
  <el-popover
      ref="popover2Ref"
      trigger="click"
      virtual-triggering
      placement="top"
      width="550"
  >
    <template #default>
      <div style="padding: 0 20px;">
        <div class="section-title" style="margin-bottom: 20px; font-size: 16px;">扳机药物类型选择</div>
        <el-radio-group v-model="phase2MedicationType" @change="handleMedTypeChange">
          <el-radio-button label="HCG">HCG系列/保福赐</el-radio-button>
          <el-radio-button label="Aize">艾泽</el-radio-button>
          <el-radio-button label="Trip">曲普瑞林/达必佳</el-radio-button>
        </el-radio-group>
      </div>

      <RangeSelector
          ref="range2Selector"
          :default-min="0"
          :default-step="phase2step"
          :max-interval="phase2MaxInterval"
          :title="'扳机用药量(扳机1用量)'"
          @change="handleRangeChangePhase2"
          @config-change="handleConfigChangePhase2"
      />
      <div style="display: flex;justify-content: space-around;">
        <el-button
            v-loading="aiLoading"
            type="primary"
            @click="handlePredict"
            size="large"
            :icon="Histogram"
            :disabled="!phase2MedicationType"
        >
          生成预测结果
        </el-button>
      </div>
    </template>
  </el-popover>
</template>

<script setup>
import {ref, reactive, watch, computed} from 'vue'
import request from '../utils/request'
import {
  UserFilled,
  Timer,
  Cellphone,
  Monitor,
  DataLine,
  TrendCharts,
  Histogram,
  DataAnalysis
} from '@element-plus/icons-vue'
import {ElMessage} from 'element-plus'
import RangeSelector from "@/components/RangeSelector.vue";

// 定义 props
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  patient: {
    type: Object,
    required: true
  }
})

// 定义 emit
const emit = defineEmits(['close'])
const popoverRef = ref()
const popover2Ref = ref()
const currentPhase = ref('1')
const currentEmbryo = ref()
const showPrediction = ref(false)
const predictionData = ref(null)
const predictionDataPhaseGreaterEq3=ref({
  '3':{
    'remove':[],
    'notRemove':[]
  },
  '4':{
    'remove':[],
    'notRemove':[]
  },
  '5':{
    'remove':[],
    'notRemove':[]
  },
  '6':{
    'remove':[],
    'notRemove':[]
  }
})
const predictionTableData= ref()
const predictionTablePhase2Data= ref()
const embryoList = ref([])
const phaseData = ref({
  stimulation_dose:30,
  trigger_dose:30
})
const removePhase1And2=ref(false)
const phase1And2Fields=ref(new Set())
const loading = ref(false)
const aiLoading = ref(false)
const phase1StartValue = ref(0)
const phase1EndValue = ref(0)
const phase1step=ref(25) // 修改默认步长为 25
const phase2StartValue = ref(0)
const phase2EndValue = ref(0)
const phase2step=ref(1000)
const phase2MaxInterval = ref(8000)
const phase2MedicationType = ref('')
const rangeSelector=ref()
const range2Selector=ref()
const patientForm = reactive({
  促排方案: '',
  促排用药量: null,
  扳机用药: '',
  扳机用药量: null,
  授精方式: ''
})

// 添加列名映射
const columnMapping = {
  "病历编号": "medical_record_number",
  "取卵周期序号": "ovulation_cycle_number",
  "统计日期": "date",
  "年龄": "female_age",
  "女方BMI": "female_bmi",
  "男方年龄": "male_age",
  "bFSH": "bFSH",
  "bLH": "bLH",
  "bPRL": "bPRL",
  "bE2": "bE2",
  "bPo": "bPo",
  "bT": "bT",
  "AMH": "AMH",
  "Day3FSH": "Day3FSH",
  "Day3LH": "Day3LH",
  "Day3E2": "Day3E2",
  "Day3AMH": "D3AMH",
  "HCG日LH": "HCG_day_LH",
  "HCG日E2": "HCG_day_E2",
  "HCG日Po": "HCG_day_Po",
  "HCG日内膜厚度": "HCG_day_endometrial_thickness",
  "HCG日内膜类型": "HCG_day_endometrial_type",
  "HCG日卵泡数": "HCG_day_follicle_count",
  "扳机用药(扳机1用药)": "trigger_medication",
  "扳机用药量(扳机1用量)": "trigger_dose",
  "左卵巢窦状卵泡": "left_ovary_follicles",
  "右卵巢窦状卵泡": "right_ovary_follicles",
  "窦卵泡数": "antral_follicle_count",
  "治疗周期": "treatment_cycle",
  "不孕年限": "infertility_years",
  "不孕原因": "infertility_cause",
  "CDC_ART病因": "cdc_art_cause",
  "不孕类型": "infertility_type",
  "不孕对象": "infertility_object",
  "适应症": "indication",
  "sPN状态": "spn_status",
  "sPN分级": "spn_grade",
  "sD1形态": "sd1_morphology",
  "sD1胞质": "sd1_cytoplasm",
  "sD2卵裂球": "sd2_num",
  "sD2胞核": "sd2_nucleus",
  "sD2大小": "sd2_size",
  "sD2形态": "sd2_morphology",
  "sD2胞质": "sd2_cytoplasm",
  "sD2碎片": "sd2_fragments",
  "sD3卵裂球数目": "sd3_num",
  "GR": "gr",
  "sD3胞核": "sd3_nucleus",
  "sD3大小": "sd3_size",
  "sD3形态": "sd3_morphology",
  "sD3胞质": "sd3_cytoplasm",
  "sD3致密": "sd3_dense",
  "sD3ZP": "sd3_zp",
  "sD3空泡": "sd3_vacuole",
  "sD3碎片": "sd3_fragments",
  "fD5囊胚分级": "fd5_grade",
  "fD6囊胚分级": "fd6_grade",
  "fD7囊胚分级": "fd7_grade",
  "促排方案": "stimulation_scheme",
  "促排用药量(Gn起始剂量)": "stimulation_dose",
  "授精方式": "fertilization_method",
  "第二极体出现时间": "second_polar_body_time",
  "第二极体结束时间": "second_polar_end_time",
  "原核出现时间": "pronucleus_appearance",
  "原核消失时间": "pronucleus_disappearance",
  "初次卵裂的时间": "first_cleavage_time",
  "t3": "t3",
  "t4": "t4",
  "t5": "t5",
  "t6": "t6",
  "t7": "t7",
  "t8": "t8",
  "t9": "t9",
  "tB": "tB",
  "tDead": "tDead",
  "tEB": "tEB",
  "tHB": "tHB",
  "tM": "tM",
  "tSB": "tSB",
  "tSC": "tSC",
  "PPB": "PPB",
  "L1": "L1",
  "L2": "L2",
  "L3": "L3",
  "CC2": "CC2",
  "s2": "s2",
  "CC3": "CC3"
}

// 扳机用药类型变化处理
const handleMedTypeChange = (type) => {
  let config = { min: 0, max: 10000, step: 1000, startValue: 0, endValue: 10000 };

  if (type === 'HCG') {
    config = { min: 2000, max: 10000, step: 1000, startValue: 2000, endValue: 10000 };
    phase2MaxInterval.value = 8000;
  } else if (type === 'Aize') {
    config = { min: 250, max: 750, step: 250, startValue: 250, endValue: 750 };
    phase2MaxInterval.value = 500;
  } else if (type === 'Trip') {
    config = { min: 0.1, max: 0.3, step: 0.1, startValue: 0.1, endValue: 0.3 };
    phase2MaxInterval.value = 0.2;
  }

  phase2step.value = config.step;
  phase2StartValue.value = config.startValue;
  phase2EndValue.value = config.endValue;

  if (range2Selector.value) {
    range2Selector.value.updateConfig(config);
  }
}

const handlePhase1StimulateSelect=(stimulate)=>{
  patientForm.促排用药量=stimulate.dose
}
const handlePhase2StimulateSelect=(stimulate)=>{
  patientForm.扳机用药量=stimulate.dose
}
// 去除阶段12的特征
const removePhase1And2Func=(isRemove)=>{
  if(isRemove){
    phase1And2Fields.value.forEach(item=>{
      if (item!=='id'){
        delete phaseData.value[item]
      }
    })
  }else {
    phaseData.value={...embryoList.value[currentEmbryo.value]}
  }
}
const handleConfigChangePhase1=(config)=>{
  phase1step.value=config.step
}
const handleRangeChangePhase1=(value)=>{
  phase1StartValue.value=value[0]
  phase1EndValue.value=value[1]
}
const handleConfigChangePhase2=(config)=>{
  phase2step.value=config.step
}
const handleRangeChangePhase2=(value)=>{
  phase2StartValue.value=value[0]
  phase2EndValue.value=value[1]
}
const onClickOutsidePhase1 = () => {
  popoverRef.value?.hide()
}
const onClickOutsidePhase2 = () => {
  popover2Ref.value?.hide()
}
// 是否被标记为前三
const isMark=(dose,scheme,value)=>{
  for(let item of predictionTableData.value.topThree){
    if (dose===item.dose&&
        scheme===item.scheme&&
        value===item.value&&
        item.is_mark===true){
      return true
    }
  }
  return false
}
// 是否被标记为前三
const isMarkPhase2=(dose,scheme,value)=>{
  for(let item of predictionTablePhase2Data.value.topThree){
    if (dose===item.dose&&
        scheme===item.scheme&&
        value===item.value&&
        item.is_mark===true){
      return true
    }
  }
  return false
}
// 获取病人详细数据
const fetchPatientDetail = async (medicalRecordNumber, phase, targetPatientId = null) => {
  loading.value = true
  try {
    const params = {phase: phase}

    // 当阶段大于2时，如果有取卵周期序号，则传递该参数
    if (phase > 2 && props.patient?.ovulation_cycle_number) {
      params.ovulation_cycle_number = props.patient.ovulation_cycle_number
    }

    const response = await request.get(`/patients/${medicalRecordNumber}`, {
      params: params
    })

    if (response.data.flag) {
      if (phase >= 3) {
        // 阶段三及以上可能返回多条数据（多个胚胎）
        embryoList.value = response.data.data || []
        phaseData.value = {...embryoList.value[currentEmbryo.value]} || null
        if (removePhase1And2.value){
          removePhase1And2Func(true)
        }
      } else {
        // 阶段一和二：根据targetPatientId找到对应的数据
        const allData = response.data.data || []
        if (targetPatientId) {
          // 根据id找到对应的数据
          phaseData.value = allData.find(item => item.id === targetPatientId) || allData[0] || null
        } else {
          // 如果没有指定id，取第一条数据
          phaseData.value = allData[0] || null
        }
        if (phase===1){
          const originalDose = phaseData.value.stimulation_dose || 0;
          // const centerDose = Math.round(originalDose / 25) * 25;
          const centerDose = originalDose
          phase1StartValue.value = Math.max(0, centerDose - 75);
          phase1EndValue.value = centerDose + 75;
          phase1step.value = 25;

          // 调用子组件更新方法
          if (rangeSelector.value) {
            rangeSelector.value.updateConfig({
              min: 0,
              max: 1000,
              step: 25,
              startValue: phase1StartValue.value,
              endValue: phase1EndValue.value
            });
          }
        }
        if (phase===2){
          // 初始化扳机类型
          const triggerMed = phaseData.value.trigger_medication || '';
          if (triggerMed.includes('HCG') || triggerMed.includes('保福赐')) {
            phase2MedicationType.value = 'HCG';
          } else if (triggerMed.includes('艾泽')) {
            phase2MedicationType.value = 'Aize';
          } else if (triggerMed.includes('曲普瑞林') || triggerMed.includes('达必佳')) {
            phase2MedicationType.value = 'Trip';
          } else {
            phase2MedicationType.value = 'HCG'; // 默认
          }
          handleMedTypeChange(phase2MedicationType.value);
        }
        Object.keys(phaseData.value).forEach(item=>{
          phase1And2Fields.value.add(item)
        })
        embryoList.value = []
      }
    } else {
      ElMessage.error(response.data.message || '获取数据失败')
    }
  } catch (error) {
    console.error('获取病人详情错误:', error)
    ElMessage.error('获取数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 监听 phaseData 变化，更新表单数据
watch(() => phaseData.value, (newPhaseData) => {
  if (newPhaseData) {
    // patientForm.促排方案 = newPhaseData.stimulation_scheme || ''
    // patientForm.促排用药量 = newPhaseData.stimulation_dose || null
    // patientForm.扳机用药 = newPhaseData.trigger_medication || ''
    // patientForm.扳机用药量 = newPhaseData.trigger_dose || null
    patientForm.授精方式 = newPhaseData.fertilization_method || ''
  }
}, {immediate: true})

// 处理阶段变化
const handlePhaseChange = (phase) => {
  // currentEmbryo.value = 0
  showPrediction.value = false
  predictionData.value = null
  if (phase==='1'||phase==='2'){
    showPrediction.value = true
  }
  if (props.patient?.medical_record_number) {
    fetchPatientDetail(props.patient.medical_record_number, phase, props.patient.id)
  }
}

// 处理胚胎选择变化
const handleEmbryoChange = (index) => {
  if (index!=null&&index!==''){
    showPrediction.value = false
    phaseData.value = {...embryoList.value[index]} || null
    if (removePhase1And2.value){
      removePhase1And2Func(true)
    }
  }
}

// 监听病人变化
watch(() => props.patient, (newPatient) => {
  if (newPatient?.medical_record_number) {
    currentPhase.value = '1'
    // currentEmbryo.value = 0
    showPrediction.value = false
    predictionData.value = null
    fetchPatientDetail(newPatient.medical_record_number, 1, newPatient.id)
    fetchPatientDetail(newPatient.medical_record_number, 2, newPatient.id)
  }
}, {immediate: true})

// 处理预测
const handlePredict = async () => {
  if (phaseData.value?.id === null || phaseData.value?.id === undefined || phaseData.value?.id === "") {
    ElMessage.error('无效的病人数据')
    return
  }

  if (currentPhase.value === '1') onClickOutsidePhase1()
  if (currentPhase.value === '2') onClickOutsidePhase2()

  aiLoading.value=true
  try {
    // 构建请求体
    const requestBody = {
      id: phaseData.value.id,
      phase: parseInt(currentPhase.value)
    }

    // 根据不同阶段添加相应字段到请求体
    if (currentPhase.value === '1') {
      if (patientForm.促排方案) {
        requestBody.stimulation_scheme = patientForm.促排方案
      }
      if (patientForm.促排用药量) {
        requestBody.stimulation_dose = patientForm.促排用药量
      }
      requestBody.startValue=phase1StartValue.value
      requestBody.endValue=phase1EndValue.value
      requestBody.step=phase1step.value
    } else if (currentPhase.value === '2') {
      if (patientForm.促排方案) {
        requestBody.stimulation_scheme = patientForm.促排方案
      }
      if (patientForm.促排用药量) {
        requestBody.stimulation_dose = patientForm.促排用药量
      }
      if (patientForm.扳机用药) {
        requestBody.trigger_medication = patientForm.扳机用药
      }
      if (patientForm.扳机用药量) {
        requestBody.trigger_dose = patientForm.扳机用药量
      }
      requestBody.startValue=phase2StartValue.value
      requestBody.endValue=phase2EndValue.value
      requestBody.step=phase2step.value
      // 传递药物类型相关信息，由后端进一步映射具体药物名
      requestBody.trigger_medication_type = phase2MedicationType.value
    }

    const response = await request.post('/predict/', requestBody)

    if (response.data.flag) {
      showPrediction.value = true
      // 根据不同阶段处理预测结果
      switch (parseInt(currentPhase.value)) {
        case 1:
          predictionTableData.value=null
          predictionTableData.value = {
            schemes: response.data.data.schemes,
            dose: response.data.data.dose,
            results: response.data.data.results,
            topThree: response.data.data.top_three
          }
          break
        case 2:
          predictionTablePhase2Data.value=null
          predictionTablePhase2Data.value = {
            schemes: response.data.data.schemes,
            dose: response.data.data.dose,
            results: response.data.data.results,
            topThree: response.data.data.top_three
          }
          break
        case 3:
        case 5:
          predictionData.value = {
            囊胚形成期望: response.data.data.blastocyst_formation_rate,
            优质囊胚期望: response.data.data.quality_blastocyst_rate,
            新鲜移植临床妊娠期望: response.data.data.clinical_pregnancy_expectancy,
            冷冻移植临床妊娠期望: response.data.data.frozen_clinical_pregnancy_expectancy
          }
          break
        case 4:
        case 6:
          predictionData.value = {
            临床妊娠期望: response.data.data.clinical_pregnancy_expectancy
          }
          break
      }
    } else {
      ElMessage.error(response.data.message || '预测失败')
    }
  } catch (error) {
    console.error('预测错误:', error)
    ElMessage.error('预测失败，请稍后重试')
  } finally {
    aiLoading.value=false
  }
}

watch(embryoList,(val)=>{
  if (val&&val.length>0){
    if (predictionDataPhaseGreaterEq3.value[currentPhase.value+''].remove.length===0){
      val.forEach((item,index)=>{
        handlePhaseGreaterEq3Predict(index,true)
      })
    }
    if (predictionDataPhaseGreaterEq3.value[currentPhase.value+''].notRemove.length===0){
      val.forEach((item,index)=>{
        handlePhaseGreaterEq3Predict(index,false)
      })
    }
  }
})
const handlePhaseGreaterEq3Predict=async (index,remove1and2)=>{
  try {
    // 构建请求体
    let data= {...embryoList.value[index]}
    const requestBody = {
      id: data.id,
      phase: parseInt(currentPhase.value)
    }
    requestBody.properties=data
    requestBody.properties._remove_phase12_features = !!remove1and2
    if (remove1and2){
      phase1And2Fields.value.forEach(item=>{
        if (item!=='id'){
          delete data[item]
        }
      })
      delete requestBody.properties.stimulation_scheme
      delete requestBody.properties.stimulation_dose
      delete requestBody.properties.trigger_medication
      delete requestBody.properties.trigger_dose
    }else {
      if (patientForm.促排方案) {
        requestBody.properties.stimulation_scheme = patientForm.促排方案
      }
      if (patientForm.促排用药量) {
        requestBody.properties.stimulation_dose = patientForm.促排用药量
      }
      if (patientForm.扳机用药) {
        requestBody.properties.trigger_medication = patientForm.扳机用药
      }
      if (patientForm.扳机用药量) {
        requestBody.properties.trigger_dose = patientForm.扳机用药量
      }
    }
    if (patientForm.授精方式) {
      requestBody.fertilization_method = patientForm.授精方式
    }
    const response = await request.post('/predict/', requestBody)
    if (!response.data?.flag) {
      throw new Error(response.data?.message || '预测失败')
    }
    if (currentPhase.value==='3'||currentPhase.value==='5'){
      if (remove1and2){
        predictionDataPhaseGreaterEq3.value[currentPhase.value+''].remove[index] = {
          囊胚形成期望: response.data.data.blastocyst_formation_rate,
          优质囊胚期望: response.data.data.quality_blastocyst_rate,
          新鲜移植临床妊娠期望: response.data.data.clinical_pregnancy_expectancy,
          冷冻移植临床妊娠期望: response.data.data.frozen_clinical_pregnancy_expectancy
        }
      }else {
        predictionDataPhaseGreaterEq3.value[currentPhase.value+''].notRemove[index] = {
          囊胚形成期望: response.data.data.blastocyst_formation_rate,
          优质囊胚期望: response.data.data.quality_blastocyst_rate,
          新鲜移植临床妊娠期望: response.data.data.clinical_pregnancy_expectancy,
          冷冻移植临床妊娠期望: response.data.data.frozen_clinical_pregnancy_expectancy
        }
      }
    }
    if (currentPhase.value==='4'||currentPhase.value==='6'){
      if (remove1and2){
        predictionDataPhaseGreaterEq3.value[currentPhase.value+''].remove[index] = {
          妊娠成功率: response.data.data.pregnancy_success_rate,
        }
      }else {
        predictionDataPhaseGreaterEq3.value[currentPhase.value+''].notRemove[index] = {
          妊娠成功率: response.data.data.pregnancy_success_rate,
        }
      }
    }
  } catch (error) {
    console.error('阶段3+预测错误:', error)
    const targetList = remove1and2
      ? predictionDataPhaseGreaterEq3.value[currentPhase.value+''].remove
      : predictionDataPhaseGreaterEq3.value[currentPhase.value+''].notRemove
    if (currentPhase.value==='3'||currentPhase.value==='5'){
      targetList[index] = {
        囊胚形成期望: 0,
        优质囊胚期望: 0,
        新鲜移植临床妊娠期望: 0,
        冷冻移植临床妊娠期望: 0
      }
    } else {
      targetList[index] = {
        妊娠成功率: 0
      }
    }
  }

}
const handleClose = () => {
  currentPhase.value = '1'
  // currentEmbryo.value = 0
  showPrediction.value = false
  predictionData.value = null
  predictionTableData.value=null
  predictionTablePhase2Data.value=null
  emit('close')
}

const formatValue = (value) => {
  if (typeof value === 'number' && String(value).length === 5 && value > 30000) {
    return new Date((value - 25569) * 86400 * 1000).toLocaleDateString()
  }
  return value !== null && value !== undefined && value !== '' ? value : '-'
}

// 根据后端返回的数据映射到前端显示字段
const currentPhaseData = computed(() => {
  if (!phaseData.value) return {}

  // 字段映射关系（反向映射）
  const reverseMapping = Object.entries(columnMapping).reduce((acc, [key, value]) => {
    acc[value] = key
    return acc
  }, {})

  // 转换数据
  const result = {}
  for (const [key, value] of Object.entries(phaseData.value)) {
    if (key === 'id') continue
    if (key === 'date') continue
    const mappedKey = reverseMapping[key]
    if (mappedKey) {
      result[mappedKey] = value === null ? '-' : value
    }
  }

  return result
})
</script>

<style scoped>
.medical-dialog :deep(.el-dialog__header) {
  background: #409EFF;
  margin-right: 0;
  padding: 20px;
}

.medical-dialog :deep(.el-dialog__title) {
  color: white;
  font-size: 20px;
  font-weight: 600;
}

.medical-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: white;
}

.patient-detail {
  padding: 20px;
  background-color: #f5f7fa;
}

.patient-basic-info {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.patient-basic-info .section-title {
  grid-column: 1 / -1;
  margin-bottom: 5px;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
  height: fit-content;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-item .label {
  color: #606266;
  font-weight: 500;
}

.info-item .value {
  color: #303133;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.phase-selector {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.treatment-options,
.embryo-selector,
.phase-data {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.prediction-section {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.prediction-result {
  margin-top: 20px;
}

.prediction-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.prediction-item-collapse {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f5f7fa;
  margin: 10px;
  height: 25px;
  padding: 5px;
  border-radius: 20px;
}

.prediction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  margin-bottom: 10px;
}

.prediction-item .label {
  font-weight: 500;
  color: #606266;
}

.prediction-item .value {
  color: #409EFF;
  font-weight: 600;
  font-size: 16px;
}

.prediction-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

:deep(.el-radio-button__inner) {
  display: flex;
  align-items: center;
  gap: 5px;
}

:deep(.el-descriptions) {
  margin: 20px 0;
}

:deep(.el-descriptions__cell) {
  padding: 12px;
}

:deep(.el-descriptions__label) {
  color: #606266;
  font-weight: 500;
}

:deep(.el-descriptions__content) {
  color: #303133;
}

.custom-select {
  width: 100%;
}
.highlight {
  background-color: #409EFF !important;
  color: white;
  font-weight: bold;
}
.skeleton-loader {
  position: relative;
  overflow: hidden;
  display: inline-block;
  background: #e8e8e8;
  border-radius: 4px;
  padding: 8px 16px;
  width: 70%;
  height: 20px;
}

.skeleton-loader::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.6),
      transparent
  );
  animation: shimmer 1.5s infinite;
  transform: translateX(-100%);
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
