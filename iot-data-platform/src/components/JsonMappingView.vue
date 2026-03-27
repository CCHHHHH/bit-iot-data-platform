<script setup lang="ts">
import { ref, watch } from 'vue'
import { Clock } from '@element-plus/icons-vue'

// Props
interface Props {
  modelValue?: any[]
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  title: '数据展示'
})

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: any[]): void
}>()

// 本地映射数据
const mappings = ref<any[]>(props.modelValue || [])

// 调度配置
const scheduleEnabled = ref(true)
const scheduleInterval = ref(0)
const scheduleUnit = ref<'second' | 'minute' | 'hour'>('minute')

// 第三方原始数据
const thirdPartyData = ref({
  data: [{
    deviceName: '9#温湿度传感器',
    deviceTag: 'chuanganqi_63',
    deviceTagOriginal: '582D3484A0EA',
    deviceType: '传感器',
    manufacturer: '青萍',
    runningStatus: '在线',
    status: 'ENABLED'
  }]
})

// 监听外部数据变化
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    mappings.value = newVal
  }
}, { deep: true })

// 监听本地数据变化并同步
watch(mappings, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })
</script>

<template>
  <div class="json-mapping-view">
    <!-- 调度配置 -->
    <div class="schedule-config">
      <el-card shadow="hover" class="schedule-card">
        <template #header>
          <div class="card-header">
            <el-icon><Clock /></el-icon>
            <span>调度周期配置</span>
          </div>
        </template>
        <div class="schedule-content">
          <el-switch
            v-model="scheduleEnabled"
            active-text="启用调度"
            inactive-text="禁用调度"
          />
          <div v-if="scheduleEnabled" class="schedule-inputs">
            <span class="label">周期：</span>
            <el-input-number
              v-model="scheduleInterval"
              :min="0"
              :max="999999"
              :step="1"
              controls-position="right"
              style="width: 120px;"
              placeholder="请输入数字"
            />
            <el-select v-model="scheduleUnit" style="width: 100px;">
              <el-option label="秒" value="second" />
              <el-option label="分钟" value="minute" />
              <el-option label="小时" value="hour" />
            </el-select>
            <span class="tip">（0 代表启动时执行一次，-1 代表不自动执行）</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 第三方原始数据展示 -->
    <div class="data-panel">
      <div class="panel-header">
        <span class="panel-title">{{ title }} - 第三方原始数据</span>
      </div>
      <div class="data-content">
        <pre class="data-json">{{ JSON.stringify(thirdPartyData, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.json-mapping-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 500px;
}

/* 调度配置 */
.schedule-config {
  flex-shrink: 0;
}

.schedule-card {
  border-radius: 4px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}

.schedule-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.schedule-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.schedule-inputs .label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.schedule-inputs .tip {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

/* 数据面板 */
.data-panel {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 400px;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
  flex-shrink: 0;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.data-content {
  padding: 16px;
  overflow: auto;
  flex: 1;
  min-height: 350px;
}

/* JSON 展示 */
.data-json {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  background: #fafafa;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

/* 滚动条样式 */
.data-content::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.data-content::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.data-content::-webkit-scrollbar-track {
  background: #f5f7fa;
}
</style>
