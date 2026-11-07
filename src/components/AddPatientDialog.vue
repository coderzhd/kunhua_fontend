<template>
  <el-dialog
    title="新增病人"
    v-model="dialogVisible"
    width="80%"
    :before-close="handleClose"
  >
    <el-form
      ref="patientFormRef"
      :model="patientForm"
      :rules="formRules"
      label-width="120px"
    >
      <!-- 基本信息部分 -->
      <div class="section-title">基本信息</div>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="病例编号" prop="medical_record_number">
            <el-input 
              v-model="patientForm.medical_record_number" 
              @blur="handleMedicalRecordNumberChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="取卵周期序号" prop="ovulation_cycle_number">
            <el-select 
              v-if="existingCycles.length > 0"
              v-model="patientForm.ovulation_cycle_number" 
              placeholder="请选择取卵周期序号"
              @change="handleCycleChange"
              class="custom-select"
            >
              <el-option 
                v-for="cycle in existingCycles" 
                :key="cycle.ovulation_cycle_number" 
                :label="cycle.ovulation_cycle_number" 
                :value="cycle.ovulation_cycle_number" 
              />
              <el-option label="新增周期" value="new" />
            </el-select>
            <el-input 
              v-else
              v-model="patientForm.ovulation_cycle_number" 
              placeholder="请输入取卵周期序号"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="日期" prop="date">
            <el-input 
              v-model="patientForm.date" 
              placeholder="YYYY/MM/DD"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="女方年龄" prop="female_age">
            <el-input-number 
              v-model="patientForm.female_age" 
              :precision="1"
              :step="0.1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="女方BMI" prop="female_bmi">
            <el-input-number 
              v-model="patientForm.female_bmi" 
              :precision="1"
              :step="0.1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="男方年龄" prop="male_age">
            <el-input-number 
              v-model="patientForm.male_age" 
              :precision="1"
              :step="0.1"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 检测指标部分 -->
      <div class="section-title">检测指标</div>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="bFSH" prop="bFSH">
            <el-input-number v-model="patientForm.bFSH" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="bLH" prop="bLH">
            <el-input-number v-model="patientForm.bLH" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="bPRL" prop="bPRL">
            <el-input-number v-model="patientForm.bPRL" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="bE2" prop="bE2">
            <el-input-number v-model="patientForm.bE2" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="bPo" prop="bPo">
            <el-input-number v-model="patientForm.bPo" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="bT" prop="bT">
            <el-input-number v-model="patientForm.bT" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="AMH" prop="AMH">
            <el-input-number v-model="patientForm.AMH" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- Day3指标 -->
      <div class="section-title">Day3指标</div>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="Day3FSH" prop="Day3FSH">
            <el-input-number v-model="patientForm.Day3FSH" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="Day3LH" prop="Day3LH">
            <el-input-number v-model="patientForm.Day3LH" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="Day3E2" prop="Day3E2">
            <el-input-number v-model="patientForm.Day3E2" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="Day3AMH" prop="Day3AMH">
            <el-input-number v-model="patientForm.Day3AMH" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- HCG日指标 -->
      <div class="section-title">HCG日指标</div>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="HCG日LH" prop="HCG_day_LH">
            <el-input-number v-model="patientForm.HCG_day_LH" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="HCG日E2" prop="HCG_day_E2">
            <el-input-number v-model="patientForm.HCG_day_E2" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="HCG日Po" prop="HCG_day_Po">
            <el-input-number v-model="patientForm.HCG_day_Po" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
        
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="HCG日内膜厚度" prop="HCG_day_endometrial_thickness">
            <el-input-number v-model="patientForm.HCG_day_endometrial_thickness" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="HCG日内膜类型" prop="HCG_day_endometrial_type">
            <el-input v-model="patientForm.HCG_day_endometrial_type" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="HCG日卵泡数" prop="HCG_day_follicle_count">
            <el-input-number v-model="patientForm.HCG_day_follicle_count" :precision="0" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 治疗信息 -->
      <div class="section-title">治疗信息</div>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="促排方案" prop="stimulation_scheme">
            <el-select v-model="patientForm.stimulation_scheme" placeholder="请选择" class="custom-select">
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
          <el-form-item label="促排用药量" prop="stimulation_dose">
            <el-input-number v-model="patientForm.stimulation_dose" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="授精方式" prop="fertilization_method">
            <el-select v-model="patientForm.fertilization_method" placeholder="请选择" class="custom-select">
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
          <el-form-item label="扳机用药" prop="trigger_medication">
            <el-input v-model="patientForm.trigger_medication" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="扳机用药量" prop="trigger_dose">
            <el-input-number v-model="patientForm.trigger_dose" :precision="2" :step="0.1" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 卵泡信息 -->
      <div class="section-title">卵泡信息</div>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="左卵巢窦状卵泡" prop="left_ovary_follicles">
            <el-input-number v-model="patientForm.left_ovary_follicles" :precision="0" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="右卵巢窦状卵泡" prop="right_ovary_follicles">
            <el-input-number v-model="patientForm.right_ovary_follicles" :precision="0" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="窦卵泡数" prop="antral_follicle_count">
            <el-input-number v-model="patientForm.antral_follicle_count" :precision="0" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 不孕信息 -->
      <div class="section-title">不孕信息</div>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="治疗周期" prop="treatment_cycle">
            <el-input-number v-model="patientForm.treatment_cycle" :precision="0" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="不孕年限" prop="infertility_years">
            <el-input-number v-model="patientForm.infertility_years" :precision="0" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="不孕原因" prop="infertility_cause">
            <el-input v-model="patientForm.infertility_cause" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="CDC_ART病因" prop="cdc_art_cause">
            <el-input v-model="patientForm.cdc_art_cause" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="不孕类型" prop="infertility_type">
            <el-input v-model="patientForm.infertility_type" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="不孕对象" prop="infertility_object">
            <el-input v-model="patientForm.infertility_object" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">

        <el-col :span="8">
          <el-form-item label="适应症" prop="indication">
            <el-input v-model="patientForm.indication" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 胚胎信息 -->
      <div class="embryo-section" v-for="(embryo, index) in embryos" :key="index">
        <div class="section-title">
          新增胚胎 {{ index + 1 }}
          <el-button 
            type="danger" 
            size="small" 
            @click="handleRemoveEmbryo(index)"
            v-if="embryos.length > 1"
          >
            删除
          </el-button>
        </div>

        <!-- PN阶段 -->
        <div class="sub-section">
          <div class="sub-title">PN阶段</div>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'sPN状态'" :prop="`embryos.${index}.spn_status`">
                <el-input v-model="embryo.spn_status" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'sPN分级'" :prop="`embryos.${index}.spn_grade`">
                <el-input v-model="embryo.spn_grade" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- D1阶段 -->
        <div class="sub-section">
          <div class="sub-title">D1阶段</div>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'sD1形态'" :prop="`embryos.${index}.sd1_morphology`">
                <el-input v-model="embryo.sd1_morphology" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'sD1胞质'" :prop="`embryos.${index}.sd1_cytoplasm`">
                <el-input v-model="embryo.sd1_cytoplasm" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- D2阶段 -->
        <div class="sub-section">
          <div class="sub-title">D2阶段</div>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'sD2卵裂球'" :prop="`embryos.${index}.sd2_num`">
                <el-input-number v-model="embryo.sd2_num" :precision="0" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'sD2胞核'" :prop="`embryos.${index}.sd2_nucleus`">
                <el-input v-model="embryo.sd2_nucleus" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'sD2大小'" :prop="`embryos.${index}.sd2_size`">
                <el-input v-model="embryo.sd2_size" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'sD2形态'" :prop="`embryos.${index}.sd2_morphology`">
                <el-input v-model="embryo.sd2_morphology" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'sD2胞质'" :prop="`embryos.${index}.sd2_cytoplasm`">
                <el-input v-model="embryo.sd2_cytoplasm" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'sD2碎片'" :prop="`embryos.${index}.sd2_fragments`">
                <el-input v-model="embryo.sd2_fragments" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- D3阶段 -->
        <div class="sub-section">
          <div class="sub-title">D3阶段</div>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'sD3卵裂球数目'" :prop="`embryos.${index}.sd3_num`">
                <el-input-number v-model="embryo.sd3_num" :precision="0" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'GR'" :prop="`embryos.${index}.gr`">
                <el-input-number v-model="embryo.gr" :precision="0" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'sD3胞核'" :prop="`embryos.${index}.sd3_nucleus`">
                <el-input v-model="embryo.sd3_nucleus" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'sD3大小'" :prop="`embryos.${index}.sd3_size`">
                <el-input v-model="embryo.sd3_size" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'sD3形态'" :prop="`embryos.${index}.sd3_morphology`">
                <el-input v-model="embryo.sd3_morphology" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'sD3胞质'" :prop="`embryos.${index}.sd3_cytoplasm`">
                <el-input v-model="embryo.sd3_cytoplasm" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'sD3致密'" :prop="`embryos.${index}.sd3_dense`">
                <el-input v-model="embryo.sd3_dense" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'sD3ZP'" :prop="`embryos.${index}.sd3_zp`">
                <el-input v-model="embryo.sd3_zp" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'sD3空泡'" :prop="`embryos.${index}.sd3_vacuole`">
                <el-input v-model="embryo.sd3_vacuole" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'sD3碎片'" :prop="`embryos.${index}.sd3_fragments`">
                <el-input v-model="embryo.sd3_fragments" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- D5阶段 -->
        <div class="sub-section">
          <div class="sub-title">D5阶段</div>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'fD5囊胚分级'" :prop="`embryos.${index}.fd5_grade`">
                <el-input v-model="embryo.fd5_grade" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'fD6囊胚分级'" :prop="`embryos.${index}.fd6_grade`">
                <el-input v-model="embryo.fd6_grade" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'fD7囊胚分级'" :prop="`embryos.${index}.fd7_grade`">
                <el-input v-model="embryo.fd7_grade" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 时序信息 -->
        <div class="sub-section">
          <div class="sub-title">时序信息</div>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'第二极体出现时间'" :prop="`embryos.${index}.second_polar_body_time`">
                <el-input-number v-model="embryo.second_polar_body_time" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'第二极体结束时间'" :prop="`embryos.${index}.second_polar_end_time`">
                <el-input-number v-model="embryo.second_polar_end_time" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'原核出现时间'" :prop="`embryos.${index}.pronucleus_appearance`">
                <el-input-number v-model="embryo.pronucleus_appearance" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'原核消失时间'" :prop="`embryos.${index}.pronucleus_disappearance`">
                <el-input-number v-model="embryo.pronucleus_disappearance" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'初次卵裂时间'" :prop="`embryos.${index}.first_cleavage_time`">
                <el-input-number v-model="embryo.first_cleavage_time" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'t3'" :prop="`embryos.${index}.t3`">
                <el-input-number v-model="embryo.t3" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'t4'" :prop="`embryos.${index}.t4`">
                <el-input-number v-model="embryo.t4" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'t5'" :prop="`embryos.${index}.t5`">
                <el-input-number v-model="embryo.t5" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'t6'" :prop="`embryos.${index}.t6`">
                <el-input-number v-model="embryo.t6" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'t7'" :prop="`embryos.${index}.t7`">
                <el-input-number v-model="embryo.t7" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'t8'" :prop="`embryos.${index}.t8`">
                <el-input-number v-model="embryo.t8" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'t9'" :prop="`embryos.${index}.t9`">
                <el-input-number v-model="embryo.t9" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'tB'" :prop="`embryos.${index}.tB`">
                <el-input-number v-model="embryo.tB" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'tDead'" :prop="`embryos.${index}.tDead`">
                <el-input-number v-model="embryo.tDead" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'tEB'" :prop="`embryos.${index}.tEB`">
                <el-input-number v-model="embryo.tEB" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'tHB'" :prop="`embryos.${index}.tHB`">
                <el-input-number v-model="embryo.tHB" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'tM'" :prop="`embryos.${index}.tM`">
                <el-input-number v-model="embryo.tM" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'tSB'" :prop="`embryos.${index}.tSB`">
                <el-input-number v-model="embryo.tSB" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'tSC'" :prop="`embryos.${index}.tSC`">
                <el-input-number v-model="embryo.tSC" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'PPB'" :prop="`embryos.${index}.PPB`">
                <el-input-number v-model="embryo.PPB" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'L1'" :prop="`embryos.${index}.L1`">
                <el-input-number v-model="embryo.L1" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'L2'" :prop="`embryos.${index}.L2`">
                <el-input-number v-model="embryo.L2" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'L3'" :prop="`embryos.${index}.L3`">
                <el-input-number v-model="embryo.L3" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'CC2'" :prop="`embryos.${index}.CC2`">
                <el-input-number v-model="embryo.CC2" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item :label="'s2'" :prop="`embryos.${index}.s2`">
                <el-input-number v-model="embryo.s2" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item :label="'CC3'" :prop="`embryos.${index}.CC3`">
                <el-input-number v-model="embryo.CC3" :precision="8" :step="0.00000001" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </div>

      <div class="add-embryo">
        <el-button type="primary" @click="addEmbryo">新增胚胎</el-button>
      </div>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          创建病人
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'success'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const patientFormRef = ref(null)
const existingCycles = ref([])
const isLoadingCycles = ref(false)
const originalFormData = ref(null)

