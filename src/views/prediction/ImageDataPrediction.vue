<template>
  <main class="image-prediction">
    <header class="page-heading">
      <div><h2>图像数据预测</h2><p>选择患者与图片 · 分析图像 · 核对阶段和参数 · 生成预测</p></div>
      <el-tag type="primary" effect="plain">医生复核工作台</el-tag>
    </header>

    <el-card shadow="never" class="section-card selection-card">
      <div class="filter-bar">
        <label>病例日期</label>
        <el-select v-model="date" filterable placeholder="请选择日期" @change="loadEmbryos">
          <el-option v-for="d in dates" :key="d.date" :value="d.date" :label="d.date+'（'+d.embryos+' 枚胚胎）'"/>
        </el-select>
        <el-input v-model="search" clearable placeholder="检索病历、周期、图片库编号 / Well" class="search"/>
        <el-button :loading="loadingDates" @click="loadDates">刷新日期</el-button>
      </div>
      <p class="hint">日期取自病历编号中的日期，不代表图片拍摄日期。</p>
      <el-table :data="filteredEmbryos" v-loading="loadingEmbryos" max-height="230"
                highlight-current-row @current-change="chooseEmbryo" row-key="embryo_id">
        <el-table-column prop="patient_id" label="病历编号" min-width="135"/>
        <el-table-column prop="cycle_id" label="取卵周期" min-width="110"/>
        <el-table-column prop="archive_case" label="图片库编号" min-width="130"/>
        <el-table-column prop="well" label="Well" width="90"/>
        <el-table-column prop="embryo_number" label="胚胎序号" width="100"/>
        <el-table-column label="基础信息" width="110">
          <template #default="{row}"><el-tag :type="row.patient_db_id?'success':'warning'" size="small">{{row.patient_db_id?'已匹配':'未匹配'}}</el-tag></template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!date" description="先选择病例日期，再选择患者和胚胎" :image-size="70"/>
    </el-card>

    <template v-if="current">
      <el-card shadow="never" class="section-card patient-card">
        <template #header><div class="card-heading"><span>患者基础信息与对应胚胎</span><span class="hint">病历 {{current.patient_id}} · 周期 {{current.cycle_id}} · {{current.well}} · 胚胎 {{current.embryo_number}}</span></div></template>
        <el-descriptions :column="3" border class="embryo-info">
          <el-descriptions-item label="病历编号">{{current.patient_id}}</el-descriptions-item>
          <el-descriptions-item label="取卵周期">{{current.cycle_id}}</el-descriptions-item>
          <el-descriptions-item label="图片库编号">{{current.archive_case}}</el-descriptions-item>
          <el-descriptions-item label="Well">{{current.well}}</el-descriptions-item>
          <el-descriptions-item label="胚胎序号">{{current.embryo_number}}</el-descriptions-item>
          <el-descriptions-item label="当前图片">{{selectedImage?.label||'—'}}</el-descriptions-item>
        </el-descriptions>
        <el-descriptions :column="4" border>
          <el-descriptions-item v-for="field in patientFields" :key="field.key" :label="field.label">
            {{displayValue(current.patient_info?.[field.key])}}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>
      <el-alert v-if="!current.patient_db_id" title="图像可分析；尚未匹配系统患者基础信息，暂不能计算期望。" type="warning" :closable="false" class="patient-warning"/>

      <el-row :gutter="18" class="workspace">
        <el-col :xs="24" :lg="8">
          <el-card shadow="never" class="section-card workspace-panel image-panel">
            <template #header><div class="card-heading"><span>1. 选择图片</span><span class="hint">先选图，再识别阶段</span></div></template>
            <div class="gallery" v-loading="loadingImages">
              <button v-for="image in images" :key="image.image_id" type="button"
                      :class="['thumbnail',{selected:selectedImage?.image_id===image.image_id}]"
                      @click="selectImage(image)" :aria-label="'选择'+image.label">
                <img v-if="image.blobUrl" :src="image.blobUrl" :alt="image.label"/>
                <span v-else>图片不可用</span><span>{{image.label}}</span>
              </button>
            </div>
            <div class="image-preview">
              <img v-if="selectedImage?.blobUrl" :src="selectedImage.blobUrl" :alt="selectedImage.label"/>
              <el-empty v-else description="选择一张待分析图片" :image-size="80"/>
            </div>
            <el-button type="primary" class="wide-button" :loading="analyzing"
                       :disabled="!selectedImage?.blobUrl||loadingImages||!!submittedForm" @click="analyze">分析所选图片</el-button>
            <p class="hint">分析前不预设 D 几阶段，识别后可以人工修改。</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="16">
          <el-card shadow="never" class="section-card workspace-panel prediction-panel" v-loading="analyzing">
            <template #header>2. 核对阶段与字段参数</template>
            <el-empty v-if="!analysis" description="选择图片并点击“分析所选图片”" :image-size="100"/>
            <div v-else class="prediction-content">
              <div class="analysis-summary">
                <div><span class="hint">图像阶段预测</span><strong>{{stageSuggestion}}</strong></div>
                <div><span class="hint">预测得分</span><strong>{{topCandidate?percent(topCandidate.confidence):'—'}}</strong></div>
                <div><span class="hint">形态观察</span><strong>{{morphologyLabels[analysis.development_state]||'待确认'}}</strong></div>
              </div>
              <div v-if="!submittedForm" class="editable-form">
              <div class="stage-choice">
                <label>医生确认阶段</label>
                <el-select v-model="confirmedStage" placeholder="请选择阶段" @change="invalidateResult">
                  <el-option v-for="stage in stages" :key="stage.value" :label="stage.label" :value="stage.value"/>
                </el-select>
                <el-tag v-if="confirmedStage&&confirmedStage!==analysis.suggested_stage" type="warning">已人工调整阶段</el-tag>
              </div>
              <div class="table-scroll-region" aria-label="可上下滚动的预测字段表格">
              <el-table :data="currentFields" height="100%" class="field-table">
                <el-table-column label="字段" min-width="130">
                  <template #default="{row}"><b>{{row.label}}</b><small class="field-code">{{row.field}}</small></template>
                </el-table-column>
                <el-table-column label="图像建议值" min-width="135" class-name="suggestion-column">
                  <template #default="{row}"><span>{{displayValue(row.suggestion)}}</span><small class="field-code">{{row.confidence==null?'需手动填写':'预测得分 '+percent(row.confidence)}}</small></template>
                </el-table-column>
                <el-table-column label="医生确认值" min-width="160">
                  <template #default="{row}">
                    <el-input v-if="row.numeric" v-model="row.value" :placeholder="row.integer?'输入非负整数':'碎片比例 0–100'" @input="editField(row)"/>
                    <el-select v-else-if="fieldOptions(row).length" v-model="row.value" filterable allow-create default-first-option clearable placeholder="选择或填写" @change="editField(row)">
                      <el-option v-for="option in fieldOptions(row)" :key="option" :label="option" :value="option"/>
                    </el-select>
                    <el-input v-else v-model="row.value" :placeholder="row.property.startsWith('fd')?'例如 4AA':'手动填写'" @input="editField(row)"/>
                    <div class="field-review">
                      <el-tag :type="fieldReview(row).type" effect="light" size="small">{{fieldReview(row).label}}</el-tag>
                    </div>
                    <small v-if="row.edited" class="edited">{{hasValue(row.suggestion)?displayValue(row.suggestion)+' → '+displayValue(row.value):'已人工填写'}}</small>
                    <small v-if="!row.used_by_expectation_model" class="field-code">可记录，当前期望模型不使用此字段</small>
                  </template>
                </el-table-column>
              </el-table>
              </div>
              <p class="hint" v-if="confirmedStage===6||confirmedStage===7">当前 D6/D7 尚无独立字段图像模型，请人工填写囊胚分级。</p>
              <p class="hint" v-if="confirmedStage===1||confirmedStage===2">当前期望模型为 D3 模型；本次以较早阶段的有限参数计算，其他形态学参数保持缺失。</p>
              <div class="predict-actions">
                <span class="hint">已填写 {{filledCount}} 个参数</span>
                <el-button type="primary" :disabled="!confirmedStage||!filledCount" @click="submitParameters">提交</el-button>
              </div>
              <p v-if="resultNeedsUpdate" class="result-pending" role="status">输入已变更，请重新提交并核对确认后生成结果。</p>
              </div>

              <section v-else ref="submittedSection" class="submitted-form" tabindex="-1" aria-label="最终确认表单">
                <div class="submitted-heading">
                  <h3>最终确认表单</h3>
                  <el-tag :type="confirmationCompleted?'success':'info'">{{confirmationCompleted?'已确认':'只读 · 待确认'}}</el-tag>
                </div>
                <p class="hint">请核对以下表单。点击“核对并确认”后生成预测结果，点击“修改”可返回编辑。</p>
                <el-descriptions :column="2" border class="submitted-context">
                  <el-descriptions-item label="病历编号">{{submittedForm.patientId}}</el-descriptions-item>
                  <el-descriptions-item label="取卵周期">{{submittedForm.cycleId}}</el-descriptions-item>
                  <el-descriptions-item label="对应胚胎">{{submittedForm.well}} · 胚胎 {{submittedForm.embryoNumber}}</el-descriptions-item>
                  <el-descriptions-item label="当前图片">{{submittedForm.imageLabel}}</el-descriptions-item>
                  <el-descriptions-item label="医生确认阶段">{{submittedStageLabel}}</el-descriptions-item>
                  <el-descriptions-item label="已填写参数">{{Object.keys(submittedForm.properties).length}} 项</el-descriptions-item>
                </el-descriptions>
                <div class="table-scroll-region" aria-label="可上下滚动的最终确认表格">
                <el-table :data="submittedForm.fields" height="100%" class="confirmation-table">
                  <el-table-column label="字段" min-width="140">
                    <template #default="{row}"><b>{{row.label}}</b><small class="field-code">{{row.field}}</small></template>
                  </el-table-column>
                  <el-table-column label="最终确认值" min-width="130">
                    <template #default="{row}"><span class="confirmed-value">{{displayValue(row.value)}}</span><small v-if="row.edited" class="edited">已人工修改</small></template>
                  </el-table-column>
                </el-table>
                </div>
                <div class="confirmation-actions">
                  <el-button type="success" :loading="predicting" :disabled="confirmationCompleted||!submittedForm.patientDbId" @click="confirmAndPredict">核对并确认</el-button>
                  <el-button @click="modifyParameters">修改</el-button>
                </div>
              </section>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <section v-if="result" ref="resultSection" class="result-section" tabindex="-1" aria-label="本次预测结果">
      <el-card shadow="never" class="section-card result-card" :class="{'result-updated':resultHighlighted}">
        <template #header><div class="result-heading">
          <div class="result-title"><h3>3. 预测结果</h3><p class="result-context">{{current.patient_id}} · {{current.well}} · 胚胎 {{current.embryo_number}} · {{selectedImage?.label}}</p></div>
          <div class="result-meta">
            <div class="result-update"><span class="updated-label">已更新</span><time class="result-time">{{resultUpdatedAt}}</time></div>
            <div class="result-stage"><span>医生确认阶段</span><strong>D{{result.confirmed_stage}}</strong></div>
          </div>
        </div></template>
        <div class="metrics" :class="{'metrics--single':resultMetrics.length===1}">
          <div v-for="metric in resultMetrics" :key="metric.key" class="metric-card" :class="'metric-card--'+metricTone(result.metrics[metric.key])">
            <span class="metric-label">{{metric.label}}</span>
            <strong class="metric-value">{{percent(result.metrics[metric.key])}}</strong>
            <div v-if="metricProgress(result.metrics[metric.key])!==null" class="metric-progress" role="progressbar" :aria-label="metric.label" :aria-valuenow="metricProgress(result.metrics[metric.key])" aria-valuemin="0" aria-valuemax="100">
              <span :style="{width:metricProgress(result.metrics[metric.key])+'%'}"></span>
            </div>
          </div>
        </div>
        <div class="result-notes"><p>{{result.input_note}}</p><p v-if="result.early_stage">本次使用 D3 期望模型，输入为较早阶段已确认的有限参数。</p></div>
        <div class="input-receipt">
          <p class="receipt-label">本次使用的参数</p>
          <div class="parameter-list"><span v-for="(value,key) in result.properties_used" :key="key" class="parameter-chip" :class="{'parameter-chip--core':isCoreParameter(key)}"><span>{{fieldLabel(key)}}</span><strong>{{value}}</strong></span></div>
        </div>
      </el-card>
      </section>
    </template>
  </main>
