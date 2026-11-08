<template>
  <main class="image-prediction">
    <header class="page-heading">
      <div><h2>图像数据预测</h2><p>选择患者与图片 · 分析图像 · 核对阶段和参数 · 生成预测</p></div>
      <el-tag effect="plain">医生复核工作台</el-tag>
    </header>

    <el-card shadow="never" class="section-card">
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
      <el-card shadow="never" class="section-card">
        <template #header><div class="card-heading"><span>患者基础信息</span><span class="hint">病历 {{current.patient_id}} · 周期 {{current.cycle_id}} · {{current.well}} · 胚胎 {{current.embryo_number}}</span></div></template>
        <el-descriptions :column="4" border>
          <el-descriptions-item v-for="field in patientFields" :key="field.key" :label="field.label">
            {{displayValue(current.patient_info?.[field.key])}}
          </el-descriptions-item>
        </el-descriptions>
        <el-alert v-if="!current.patient_db_id" title="图像可分析；尚未匹配系统患者基础信息，暂不能计算期望。" type="warning" :closable="false" class="notice"/>
      </el-card>

      <el-row :gutter="18" class="workspace">
        <el-col :xs="24" :lg="10">
          <el-card shadow="never" class="section-card">
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
                       :disabled="!selectedImage?.blobUrl||loadingImages" @click="analyze">分析所选图片</el-button>
            <p class="hint">分析前不预设 D 几阶段，识别后可以人工修改。</p>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="14">
          <el-card shadow="never" class="section-card" v-loading="analyzing">
            <template #header>2. 核对阶段与字段参数</template>
            <el-empty v-if="!analysis" description="选择图片并点击“分析所选图片”" :image-size="100"/>
            <template v-else>
              <div class="analysis-summary">
                <div><span class="hint">图像阶段建议</span><strong>{{stageSuggestion}}</strong>
                  <small v-if="topCandidate">模型得分 {{percent(topCandidate.confidence)}}</small></div>
                <div><span class="hint">形态观察</span><strong>{{morphologyLabels[analysis.development_state]||'待确认'}}</strong></div>
              </div>
              <p class="hint">{{analysis.stage_note}} 当前分析不判断停育。</p>
              <div class="stage-choice">
                <label>医生确认阶段</label>
                <el-select v-model="confirmedStage" placeholder="请选择阶段" @change="invalidateResult">
                  <el-option v-for="stage in stages" :key="stage.value" :label="stage.label" :value="stage.value"/>
                </el-select>
                <el-tag v-if="confirmedStage&&confirmedStage!==analysis.suggested_stage" type="warning">已人工调整阶段</el-tag>
              </div>
              <p class="hint">表格显示当前确认阶段的字段。核对或修改后，勾选需要用于预测的参数；空白项可以手动填写。</p>
              <el-table :data="currentFields" class="field-table">
                <el-table-column label="使用" width="58" align="center">
                  <template #default="{row}"><el-checkbox v-model="row.included" :disabled="!hasValue(row.value)||!row.used_by_expectation_model" :aria-label="'使用'+row.label" @change="invalidateResult"/></template>
                </el-table-column>
                <el-table-column label="字段" min-width="130">
                  <template #default="{row}"><b>{{row.label}}</b><small class="field-code">{{row.field}}</small></template>
                </el-table-column>
                <el-table-column label="图像预测值" min-width="135">
                  <template #default="{row}"><span>{{displayValue(row.suggestion)}}</span><small class="field-code">{{row.confidence==null?'需手动填写':'模型得分 '+percent(row.confidence)+' · 待核对'}}</small></template>
                </el-table-column>
                <el-table-column label="医生确认值" min-width="160">
                  <template #default="{row}">
                    <el-input v-if="row.numeric" v-model="row.value" :placeholder="row.integer?'输入非负整数':'碎片比例 0–100'" @input="editField(row)"/>
                    <el-select v-else-if="row.options.length" v-model="row.value" filterable allow-create default-first-option clearable placeholder="选择或填写" @change="editField(row)">
                      <el-option v-for="option in row.options" :key="option" :label="option" :value="option"/>
                    </el-select>
                    <el-input v-else v-model="row.value" :placeholder="row.property.startsWith('fd')?'例如 4AA':'手动填写'" @input="editField(row)"/>
                    <small v-if="row.edited" class="edited">已人工修改</small>
                    <small v-if="!row.used_by_expectation_model" class="field-code">可记录，当前期望模型不使用此字段</small>
                  </template>
                </el-table-column>
              </el-table>
              <p class="hint" v-if="confirmedStage===6||confirmedStage===7">当前 D6/D7 尚无独立字段图像模型，请人工填写囊胚分级。</p>
              <p class="hint" v-if="confirmedStage===1||confirmedStage===2">当前期望模型为 D3 模型；本次以较早阶段的有限参数计算，其他形态学参数保持缺失。</p>
              <div class="predict-actions">
                <span class="hint">已选 {{includedCount}} 个参数</span>
                <el-button type="success" :loading="predicting" :disabled="!current.patient_db_id||!confirmedStage||!includedCount" @click="predict">确认参数并预测</el-button>
              </div>
            </template>
          </el-card>
        </el-col>
      </el-row>

      <el-card v-if="result" shadow="never" class="section-card result-card">
        <template #header><div class="card-heading"><span>3. 预测结果</span><el-tag>医生确认阶段：D{{result.confirmed_stage}}</el-tag></div></template>
        <div class="metrics"><div v-for="metric in resultMetrics" :key="metric.key"><span>{{metric.label}}</span><strong>{{percent(result.metrics[metric.key])}}</strong></div></div>
        <p class="hint">{{result.input_note}}</p>
        <p class="hint" v-if="result.early_stage">本次使用 D3 期望模型，输入为较早阶段已确认的有限参数。</p>
        <div class="input-receipt"><span>本次使用的参数：</span><el-tag v-for="(value,key) in result.properties_used" :key="key" effect="plain">{{fieldLabel(key)}}：{{value}}</el-tag></div>
      </el-card>
    </template>
  </main>