// 基本表单数据
const patientForm = reactive({
  medical_record_number: '',
  ovulation_cycle_number: '',
  date: '',
  female_age: null,
  female_bmi: null,
  male_age: null,
  bFSH: null,
  bLH: null,
  bPRL: null,
  bE2: null,
  bPo: null,
  bT: null,
  AMH: null,
  stimulation_dose: null,
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
  trigger_dose: null,
  left_ovary_follicles: null,
  right_ovary_follicles: null,
  antral_follicle_count: null,
  treatment_cycle: null,
  infertility_years: null,
  infertility_cause: '',
  cdc_art_cause: '',
  infertility_type: '',
  infertility_object: '',
  indication: '',
  stimulation_scheme: '',
  fertilization_method: ''
})

// 胚胎数据列表
const embryos = ref([{
  spn_status: '',
  spn_grade: '',
  sd1_morphology: '',
  sd1_cytoplasm: '',
  sd2_num: null,
  sd2_nucleus: '',
  sd2_size: '',
  sd2_morphology: '',
  sd2_cytoplasm: '',
  sd2_fragments: '',
  sd3_num: null,
  gr: null,
  sd3_nucleus: '',
  sd3_size: '',
  sd3_morphology: '',
  sd3_cytoplasm: '',
  sd3_dense: '',
  sd3_zp: '',
  sd3_vacuole: '',
  sd3_fragments: '',
  fd5_grade: '',
  fd6_grade: '',
  fd7_grade: '',
  second_polar_body_time: null,
  second_polar_end_time: null,
  pronucleus_appearance: null,
  pronucleus_disappearance: null,
  first_cleavage_time: null,
  t3: null,
  t4: null,
  t5: null,
  t6: null,
  t7: null,
  t8: null,
  t9: null,
  tB: null,
  tDead: null,
  tEB: null,
  tHB: null,
  tM: null,
  tSB: null,
  tSC: null,
  PPB: null,
  L1: null,
  L2: null,
  L3: null,
  CC2: null,
  s2: null,
  CC3: null
}])