</template>

<script>
import {computed, nextTick, onBeforeUnmount, onMounted, ref} from 'vue'
import {ElMessage} from 'element-plus'
import request from '../../utils/request'

export default {
  name: 'ImageDataPrediction',
  setup() {
    const submittedForm=ref(null), submittedSection=ref(null), confirmationCompleted=ref(false), resultNeedsUpdate=ref(false)
    const resultSection=ref(null), resultUpdatedAt=ref(''), resultHighlighted=ref(false)
    const dates=ref([]), date=ref(''), search=ref(''), embryos=ref([]), current=ref(null)
    const images=ref([]), selectedImage=ref(null), analysis=ref(null), confirmedStage=ref(null)
    const fieldsByStage=ref({}), result=ref(null)
    const loadingDates=ref(false), loadingEmbryos=ref(false), loadingImages=ref(false)
    const analyzing=ref(false), predicting=ref(false)
    let contextVersion=0, analysisVersion=0, resultVersion=0, dateVersion=0, datesVersion=0
    let resultHighlightTimer=null
    const blobUrls=new Set()
    const stages=[{value:1,label:'D1 · 原核观察'},{value:2,label:'D2 · 卵裂观察'},
      {value:3,label:'D3 · 卵裂 / 致密化观察'},{value:5,label:'D5 · 囊胚观察'},
      {value:6,label:'D6 · 囊胚观察'},{value:7,label:'D7 · 囊胚观察'}]
    const morphologyLabels={oocyte:'卵母细胞形态',pronuclear:'原核期形态',cleavage:'卵裂期形态',compaction:'致密化形态',blastocyst:'囊胚形态',uncertain:'形态待确认'}
    const patientFields=[{key:'female_age',label:'女方年龄'},{key:'male_age',label:'男方年龄'},
      {key:'female_bmi',label:'女方 BMI'},{key:'infertility_years',label:'不孕年限'},
      {key:'infertility_type',label:'不孕类型'},{key:'infertility_object',label:'不孕对象'},
      {key:'infertility_cause',label:'不孕原因'},{key:'treatment_cycle',label:'治疗周期'},
      {key:'stimulation_scheme',label:'促排方案'},{key:'fertilization_method',label:'授精方式'},
      {key:'AMH',label:'AMH'},{key:'bFSH',label:'基础 FSH'}]
    const filteredEmbryos=computed(()=>{
      const keyword=search.value.trim().toLowerCase()
      return embryos.value.filter(row=>[row.patient_id,row.cycle_id,row.archive_case,row.well]
        .some(value=>String(value??'').toLowerCase().includes(keyword)))
    })
    const currentFields=computed(()=>fieldsByStage.value[String(confirmedStage.value)]||[])
    const predictionFields=computed(()=>currentFields.value.filter(field=>field.used_by_expectation_model&&hasValue(field.value)))
    const filledCount=computed(()=>predictionFields.value.length)
    const submittedStageLabel=computed(()=>stages.find(stage=>stage.value===submittedForm.value?.stage)?.label||'—')
    const topCandidate=computed(()=>analysis.value?.stage_candidates?.[0])
    const stageSuggestion=computed(()=>topCandidate.value?.label||'阶段待确认')
    const resultMetrics=computed(()=>result.value?.confirmed_stage>=5
      ? [{key:'pregnancy_success_rate',label:'妊娠成功率'}]
      : [{key:'blastocyst_formation_rate',label:'囊胚形成期望'},{key:'quality_blastocyst_rate',label:'优质囊胚期望'},
        {key:'clinical_pregnancy_expectancy',label:'鲜胚临床妊娠期望'},{key:'frozen_clinical_pregnancy_expectancy',label:'冻胚临床妊娠期望'}])
    function hasValue(value){return value!==null&&value!==undefined&&String(value).trim()!==''}
    function displayValue(value){return hasValue(value)?value:'—'}
    function percent(value){return Number.isFinite(Number(value))&&value!=null?(Number(value)*100).toFixed(1)+'%':'—'}
    function metricProgress(value){return hasValue(value)&&Number.isFinite(Number(value))?Math.min(100,Math.max(0,Number(value)*100)):null}
    // 仅用于前端配色，不代表临床判断阈值。
    function metricTone(value){const progress=metricProgress(value);return progress===null?'neutral':progress>=65?'green':progress>=50?'cyan':'orange'}
    function isCoreParameter(key){return ['sd2_num','sd3_num','gr','fd5_grade','fd6_grade','fd7_grade'].includes(key)}
    function fieldOptions(row){
      const options=row.options||[]
      return ['sd2_size','sd3_size'].includes(row.property)?[...new Set([...options,'正常'])]:options
    }
    function fieldReview(row){
      if(!row.used_by_expectation_model)return {label:'仅观察',type:'info'}
      if(!hasValue(row.value))return {label:'待填写',type:'warning'}
      return row.edited?{label:'已修改',type:'warning'}:{label:'待核对',type:'info'}
    }
    function invalidateResult(){
      if(result.value)resultNeedsUpdate.value=true
      resultVersion++;result.value=null;predicting.value=false;resultHighlighted.value=false
      submittedForm.value=null;confirmationCompleted.value=false
      clearTimeout(resultHighlightTimer)
    }
    function clearAnalysis(){
      analysisVersion++;analyzing.value=false;analysis.value=null;confirmedStage.value=null;fieldsByStage.value={}
      invalidateResult();resultNeedsUpdate.value=false
    }
    function clearImages(){contextVersion++;clearAnalysis();selectedImage.value=null;images.value=[];blobUrls.forEach(url=>URL.revokeObjectURL(url));blobUrls.clear()}
    function fieldLabel(key){for(const fields of Object.values(fieldsByStage.value)){const field=fields.find(x=>x.property===key);if(field)return field.label}return key}
    async function loadDates(){
      const version=++datesVersion
      loadingDates.value=true
      try{
        const data=(await request.get('/image-analysis/dates')).data.data
        if(version===datesVersion)dates.value=data
      }
      catch(error){if(version===datesVersion)report(error,'日期加载失败')}
      finally{if(version===datesVersion)loadingDates.value=false}
    }
    async function loadEmbryos(){
      const version=++dateVersion
      clearImages();current.value=null;embryos.value=[];search.value='';loadingEmbryos.value=true
      try{
        const data=(await request.get('/image-analysis/dates/'+date.value+'/embryos')).data.data
        if(version===dateVersion)embryos.value=data
      }
      catch(error){if(version===dateVersion)report(error,'患者列表加载失败')}finally{if(version===dateVersion)loadingEmbryos.value=false}
    }
    async function chooseEmbryo(row){
      if(!row||current.value?.embryo_id===row.embryo_id)return
      clearImages();current.value=row;loadingImages.value=true
      const version=contextVersion
      try{
        const response=await request.get('/image-analysis/embryos/'+row.archive_case+'/'+row.well+'/images')
        if(version!==contextVersion)return
        const loaded=await Promise.all(response.data.data.map(async image=>{
          try{
            const response=await request.get(image.url,{responseType:'blob'})
            if(version!==contextVersion)return null
            const blobUrl=URL.createObjectURL(response.data);blobUrls.add(blobUrl)
            return {...image,blobUrl}
          }catch(error){return {...image,blobUrl:null}}
        }))
        if(version!==contextVersion)return
        images.value=loaded.filter(Boolean)
        selectedImage.value=images.value.find(x=>x.blobUrl)||null
        if(!selectedImage.value)ElMessage.error('该胚胎图片加载失败')
      }catch(error){if(version===contextVersion)report(error,'图片加载失败')}finally{if(version===contextVersion)loadingImages.value=false}
    }
    function selectImage(image){
      if(selectedImage.value?.image_id===image.image_id)return
      selectedImage.value=image;clearAnalysis()
    }
    function reference(){return {archive_case:current.value.archive_case,well:current.value.well,image_id:selectedImage.value.image_id}}
    async function analyze(){
      const version=++analysisVersion
      const context=contextVersion
      invalidateResult();analyzing.value=true
      try{
        const data=(await request.post('/image-analysis/analyze',reference())).data.data
        if(version!==analysisVersion||context!==contextVersion)return
        analysis.value=data
        fieldsByStage.value=Object.fromEntries(Object.entries(analysis.value.stage_fields).map(([stage,fields])=>[
          stage,fields.map(field=>{
            const value=field.numeric&&!Number.isFinite(Number(field.value))?'':(field.value??'')
            return {...field,suggestion:field.value,value,edited:false}
          })
        ]))
        confirmedStage.value=analysis.value.suggested_stage
        ElMessage.success('分析完成，请核对阶段与参数')
      }catch(error){if(version===analysisVersion)report(error,'图片分析失败')}
      finally{if(version===analysisVersion)analyzing.value=false}
    }
    function editField(row){row.edited=true;invalidateResult()}
    async function submitParameters(){
      if(!current.value||!selectedImage.value||!confirmedStage.value)return
      const fields=predictionFields.value
      if(!fields.length)return ElMessage.warning('请至少填写一个有效参数后提交')
      const invalid=fields.find(x=>x.numeric&&(!Number.isFinite(Number(x.value))||Number(x.value)<0||(x.integer&&!Number.isInteger(Number(x.value)))||(!x.integer&&Number(x.value)>100)))
      if(invalid)return ElMessage.warning(invalid.label+(invalid.integer?'需要填写非负整数':'需要填写 0–100 的数值'))
      const invalidGrade=fields.find(x=>x.property.startsWith('fd')&&!/^[1-6](?:[ABCabc]{2})?$/.test(String(x.value).trim()))
      if(invalidGrade)return ElMessage.warning('囊胚分级格式应为 1–6 或 4AA、3BB 等')
      const properties=Object.fromEntries(fields.map(x=>[x.property,x.numeric?Number(x.value):String(x.value).trim()]))
      const form=Object.freeze({
        stage:confirmedStage.value, patientDbId:current.value.patient_db_id,
        patientId:current.value.patient_id, cycleId:current.value.cycle_id, well:current.value.well,
        embryoNumber:current.value.embryo_number, imageLabel:selectedImage.value.label,
        reference:Object.freeze({...reference()}), properties:Object.freeze(properties),
        fields:Object.freeze(currentFields.value.map(row=>Object.freeze({
          property:row.property,label:row.label,field:row.field,value:row.value,edited:row.edited
        })))
      })
      invalidateResult();submittedForm.value=form;resultNeedsUpdate.value=false
      await nextTick()
      if(submittedForm.value!==form)return
      const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches
      submittedSection.value?.closest('.workspace')?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'})
      submittedSection.value?.focus({preventScroll:true})
    }
    function modifyParameters(){
      const form=submittedForm.value
      if(!form)return
      const draft=fieldsByStage.value[String(form.stage)]||[]
      form.fields.forEach(field=>{
        const row=draft.find(item=>item.property===field.property)
        if(row){row.value=field.value;row.edited=field.edited}
      })
      confirmedStage.value=form.stage
      invalidateResult()
    }
    async function confirmAndPredict(){
      const form=submittedForm.value
      if(!form||predicting.value||confirmationCompleted.value)return
      const version=++resultVersion
      const context=contextVersion
      predicting.value=true
      try{
        const data=(await request.post('/image-analysis/predict',{...form.reference,confirmed_stage:form.stage,properties:form.properties})).data.data
        if(version!==resultVersion||context!==contextVersion||submittedForm.value!==form)return
        result.value=data
        resultNeedsUpdate.value=false;confirmationCompleted.value=true
        resultUpdatedAt.value=new Date().toLocaleTimeString('zh-CN',{hour12:false,hour:'2-digit',minute:'2-digit',second:'2-digit'})
        await nextTick()
        if(version!==resultVersion||context!==contextVersion)return
        clearTimeout(resultHighlightTimer)
        resultHighlighted.value=false
        await nextTick()
        if(version!==resultVersion||context!==contextVersion)return
        resultHighlighted.value=true
        const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches
        resultSection.value?.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'})
        resultSection.value?.focus({preventScroll:true})
        resultHighlightTimer=setTimeout(()=>{resultHighlighted.value=false},2000)
        ElMessage.success('已按本次确认的阶段与参数完成预测')
      }catch(error){if(version===resultVersion)report(error,'预测失败')}
      finally{if(version===resultVersion)predicting.value=false}
    }
    function report(error,fallback){
      if(error.response?.status===401)return
      const detail=error.response?.data?.detail||error.response?.data?.message
      ElMessage.error(typeof detail==='string'?detail:fallback)
    }
    onMounted(loadDates)
    onBeforeUnmount(()=>{datesVersion++;dateVersion++;clearImages();clearTimeout(resultHighlightTimer)})
    return {submittedForm,submittedSection,submittedStageLabel,confirmationCompleted,submitParameters,modifyParameters,confirmAndPredict,dates,date,search,filteredEmbryos,current,images,selectedImage,analysis,confirmedStage,stages,
      currentFields,filledCount,fieldReview,resultNeedsUpdate,
      resultSection,resultUpdatedAt,resultHighlighted,result,resultMetrics,topCandidate,stageSuggestion,morphologyLabels,patientFields,
      loadingDates,loadingEmbryos,loadingImages,analyzing,predicting,loadDates,loadEmbryos,chooseEmbryo,selectImage,
      analyze,editField,invalidateResult,displayValue,hasValue,percent,metricProgress,metricTone,isCoreParameter,fieldLabel,fieldOptions}
  }
}
</script>