</template>

<script>
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import {ElMessage} from 'element-plus'
import request from '../../utils/request'

export default {
  name: 'ImageDataPrediction',
  setup() {
    const dates=ref([]), date=ref(''), search=ref(''), embryos=ref([]), current=ref(null)
    const images=ref([]), selectedImage=ref(null), analysis=ref(null), confirmedStage=ref(null)
    const fieldsByStage=ref({}), result=ref(null)
    const loadingDates=ref(false), loadingEmbryos=ref(false), loadingImages=ref(false)
    const analyzing=ref(false), predicting=ref(false)
    let contextVersion=0, analysisVersion=0, resultVersion=0, dateVersion=0
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
    const filteredEmbryos=computed(()=>embryos.value.filter(x=>[x.patient_id,x.cycle_id,x.archive_case,x.well].some(v=>String(v||'').includes(search.value.trim()))))
    const currentFields=computed(()=>fieldsByStage.value[String(confirmedStage.value)]||[])
    const includedCount=computed(()=>currentFields.value.filter(x=>x.included&&hasValue(x.value)).length)
    const topCandidate=computed(()=>analysis.value?.stage_candidates?.[0])
    const stageSuggestion=computed(()=>topCandidate.value?.label||'阶段待确认')
    const resultMetrics=computed(()=>result.value?.confirmed_stage>=5
      ? [{key:'pregnancy_success_rate',label:'妊娠成功率'}]
      : [{key:'blastocyst_formation_rate',label:'囊胚形成期望'},{key:'quality_blastocyst_rate',label:'优质囊胚期望'},
        {key:'clinical_pregnancy_expectancy',label:'鲜胚临床妊娠期望'},{key:'frozen_clinical_pregnancy_expectancy',label:'冻胚临床妊娠期望'}])
    function hasValue(value){return value!==null&&value!==undefined&&String(value).trim()!==''}
    function displayValue(value){return hasValue(value)?value:'—'}
    function percent(value){return Number.isFinite(Number(value))&&value!=null?(Number(value)*100).toFixed(1)+'%':'—'}
    function invalidateResult(){resultVersion++;result.value=null}
    function clearAnalysis(){analysisVersion++;analyzing.value=false;analysis.value=null;confirmedStage.value=null;fieldsByStage.value={};invalidateResult()}
    function clearImages(){contextVersion++;clearAnalysis();selectedImage.value=null;images.value=[];blobUrls.forEach(url=>URL.revokeObjectURL(url));blobUrls.clear()}
    function fieldLabel(key){for(const fields of Object.values(fieldsByStage.value)){const field=fields.find(x=>x.property===key);if(field)return field.label}return key}
    async function loadDates(){
      loadingDates.value=true
      try{dates.value=(await request.get('/image-analysis/dates')).data.data}
      catch(error){report(error,'日期加载失败')}finally{loadingDates.value=false}
    }
    async function loadEmbryos(){
      const version=++dateVersion
      clearImages();current.value=null;embryos.value=[];search.value='';loadingEmbryos.value=true
      try{const response=await request.get('/image-analysis/dates/'+date.value+'/embryos');if(version===dateVersion)embryos.value=response.data.data}
      catch(error){report(error,'患者列表加载失败')}finally{if(version===dateVersion)loadingEmbryos.value=false}
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
      }catch(error){report(error,'图片加载失败')}finally{if(version===contextVersion)loadingImages.value=false}
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
        const response=await request.post('/image-analysis/analyze',reference())
        if(version!==analysisVersion||context!==contextVersion)return
        analysis.value=response.data.data
        fieldsByStage.value=Object.fromEntries(Object.entries(analysis.value.stage_fields).map(([stage,fields])=>[
          stage,fields.map(field=>{
            const value=field.numeric&&!Number.isFinite(Number(field.value))?'':(field.value??'')
            return {...field,suggestion:field.value,value,included:hasValue(value)&&field.used_by_expectation_model,edited:false}
          })
        ]))
        confirmedStage.value=analysis.value.suggested_stage
        ElMessage.success('分析完成，请核对阶段与参数')
      }catch(error){if(version===analysisVersion)report(error,'图片分析失败')}
      finally{if(version===analysisVersion)analyzing.value=false}
    }
    function editField(row){row.edited=true;row.included=hasValue(row.value)&&row.used_by_expectation_model;invalidateResult()}
    async function predict(){
      const fields=currentFields.value.filter(x=>x.included&&hasValue(x.value))
      const invalid=fields.find(x=>x.numeric&&(!Number.isFinite(Number(x.value))||Number(x.value)<0||(x.integer&&!Number.isInteger(Number(x.value)))||(!x.integer&&Number(x.value)>100)))
      if(invalid)return ElMessage.warning(invalid.label+(invalid.integer?'需要填写非负整数':'需要填写 0–100 的数值'))
      const version=++resultVersion
      const context=contextVersion
      const properties=Object.fromEntries(fields.map(x=>[x.property,x.numeric?Number(x.value):String(x.value).trim()]))
      predicting.value=true
      try{
        const response=await request.post('/image-analysis/predict',{...reference(),confirmed_stage:confirmedStage.value,properties})
        if(version!==resultVersion||context!==contextVersion)return
        result.value=response.data.data
        ElMessage.success('已按本次确认的阶段与参数完成预测')
      }catch(error){if(version===resultVersion)report(error,'预测失败')}
      finally{predicting.value=false}
    }
    function report(error,fallback){
      if(error.response?.status===401)return
      const detail=error.response?.data?.detail||error.response?.data?.message
      ElMessage.error(typeof detail==='string'?detail:fallback)
    }
    onMounted(loadDates)
    onBeforeUnmount(()=>{dateVersion++;clearImages()})
    return {dates,date,search,filteredEmbryos,current,images,selectedImage,analysis,confirmedStage,stages,
      currentFields,includedCount,result,resultMetrics,topCandidate,stageSuggestion,morphologyLabels,patientFields,
      loadingDates,loadingEmbryos,loadingImages,analyzing,predicting,loadDates,loadEmbryos,chooseEmbryo,selectImage,
      analyze,predict,editField,invalidateResult,displayValue,hasValue,percent,fieldLabel}
  }
}
</script>

