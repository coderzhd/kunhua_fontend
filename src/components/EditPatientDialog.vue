<template>
  <el-dialog
    title="修改病人数据"
    v-model="dialogVisible"
    width="80%"
    :before-close="handleClose"
  >
    <div v-loading="loading">
      <!-- 公共字段部分 -->
      <div class="common-fields">
        <el-form
          ref="formRef"
          :model="commonForm"
          label-width="120px"
        >
          <!-- 基本信息部分 -->
          <div class="section-title">基本信息</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="病例编号">
                <el-input v-model="commonForm.medical_record_number" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="取卵周期序号">
                <el-input v-model="commonForm.ovulation_cycle_number" disabled/>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="日期">
                <el-input 
                  v-model="commonForm.date" 
                  placeholder="YYYY/MM/DD"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="女方年龄">
                <el-input-number v-model="commonForm.female_age" :precision="1" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="女方BMI">
                <el-input-number v-model="commonForm.female_bmi" :precision="1" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="男方年龄">
                <el-input-number v-model="commonForm.male_age" :precision="1" :step="0.1" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 检测指标部分 -->
          <div class="section-title">检测指标</div>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="bFSH">
                <el-input-number v-model="commonForm.bFSH" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="bLH">
                <el-input-number v-model="commonForm.bLH" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="bPRL">
                <el-input-number v-model="commonForm.bPRL" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="bE2">
                <el-input-number v-model="commonForm.bE2" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="bPo">
                <el-input-number v-model="commonForm.bPo" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="bT">
                <el-input-number v-model="commonForm.bT" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="AMH">
                <el-input-number v-model="commonForm.AMH" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- Day3指标 -->
          <div class="section-title">Day3指标</div>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="Day3FSH">
                <el-input-number v-model="commonForm.Day3FSH" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="Day3LH">
                <el-input-number v-model="commonForm.Day3LH" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="Day3E2">
                <el-input-number v-model="commonForm.Day3E2" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="Day3AMH">
                <el-input-number v-model="commonForm.Day3AMH" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- HCG日指标 -->
          <div class="section-title">HCG日指标</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="HCG日LH">
                <el-input-number v-model="commonForm.HCG_day_LH" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="HCG日E2">
                <el-input-number v-model="commonForm.HCG_day_E2" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="HCG日Po">
                <el-input-number v-model="commonForm.HCG_day_Po" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="HCG日内膜厚度">
                <el-input-number v-model="commonForm.HCG_day_endometrial_thickness" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="HCG日内膜类型">
                <el-input v-model="commonForm.HCG_day_endometrial_type" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="HCG日卵泡数">
                <el-input-number v-model="commonForm.HCG_day_follicle_count" :precision="0" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 治疗信息 -->
          <div class="section-title">治疗信息</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="促排方案">
                <el-select v-model="commonForm.stimulation_scheme" placeholder="请选择" class="custom-select">
                  <el-option label="LPS" value="LPS" />
                  <el-option label="PPOS" value="PPOS" />
                  <el-option label="超短方案" value="超短方案" />
                  <el-option label="超长方案" value="超长方案" />
                  <el-option label="促排周期" value="促排周期" />
                  <el-option label="低刺激方案" value="低刺激方案" />
                  <el-option label="短方案" value="短方案" />
                  <el-option label="改良超长方案" value="改良超长方案" />
                  <el-option label="改良黄体期长方案" value="改良黄体期长方案" />
                  <el-option label="改良黄长方案" value="改良黄长方案" />
                  <el-option label="改良长方案" value="改良长方案" />
                  <el-option label="黄体期超长方案" value="黄体期超长方案" />
                  <el-option label="黄体期促排方案" value="黄体期促排方案" />
                  <el-option label="黄体期长方案" value="黄体期长方案" />
                  <el-option label="降调-替代周期" value="降调-替代周期" />
                  <el-option label="拮抗剂方案" value="拮抗剂方案" />
                  <el-option label="灵活方案" value="灵活方案" />
                  <el-option label="卵泡期长方案" value="卵泡期长方案" />
                  <el-option label="全CC方案" value="全CC方案" />
                  <el-option label="替代周期" value="替代周期" />
                  <el-option label="自然周期" value="自然周期" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="促排用药量">
                <el-input-number v-model="commonForm.stimulation_dose" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="授精方式">
                <el-select v-model="commonForm.fertilization_method" placeholder="请选择" class="custom-select">
                  <el-option label="IVF" value="IVF" />
                  <el-option label="ICSI" value="ICSI" />
                  <el-option label="ICSII" value="ICSII" />
                  <el-option label="常规IVF" value="常规IVF" />
                  <el-option label="解融" value="解融" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="扳机用药">
                <el-input v-model="commonForm.trigger_medication" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="扳机用药量">
                <el-input-number v-model="commonForm.trigger_dose" :precision="2" :step="0.1" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 卵泡信息 -->
          <div class="section-title">卵泡信息</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="左卵巢窦状卵泡">
                <el-input-number v-model="commonForm.left_ovary_follicles" :precision="0" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="右卵巢窦状卵泡">
                <el-input-number v-model="commonForm.right_ovary_follicles" :precision="0" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="窦卵泡数">
                <el-input-number v-model="commonForm.antral_follicle_count" :precision="0" />
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 不孕信息 -->
          <div class="section-title">不孕信息</div>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="治疗周期">
                <el-input-number v-model="commonForm.treatment_cycle" :precision="0" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="不孕年限">
                <el-input-number v-model="commonForm.infertility_years" :precision="0" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="不孕原因">
                <el-input v-model="commonForm.infertility_cause" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="CDC_ART病因">
                <el-input v-model="commonForm.cdc_art_cause" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="不孕类型">
                <el-input v-model="commonForm.infertility_type" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="不孕对象">
                <el-input v-model="commonForm.infertility_object" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="适应症">
                <el-input v-model="commonForm.indication" />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 胚胎列表 -->
      <div class="embryo-list">
        <div class="section-title">胚胎数据</div>
        <el-radio-group v-model="currentEmbryoIndex">
          <el-radio-button 
            v-for="(embryo, index) in embryoList" 
            :key="embryo.id" 
            :label="index"
          >
            胚胎 {{ index + 1 }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 胚胎详细数据 -->
      <div v-if="currentEmbryo" class="embryo-details">
        <el-form
          :model="currentEmbryo"
          label-width="140px"
        >
          <!-- PN阶段 -->
          <div class="sub-section">
            <div class="sub-title">PN阶段</div>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="sPN状态">
                  <el-input v-model="currentEmbryo.spn_status" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="sPN分级">
                  <el-input v-model="currentEmbryo.spn_grade" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- D1阶段 -->
          <div class="sub-section">
            <div class="sub-title">D1阶段</div>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="sD1形态">
                  <el-input v-model="currentEmbryo.sd1_morphology" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="sD1胞质">
                  <el-input v-model="currentEmbryo.sd1_cytoplasm" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- D2阶段 -->
          <div class="sub-section">
            <div class="sub-title">D2阶段</div>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="sD2卵裂球">
                  <el-input-number v-model="currentEmbryo.sd2_num" :precision="0" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="sD2胞核">
                  <el-input v-model="currentEmbryo.sd2_nucleus" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="sD2大小">
                  <el-input v-model="currentEmbryo.sd2_size" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="sD2形态">
                  <el-input v-model="currentEmbryo.sd2_morphology" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="sD2胞质">
                  <el-input v-model="currentEmbryo.sd2_cytoplasm" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="sD2碎片">
                  <el-input v-model="currentEmbryo.sd2_fragments" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- D3阶段 -->
          <div class="sub-section">
            <div class="sub-title">D3阶段</div>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="sD3卵裂球数目">
                  <el-input-number v-model="currentEmbryo.sd3_num" :precision="0" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="GR">
                  <el-input-number v-model="currentEmbryo.gr" :precision="0" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="sD3胞核">
                  <el-input v-model="currentEmbryo.sd3_nucleus" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="sD3大小">
                  <el-input v-model="currentEmbryo.sd3_size" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="sD3形态">
                  <el-input v-model="currentEmbryo.sd3_morphology" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="sD3胞质">
                  <el-input v-model="currentEmbryo.sd3_cytoplasm" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="sD3致密">
                  <el-input v-model="currentEmbryo.sd3_dense" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="sD3ZP">
                  <el-input v-model="currentEmbryo.sd3_zp" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="sD3空泡">
                  <el-input v-model="currentEmbryo.sd3_vacuole" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="sD3碎片">
                  <el-input v-model="currentEmbryo.sd3_fragments" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 囊胚阶段 -->
          <div class="sub-section">
            <div class="sub-title">囊胚阶段</div>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="fD5囊胚分级">
                  <el-input v-model="currentEmbryo.fd5_grade" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="fD6囊胚分级">
                  <el-input v-model="currentEmbryo.fd6_grade" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="fD7囊胚分级">
                  <el-input v-model="currentEmbryo.fd7_grade" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 时间指标 -->
          <div class="sub-section">
            <div class="sub-title">时间指标</div>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="第二极体出现时间">
                  <el-input-number v-model="currentEmbryo.second_polar_body_time" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="第二极体结束时间">
                  <el-input-number v-model="currentEmbryo.second_polar_end_time" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="原核出现时间">
                  <el-input-number v-model="currentEmbryo.pronucleus_appearance" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="原核消失时间">
                  <el-input-number v-model="currentEmbryo.pronucleus_disappearance" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="初次卵裂时间">
                  <el-input-number v-model="currentEmbryo.first_cleavage_time" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="t3">
                  <el-input-number v-model="currentEmbryo.t3" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="t4">
                  <el-input-number v-model="currentEmbryo.t4" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="t5">
                  <el-input-number v-model="currentEmbryo.t5" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="t6">
                  <el-input-number v-model="currentEmbryo.t6" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="t7">
                  <el-input-number v-model="currentEmbryo.t7" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="t8">
                  <el-input-number v-model="currentEmbryo.t8" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="t9">
                  <el-input-number v-model="currentEmbryo.t9" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="tB">
                  <el-input-number v-model="currentEmbryo.tB" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="tDead">
                  <el-input-number v-model="currentEmbryo.tDead" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="tEB">
                  <el-input-number v-model="currentEmbryo.tEB" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="tHB">
                  <el-input-number v-model="currentEmbryo.tHB" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="tM">
                  <el-input-number v-model="currentEmbryo.tM" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="tSB">
                  <el-input-number v-model="currentEmbryo.tSB" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="tSC">
                  <el-input-number v-model="currentEmbryo.tSC" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="PPB">
                  <el-input-number v-model="currentEmbryo.PPB" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="L1">
                  <el-input-number v-model="currentEmbryo.L1" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="L2">
                  <el-input-number v-model="currentEmbryo.L2" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="L3">
                  <el-input-number v-model="currentEmbryo.L3" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="CC2">
                  <el-input-number v-model="currentEmbryo.CC2" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="6">
                <el-form-item label="s2">
                  <el-input-number v-model="currentEmbryo.s2" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="CC3">
                  <el-input-number v-model="currentEmbryo.CC3" :precision="8" :step="0.00000001" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button 
          type="primary" 
          @click="handleSubmit"
          :loading="submitLoading"
        >
          修改数据
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
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
const submitLoading = ref(false)
const formRef = ref(null)
const commonForm = ref({})
const embryoList = ref([])
const currentEmbryoIndex = ref(0)
const modifiedCommonFields = ref({})
const modifiedEmbryos = ref(new Set())

// 当前选中的胚胎数据
const currentEmbryo = computed(() => 
  embryoList.value[currentEmbryoIndex.value] || null
)

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = { phase: 7 }
    // 添加取卵周期序号参数
    if (props.ovulationCycleNumber) {
      params.ovulation_cycle_number = props.ovulationCycleNumber
    }
    
    const response = await request.get(`/patients/${props.medicalRecordNumber}`, {
      params
    })
    if (response.data.flag) {
      // 设置公共字段
      const firstRecord = response.data.data[0] || {}
      commonForm.value = {
        medical_record_number: firstRecord.medical_record_number ?? '',
        ovulation_cycle_number: firstRecord.ovulation_cycle_number ?? '',
        date: (firstRecord.date ?? '').replace(/ 0:00$/, ''),
        female_age: firstRecord.female_age ?? null,
        female_bmi: firstRecord.female_bmi ?? null,
        male_age: firstRecord.male_age ?? null,
        bFSH: firstRecord.bFSH ?? null,
        bLH: firstRecord.bLH ?? null,
        bPRL: firstRecord.bPRL ?? null,
        bE2: firstRecord.bE2 ?? null,
        bPo: firstRecord.bPo ?? null,
        bT: firstRecord.bT ?? null,
        AMH: firstRecord.AMH ?? null,
        stimulation_dose: firstRecord.stimulation_dose ?? null,
        Day3FSH: firstRecord.Day3FSH ?? null,
        Day3LH: firstRecord.Day3LH ?? null,
        Day3E2: firstRecord.Day3E2 ?? null,
        Day3AMH: firstRecord.Day3AMH ?? null,
        HCG_day_LH: firstRecord.HCG_day_LH ?? null,
        HCG_day_E2: firstRecord.HCG_day_E2 ?? null,
        HCG_day_Po: firstRecord.HCG_day_Po ?? null,
        HCG_day_endometrial_thickness: firstRecord.HCG_day_endometrial_thickness ?? null,
        HCG_day_endometrial_type: firstRecord.HCG_day_endometrial_type ?? '',
        HCG_day_follicle_count: firstRecord.HCG_day_follicle_count ?? null,
        trigger_medication: firstRecord.trigger_medication ?? '',
        trigger_dose: firstRecord.trigger_dose ?? null,
        left_ovary_follicles: firstRecord.left_ovary_follicles ?? null,
        right_ovary_follicles: firstRecord.right_ovary_follicles ?? null,
        antral_follicle_count: firstRecord.antral_follicle_count ?? null,
        treatment_cycle: firstRecord.treatment_cycle ?? null,
        infertility_years: firstRecord.infertility_years ?? null,
        infertility_cause: firstRecord.infertility_cause ?? '',
        cdc_art_cause: firstRecord.cdc_art_cause ?? '',
        infertility_type: firstRecord.infertility_type ?? '',
        infertility_object: firstRecord.infertility_object ?? '',
        indication: firstRecord.indication ?? '',
        stimulation_scheme: firstRecord.stimulation_scheme ?? '',
        fertilization_method: firstRecord.fertilization_method ?? ''
      }
      
      // 设置胚胎数据，确保每个字段都有初始值
      embryoList.value = response.data.data.map(item => ({
        id: item.id,
        spn_status: item.spn_status ?? '',
        spn_grade: item.spn_grade ?? '',
        sd1_morphology: item.sd1_morphology ?? '',
        sd1_cytoplasm: item.sd1_cytoplasm ?? '',
        sd2_num: item.sd2_num ?? null,
        sd2_nucleus: item.sd2_nucleus ?? '',
        sd2_size: item.sd2_size ?? '',
        sd2_morphology: item.sd2_morphology ?? '',
        sd2_cytoplasm: item.sd2_cytoplasm ?? '',
        sd2_fragments: item.sd2_fragments ?? '',
        sd3_num: item.sd3_num ?? null,
        gr: item.gr ?? null,
        sd3_nucleus: item.sd3_nucleus ?? '',
        sd3_size: item.sd3_size ?? '',
        sd3_morphology: item.sd3_morphology ?? '',
        sd3_cytoplasm: item.sd3_cytoplasm ?? '',
        sd3_dense: item.sd3_dense ?? '',
        sd3_zp: item.sd3_zp ?? '',
        sd3_vacuole: item.sd3_vacuole ?? '',
        sd3_fragments: item.sd3_fragments ?? '',
        fd5_grade: item.fd5_grade ?? '',
        fd6_grade: item.fd6_grade ?? '',
        fd7_grade: item.fd7_grade ?? '',
        second_polar_body_time: item.second_polar_body_time ?? null,
        second_polar_end_time: item.second_polar_end_time ?? null,
        pronucleus_appearance: item.pronucleus_appearance ?? null,
        pronucleus_disappearance: item.pronucleus_disappearance ?? null,
        first_cleavage_time: item.first_cleavage_time ?? null,
        t3: item.t3 ?? null,
        t4: item.t4 ?? null,
        t5: item.t5 ?? null,
        t6: item.t6 ?? null,
        t7: item.t7 ?? null,
        t8: item.t8 ?? null,
        t9: item.t9 ?? null,
        tB: item.tB ?? null,
        tDead: item.tDead ?? null,
        tEB: item.tEB ?? null,
        tHB: item.tHB ?? null,
        tM: item.tM ?? null,
        tSB: item.tSB ?? null,
        tSC: item.tSC ?? null,
        PPB: item.PPB ?? null,
        L1: item.L1 ?? null,
        L2: item.L2 ?? null,
        L3: item.L3 ?? null,
        CC2: item.CC2 ?? null,
        s2: item.s2 ?? null,
        CC3: item.CC3 ?? null
      }))

      currentEmbryoIndex.value = 0
    }
  } catch (error) {
    console.error('获取数据错误:', error)
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 处理提交
const handleSubmit = async () => {
  try {
    await ElMessageBox.confirm('确定要修改这些数据吗？', '提示', {
      type: 'warning'
    })

    submitLoading.value = true

    // 修改公共字段 - 发送所有字段，并传递取卵周期序号参数
    const baseInfoData = {
      medical_record_number: commonForm.value.medical_record_number,
      ovulation_cycle_number: commonForm.value.ovulation_cycle_number,
      date: commonForm.value.date ? (commonForm.value.date.includes(' 0:00') ? commonForm.value.date : commonForm.value.date + ' 0:00') : '',
      female_age: commonForm.value.female_age ?? null,
      female_bmi: commonForm.value.female_bmi ?? null,
      male_age: commonForm.value.male_age ?? null,
      bFSH: commonForm.value.bFSH ?? null,
      bLH: commonForm.value.bLH ?? null,
      bPRL: commonForm.value.bPRL ?? null,
      bE2: commonForm.value.bE2 ?? null,
      bPo: commonForm.value.bPo ?? null,
      bT: commonForm.value.bT ?? null,
      AMH: commonForm.value.AMH ?? null,
      stimulation_dose: commonForm.value.stimulation_dose ?? null,
      Day3FSH: commonForm.value.Day3FSH ?? null,
      Day3LH: commonForm.value.Day3LH ?? null,
      Day3E2: commonForm.value.Day3E2 ?? null,
      Day3AMH: commonForm.value.Day3AMH ?? null,
      HCG_day_LH: commonForm.value.HCG_day_LH ?? null,
      HCG_day_E2: commonForm.value.HCG_day_E2 ?? null,
      HCG_day_Po: commonForm.value.HCG_day_Po ?? null,
      HCG_day_endometrial_thickness: commonForm.value.HCG_day_endometrial_thickness ?? null,
      HCG_day_endometrial_type: commonForm.value.HCG_day_endometrial_type ?? '',
      HCG_day_follicle_count: commonForm.value.HCG_day_follicle_count ?? null,
      trigger_medication: commonForm.value.trigger_medication ?? '',
      trigger_dose: commonForm.value.trigger_dose ?? null,
      left_ovary_follicles: commonForm.value.left_ovary_follicles ?? null,
      right_ovary_follicles: commonForm.value.right_ovary_follicles ?? null,
      antral_follicle_count: commonForm.value.antral_follicle_count ?? null,
      treatment_cycle: commonForm.value.treatment_cycle ?? null,
      infertility_years: commonForm.value.infertility_years ?? null,
      infertility_cause: commonForm.value.infertility_cause ?? '',
      cdc_art_cause: commonForm.value.cdc_art_cause ?? '',
      infertility_type: commonForm.value.infertility_type ?? '',
      infertility_object: commonForm.value.infertility_object ?? '',
      indication: commonForm.value.indication ?? '',
      stimulation_scheme: commonForm.value.stimulation_scheme ?? '',
      fertilization_method: commonForm.value.fertilization_method ?? ''
    }
    
    // 如果有取卵周期序号，则作为查询参数传递
    const params = props.ovulationCycleNumber ? { ovulation_cycle_number: props.ovulationCycleNumber } : {}
    await request.put(`/patients/base/${props.medicalRecordNumber}`, baseInfoData, { params })

    // 修改胚胎数据
    for (const embryoId of modifiedEmbryos.value) {
      const embryo = embryoList.value.find(e => e.id === embryoId)
      if (embryo) {
        await request.put(`/patients/embryo/${embryoId}`, embryo)
      }
    }

    ElMessage.success('修改成功')
    emit('success')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('修改错误:', error)
      ElMessage.error('修改失败')
    }
  } finally {
    submitLoading.value = false
  }
}

// 监听公共字段变化
watch(commonForm, (newVal) => {
  // 记录所有修改过的字段
  modifiedCommonFields.value = { ...newVal }
}, { deep: true })

// 监听胚胎数据变化
watch(embryoList, () => {
  if (currentEmbryo.value) {
    modifiedEmbryos.value.add(currentEmbryo.value.id)
  }
}, { deep: true })

// 处理关闭
const handleClose = () => {
  emit('close')
}

// 初始化
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.common-fields,
.embryo-list,
.embryo-details {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.embryo-list {
  margin: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 500;
}

:deep(.el-input-number) {
  width: 100%;
}

.sub-section {
  margin: 15px 0;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.sub-title {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 15px;
  padding-left: 8px;
  border-left: 3px solid #409EFF;
}
</style>