// 表单验证规则
const formRules = {
  medical_record_number: [
    { required: true, message: '请输入病例编号', trigger: 'blur' }
  ],
  ovulation_cycle_number: [
    { required: true, message: '请输入取卵周期序号', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '请输入日期', trigger: 'blur' },
    { 
      pattern: /^\d{4}\/([1-9]|1[0-2])\/([1-9]|[12]\d|3[01])$/,
      message: '日期格式应为 YYYY/M/D',
      trigger: 'blur'
    }
  ]
}

// 处理病例编号变化
const handleMedicalRecordNumberChange = async () => {
  if (!patientForm.medical_record_number.trim()) {
    existingCycles.value = []
    return
  }
  
  try {
    isLoadingCycles.value = true
    const response = await request.get(`/patients/${patientForm.medical_record_number}/cycles`)
    
    if (response.data.flag && response.data.data.length > 0) {
      existingCycles.value = response.data.data
      // 清空取卵周期序号，让用户重新选择
      patientForm.ovulation_cycle_number = ''
    } else {
      existingCycles.value = []
    }
  } catch (error) {
    console.error('获取取卵周期列表失败:', error)
    existingCycles.value = []
  } finally {
    isLoadingCycles.value = false
  }
}

// 处理取卵周期选择变化
const handleCycleChange = async (value) => {
  if (value === 'new') {
    // 选择新增周期，清空取卵周期序号让用户输入
    patientForm.ovulation_cycle_number = ''
    existingCycles.value = []
    // 恢复原始表单数据
    if (originalFormData.value) {
      Object.assign(patientForm, originalFormData.value)
      originalFormData.value = null
    }
    return
  }
  
  if (value && existingCycles.value.length > 0) {
    // 选择了已有的取卵周期，获取基础信息进行回显
    try {
      loading.value = true
      const response = await request.get(`/patients/${patientForm.medical_record_number}/base-info`, {
        params: { ovulation_cycle_number: value }
      })
      
      if (response.data.flag && response.data.data) {
        // 保存原始表单数据
        if (!originalFormData.value) {
          originalFormData.value = { ...patientForm }
        }
        
        // 回显基础信息
        const baseInfo = response.data.data
        Object.keys(patientForm).forEach(key => {
          if (baseInfo[key] !== undefined && baseInfo[key] !== null) {
            patientForm[key] = baseInfo[key]
          }
        })
      }
    } catch (error) {
      console.error('获取基础信息失败:', error)
      ElMessage.error('获取基础信息失败')
    } finally {
      loading.value = false
    }
  }
}