<style scoped>
.image-prediction{padding:24px;color:#24354b}
.page-heading,.card-heading,.filter-bar,.stage-choice,.predict-actions{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.page-heading,.card-heading,.predict-actions{justify-content:space-between}
.page-heading{margin-bottom:20px}.page-heading h2{margin:0 0 8px}.page-heading p{margin:0;color:#718096}
.section-card{margin-bottom:18px;border-radius:10px}.filter-bar .el-select{width:230px}.search{max-width:330px}
.hint{color:#738195;font-size:13px;line-height:1.7}.notice{margin-top:14px}
.gallery{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;min-height:88px}
.thumbnail{border:2px solid transparent;border-radius:8px;background:#f3f6fa;color:#526176;padding:4px;cursor:pointer;min-width:0;font-size:12px}
.thumbnail.selected{border-color:#409eff;background:#ecf5ff}.thumbnail img{width:100%;aspect-ratio:1;object-fit:cover;display:block;border-radius:4px}.thumbnail span{display:block;margin-top:4px}
.image-preview{background:#f4f7fb;border-radius:10px;margin:16px 0;min-height:280px;height:390px;display:flex;align-items:center;justify-content:center}
.image-preview img{max-width:100%;max-height:100%;object-fit:contain}.wide-button{width:100%}
.analysis-summary{display:flex;gap:40px;background:#f3f7fd;border-radius:8px;padding:16px}
.analysis-summary>div{display:flex;flex-direction:column;gap:5px}.analysis-summary strong{font-size:20px}.analysis-summary small{color:#738195}
.stage-choice{margin:20px 0 12px}.stage-choice label{font-weight:600}.stage-choice .el-select{width:250px}
.field-code{display:block;color:#8893a4;font-size:11px;margin-top:5px;line-height:1.5}.edited{font-size:11px;color:#15803d;display:block;margin-top:4px}
.field-table .el-select{width:100%}.predict-actions{margin-top:20px}
.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:18px}.metrics>div{display:flex;flex-direction:column;gap:12px;background:#f0f9f5;border-radius:8px;padding:20px}.metrics span{font-size:14px;color:#5c6e68}.metrics strong{font-size:30px;color:#19866a}
.input-receipt{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:13px}
@media(max-width:1100px){.image-prediction{padding:14px}.gallery{grid-template-columns:repeat(3,1fr)}.analysis-summary{gap:18px}.image-preview{height:320px}}
</style>
