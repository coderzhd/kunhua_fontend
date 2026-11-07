<template>
  <div class="range-selector-container">
    <div class="control-panel">
      <el-form :model="config" label-width="80px" class="config-form">
        <el-form-item label="开始值">
          <el-input-number
              v-model="config.startValue"
              :min="config.min"
              :max="config.endValue"
              :step="config.step"
              @change="handleStartValueChange"
          />
        </el-form-item>

        <el-form-item label="结束值">
          <el-input-number
              v-model="config.endValue"
              :min="config.startValue"
              :max="config.max"
              :step="config.step"
              @change="handleEndValueChange"
          />
        </el-form-item>
      </el-form>
    </div>

    <el-card class="values-card">
      <div class="values-display">
        <div class="value-item">
          <div class="value-label">开始值</div>
          <div class="value-number">{{ rangeValue[0] }}</div>
        </div>
        <div class="value-item">
          <div class="value-label">结束值</div>
          <div class="value-number">{{ rangeValue[1] }}</div>
        </div>
        <div class="value-item">
          <div class="value-label">步长</div>
          <div class="value-number">{{ config.step }}</div>
        </div>
        <div class="value-item">
          <div class="value-label">当前间隔</div>
          <div class="value-number" :class="{ 'interval-exceed': currentInterval > maxInterval }">
            {{ currentInterval }}
          </div>
        </div>
      </div>
    </el-card>

    <div class="quick-actions">
      <el-button-group>
<!--        <el-button @click="setRange(config.startValue, config.startValue + maxInterval)">设为最大间隔</el-button>-->
        <el-button @click="resetToDefault">重置默认</el-button>
      </el-button-group>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue'

export default defineComponent({
  name: 'RangeSelector',
  props: {
    title: { type: String, default: '' },
    defaultMin: { type: Number, default: 0 },
    defaultMax: { type: Number, default: 1000 },
    defaultStep: { type: Number, default: 25 },
    defaultStart: { type: Number, default: 0 },
    defaultEnd: { type: Number, default: 150 },
    maxInterval: { type: Number, default: 150 } // 默认改为 150
  },
  setup(props, { emit }) {
    const config = ref({
      min: props.defaultMin,
      max: props.defaultMax,
      step: props.defaultStep,
      startValue: props.defaultStart,
      endValue: props.defaultEnd
    })

    const baseValues = ref({
      start: props.defaultStart,
      end: props.defaultEnd
    })

    const rangeValue = ref([props.defaultStart, props.defaultEnd])

    const currentInterval = computed(() => (rangeValue.value[1] - rangeValue.value[0]).toFixed(1))

    const checkIntervalLimit = () => {
      const interval = config.value.endValue - config.value.startValue
      if (interval > props.maxInterval) {
        config.value.endValue = config.value.startValue + props.maxInterval
      }
      rangeValue.value = [config.value.startValue, config.value.endValue]
      emit('change', rangeValue.value)
    }

    const handleStartValueChange = () => {
      checkIntervalLimit()
    }

    const handleEndValueChange = () => {
      checkIntervalLimit()
    }

    const setRange = (start, end) => {
      config.value.startValue = start
      config.value.endValue = Math.min(end, config.value.max)
      rangeValue.value = [config.value.startValue, config.value.endValue]
      emit('change', rangeValue.value)
    }

    const updateConfig = (newConfig) => {
      Object.assign(config.value, newConfig)
      rangeValue.value = [newConfig.startValue, newConfig.endValue]

      baseValues.value.start = newConfig.startValue
      baseValues.value.end = newConfig.endValue
    }

    const resetToDefault = () => {
      setRange(baseValues.value.start, baseValues.value.end)
    }

    return {
      config,
      rangeValue,
      currentInterval,
      handleStartValueChange,
      handleEndValueChange,
      setRange,
      updateConfig,
      resetToDefault
    }
  }
})
</script>

<style scoped>
.range-selector-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.control-panel {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.config-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.slider-section {
  margin: 30px 0;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.interval-warning {
  margin-bottom: 15px;
}

.custom-slider {
  margin: 20px 0;
}

.values-card {
  margin: 20px 0;
}

.values-display {
  display: grid;
  grid-template-columns: repeat(4, 25%);
  text-align: center;
}

.value-item {
  padding: 10px;
}

.value-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
}

.value-number {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.interval-exceed {
  color: #f56c6c;
}

.quick-actions {
  margin-top: 20px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .config-form {
    grid-template-columns: 1fr;
  }

  .values-display {
    grid-template-columns: repeat(2, 1fr);
  }

  .slider-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}

/* 自定义滑块样式 */
:deep(.el-slider__bar) {
  background-color: #409eff;
}

:deep(.el-slider__button) {
  border: 2px solid #409eff;
}

:deep(.el-slider__stop) {
  background-color: #c0c4cc;
}
</style>