// 添加胚胎
const addEmbryo = () => {
  embryos.value.push({
    spn_status: '',
    spn_grade: '',
    sd1_morphology: '',
    sd1_cytoplasm: '',
    sd2_num: null,
    sd2_nucleus: '',
    sd2_size: '',
    sd2_morphology: '',
    sd2_cytoplasm: '',
    sd2_fragments: '',
    sd3_num: null,
    gr: null,
    sd3_nucleus: '',
    sd3_size: '',
    sd3_morphology: '',
    sd3_cytoplasm: '',
    sd3_dense: '',
    sd3_zp: '',
    sd3_vacuole: '',
    sd3_fragments: '',
    fd5_grade: '',
    fd6_grade: '',
    fd7_grade: '',
    second_polar_body_time: null,
    second_polar_end_time: null,
    pronucleus_appearance: null,
    pronucleus_disappearance: null,
    first_cleavage_time: null,
    t3: null,
    t4: null,
    t5: null,
    t6: null,
    t7: null,
    t8: null,
    t9: null,
    tB: null,
    tDead: null,
    tEB: null,
    tHB: null,
    tM: null,
    tSB: null,
    tSC: null,
    PPB: null,
    L1: null,
    L2: null,
    L3: null,
    CC2: null,
    s2: null,
    CC3: null
  })
}