<style scoped>
.image-prediction{padding:24px;color:#24354b}
.page-heading,.card-heading,.filter-bar,.stage-choice,.predict-actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.page-heading,.card-heading,.predict-actions{justify-content:space-between}
.page-heading{margin-bottom:20px}.page-heading h2{margin:0 0 8px}.page-heading p{margin:0;color:#718096}
.patient-warning{margin-bottom:18px}
.embryo-info{margin-bottom:14px}
.section-card{margin-bottom:18px;border-radius:10px}.filter-bar .el-select{width:230px}.search{max-width:330px}
.workspace{--workspace-height:clamp(640px,76vh,780px);margin-bottom:18px;align-items:stretch}
.workspace>.el-col{display:flex;min-width:0}
.workspace-panel{width:100%;height:var(--workspace-height);display:flex;flex-direction:column;margin-bottom:0}
.workspace-panel :deep(.el-card__header){min-height:64px;display:flex;align-items:center;flex-shrink:0}
.workspace-panel :deep(.el-card__header .card-heading){width:100%}
.workspace-panel :deep(.el-card__body){display:flex;flex-direction:column;flex:1;min-height:0;overflow:hidden}
.prediction-content,.editable-form{display:flex;flex-direction:column;flex:1;min-height:0}
.table-scroll-region{flex:1;min-height:0;overflow:hidden}
.table-scroll-region :deep(.el-scrollbar__wrap){overscroll-behavior:contain}
.image-panel .gallery,.image-panel .wide-button,.image-panel .hint{flex-shrink:0}
.image-panel .image-preview{flex:1;height:auto;min-height:180px}
.hint{color:#738195;font-size:13px;line-height:1.7}.notice{margin-top:14px}
.gallery{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;min-height:88px}
.thumbnail{border:2px solid transparent;border-radius:8px;background:#f3f6fa;color:#526176;padding:4px;cursor:pointer;min-width:0;font-size:12px}
.thumbnail.selected{border-color:#409eff;background:#ecf5ff}.thumbnail img{width:100%;aspect-ratio:1;object-fit:cover;display:block;border-radius:4px}.thumbnail span{display:block;margin-top:4px}
.image-preview{background:#f4f7fb;border-radius:10px;margin:16px 0;min-height:280px;height:390px;display:flex;align-items:center;justify-content:center}
.image-preview img{max-width:100%;max-height:100%;object-fit:contain}.wide-button{width:100%}
.analysis-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:20px;background:#f3f7fd;border-radius:8px;padding:16px;flex-shrink:0}
.analysis-summary>div{display:flex;flex-direction:column;gap:5px;min-width:0}.analysis-summary strong{font-size:20px;overflow-wrap:anywhere}.analysis-summary .hint{margin:0}
.stage-choice{margin:16px 0 12px;flex-shrink:0}.stage-choice label{font-weight:600}.stage-choice .el-select{width:250px}
.field-code{display:block;color:#8893a4;font-size:11px;margin-top:5px;line-height:1.5}.edited{font-size:11px;color:#15803d;display:block;margin-top:4px}
.field-review{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:7px}.field-review .el-button{margin-left:0}
.field-table :deep(.suggestion-column){background:#f8fafc;color:#65758b}
.field-table .el-select{width:100%}.predict-actions{margin-top:16px;flex-shrink:0}
.editable-form>.hint,.editable-form>.result-pending{flex-shrink:0}.editable-form>.hint{margin:8px 0 0}
.submitted-form{display:flex;flex-direction:column;flex:1;min-height:0;margin-top:16px;scroll-margin-top:16px}.submitted-form:focus-visible{outline:2px solid #409eff;outline-offset:6px;border-radius:4px}.submitted-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:8px;flex-shrink:0}.submitted-heading h3{margin:0;font-size:17px}
.submitted-context{margin:12px 0;flex-shrink:0}.submitted-form>.hint{flex-shrink:0}.confirmed-value{font-weight:600;color:#24354b;overflow-wrap:anywhere}.confirmation-actions{display:flex;align-items:center;justify-content:flex-end;gap:12px;flex-wrap:wrap;margin-top:16px;flex-shrink:0}
.result-pending{margin:12px 0 0;padding:10px 12px;border-left:3px solid #d99a35;background:#fff8ed;color:#8a611e;font-size:13px}
.result-section{scroll-margin-top:16px;border-radius:12px}.result-section:focus-visible{outline:2px solid #668d7e;outline-offset:4px}
.result-card{border:1px solid #e3eae6;border-radius:12px;color:#35443e;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;box-shadow:0 3px 16px rgba(33,59,47,.025)}
.result-card :deep(.el-card__header){padding:24px 28px;border-bottom:1px solid #edf0ee}.result-card :deep(.el-card__body){padding:24px 28px 28px}
.result-heading{display:flex;align-items:center;justify-content:space-between;gap:24px}.result-title{min-width:0}.result-title h3{margin:0;font-size:20px;font-weight:600;line-height:1.5;letter-spacing:.2px}
.result-context{margin:8px 0 0;color:#84908a;font-size:13px;font-weight:400;line-height:1.7;overflow-wrap:anywhere}
.result-meta{display:flex;align-items:center;gap:24px;flex-shrink:0}.result-update{display:flex;flex-direction:column;gap:5px;align-items:flex-end}.updated-label{display:flex;align-items:center;gap:6px;color:#4d7866;font-size:13px;font-weight:500;line-height:1.5}.updated-label::before{content:'';width:5px;height:5px;border-radius:50%;background:#739986}.result-time{color:#919a95;font-size:12px;font-weight:400;font-variant-numeric:tabular-nums;line-height:1.5}
.result-stage{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:8px;background:#f2f6f3;font-size:12px;color:#77847d;line-height:1.5}.result-stage strong{color:#486b59;font-size:16px;font-weight:600}
.result-updated{animation:result-highlight 2s ease-out}
@keyframes result-highlight{from{box-shadow:0 0 0 3px rgba(92,133,112,.2);border-color:#8eac9a}to{box-shadow:0 0 0 0 rgba(92,133,112,0);border-color:#e3eae6}}
@media(prefers-reduced-motion:reduce){.result-updated{animation:none}}
.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}.metrics--single{grid-template-columns:minmax(0,1fr);max-width:340px}
.metric-card{--metric-accent:#467765;position:relative;display:flex;flex-direction:column;align-items:flex-start;min-width:0;overflow:hidden;padding:24px;border:1px solid #e8eeea;border-radius:12px;background:#fff;box-shadow:0 4px 14px rgba(30,57,44,.045)}.metric-card::before{content:'';position:absolute;inset:0 0 auto;height:2px;background:var(--metric-accent);opacity:.8}
.metric-card--cyan{--metric-accent:#4c8190}.metric-card--orange{--metric-accent:#a2784b}.metric-card--neutral{--metric-accent:#7b8780}
.metric-label{color:#78847d;font-size:14px;font-weight:400;line-height:1.6}.metric-value{margin-top:14px;color:var(--metric-accent);font-size:38px;font-weight:650;line-height:1.2;letter-spacing:-.6px;font-variant-numeric:tabular-nums}
.metric-progress{width:112px;max-width:100%;height:4px;margin-top:20px;overflow:hidden;border-radius:8px;background:#edf1ee}.metric-progress>span{display:block;height:100%;border-radius:inherit;background:var(--metric-accent)}
.result-notes{margin-top:18px;color:#8a948e;font-size:12px;font-weight:400;line-height:1.8}.result-notes p{margin:4px 0 0}
.input-receipt{display:flex;gap:16px;align-items:flex-start;margin-top:22px;padding-top:20px;border-top:1px solid #edf0ee}.receipt-label{flex-shrink:0;margin:6px 0;color:#748078;font-size:13px;font-weight:500;line-height:1.6}.parameter-list{display:flex;flex-wrap:wrap;gap:8px;min-width:0}
.parameter-chip{display:inline-flex;gap:8px;align-items:baseline;max-width:100%;padding:6px 10px;border-radius:8px;background:#f3f5f4;color:#5c6861;font-size:12px;line-height:1.6;overflow-wrap:anywhere}.parameter-chip>span{min-width:0}.parameter-chip strong{min-width:0;color:#46554b;font-weight:500}.parameter-chip--core{background:#edf5ef;color:#5c7964}.parameter-chip--core strong{color:#466b52}
@media(max-width:1100px){.image-prediction{padding:14px}.gallery{grid-template-columns:repeat(3,1fr)}.analysis-summary{gap:18px}.image-preview{height:320px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.metrics--single{grid-template-columns:minmax(0,1fr)}.metric-card{padding:22px}.result-meta{gap:16px}.result-card :deep(.el-card__header){padding:22px}.result-card :deep(.el-card__body){padding:22px}.input-receipt{flex-direction:column;gap:8px}.receipt-label{margin:0}}
@media(max-width:1199px){.image-panel{height:520px;margin-bottom:18px}.prediction-panel{height:740px}}
@media(max-width:600px){.image-panel{height:460px}.prediction-panel{height:760px}.analysis-summary{gap:12px;padding:12px}.analysis-summary .hint{font-size:12px}.analysis-summary strong{font-size:18px}.result-heading{align-items:flex-start;flex-direction:column;gap:16px}.result-title h3{font-size:18px}.result-meta{width:100%;justify-content:space-between}.result-update{align-items:flex-start}.metrics{grid-template-columns:minmax(0,1fr);gap:14px}.metrics--single{max-width:none}.result-card :deep(.el-card__header){padding:20px}.result-card :deep(.el-card__body){padding:20px}.metric-value{font-size:36px}.parameter-chip{flex-wrap:wrap;column-gap:8px;row-gap:0}}
</style>