// 删除胚胎前的确认
const handleRemoveEmbryo = async (index) => {
  try {
    await ElMessageBox.confirm('确定要删除这个胚胎吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    removeEmbryo(index)
  } catch (error) {
    // 用户取消删除，不做任何操作
  }
}

// 原来的删除方法保持不变
const removeEmbryo = (index) => {
  embryos.value.splice(index, 1)
}

// 处理关闭
const handleClose = () => {
  // 重置状态
  existingCycles.value = []
  originalFormData.value = null
  emit('close')
}

// 处理提交
const handleSubmit = async () => {
  if (!patientFormRef.value) return

  try {
    await patientFormRef.value.validate()
    loading.value = true

    // 构建基本数据
    const baseData = { ...patientForm }
    // 添加日期后缀
    if (baseData.date) {
      baseData.date = `${baseData.date} 0:00`
    }

    // 移除空值
    Object.keys(baseData).forEach(key => {
      if (baseData[key] === null || baseData[key] === '') {
        delete baseData[key]
      }
    })

    // 发送请求
    for (const embryo of embryos.value) {
      const requestData = {
        ...baseData,
        ...embryo
      }

      // 移除空值
      Object.keys(requestData).forEach(key => {
        if (requestData[key] === null || requestData[key] === '') {
          delete requestData[key]
        }
      })

      await request.post('/patients/', requestData)
    }

    ElMessage.success('创建成功')
    emit('success')
  } catch (error) {
    console.error('创建病人错误:', error)
    ElMessage.error('创建失败，请检查数据后重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 20px 0;
  padding-left: 10px;
  border-left: 4px solid #409EFF;
}

.embryo-section {
  margin: 20px 0;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.add-embryo {
  text-align: center;
  margin: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.custom-select {
  width: 100%;
}

:deep(.el-form-item__label) {
  font-size: 13px;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>