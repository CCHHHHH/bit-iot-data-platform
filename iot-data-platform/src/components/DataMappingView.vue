<script setup lang="ts">
import { ref } from 'vue'
import { Delete, Plus, CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Props
interface Props {
  modelValue?: any
}

withDefaults(defineProps<Props>(), {
  modelValue: () => ({})
})

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

// 状态
const mappingMode = ref<'json' | 'js'>('json')
const thirdPartyData = ref<any>({
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

const mappingConfigs = ref<any[]>([
  {
    sourceKey: 'deviceName',
    targetKey: 'display_name',
    matchType: 'fuzzy',
    defaultValue: '',
    dataType: 'string',
    transformType: 'none'
  },
  {
    sourceKey: 'status',
    targetKey: 'status',
    matchType: 'fuzzy',
    defaultValue: '',
    dataType: 'string',
    transformType: 'none'
  },
  {
    sourceKey: 'deviceTagOriginal',
    targetKey: 'third_id',
    matchType: 'fuzzy',
    defaultValue: '',
    dataType: 'string',
    transformType: 'none'
  },
  {
    sourceKey: 'runningStatus',
    targetKey: 'runningStatus',
    matchType: 'fuzzy',
    defaultValue: '',
    dataType: 'string',
    transformType: 'convert_online_status'
  },
  {
    sourceKey: 'deviceTagOriginal',
    targetKey: 'serial_number',
    matchType: 'fuzzy',
    defaultValue: '',
    dataType: 'string',
    transformType: 'none'
  },
  {
    sourceKey: 'deviceTagOriginal',
    targetKey: 'show_third_id',
    matchType: 'fuzzy',
    defaultValue: '',
    dataType: 'string',
    transformType: 'none'
  }
])

const scheduleTime = ref(0)
const scheduleUnit = ref<'second' | 'minute' | 'hour'>('second')

// 数据类型选项
const dataTypeOptions = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数字' },
  { value: 'boolean', label: '布尔' },
  { value: 'date', label: '日期' }
]

// 匹配类型选项
const matchTypeOptions = [
  { value: 'exact', label: '精确匹配' },
  { value: 'fuzzy', label: '模糊匹配' }
]

// 转换类型选项
const transformTypeOptions = [
  { value: 'none', label: '不处理' },
  { value: 'uppercase', label: '转大写' },
  { value: 'lowercase', label: '转小写' },
  { value: 'trim', label: '去除空格' },
  { value: 'convert_online_status', label: '转换设备在线状态' },
  { value: 'custom', label: '自定义' }
]

// 方法
const addMapping = () => {
  mappingConfigs.value.push({
    sourceKey: '',
    targetKey: '',
    matchType: 'fuzzy',
    defaultValue: '',
    dataType: 'string',
    transformType: 'none'
  })
}

const removeMapping = (index: number) => {
  mappingConfigs.value.splice(index, 1)
}

const copyMapping = (index: number) => {
  const config = mappingConfigs.value[index]
  mappingConfigs.value.splice(index + 1, 0, { ...config })
  ElMessage.success('复制成功')
}

emit('update:modelValue', {
  mappingConfigs: mappingConfigs.value,
  scheduleTime: scheduleTime.value,
  scheduleUnit: scheduleUnit.value,
  mappingMode: mappingMode.value
})
</script>

<template>
  <div class="data-mapping-view">
    <!-- 数据映射区域 -->
    <div class="mapping-container">
      <!-- 左侧：第三方原始数据 -->
      <div class="data-panel left-panel">
        <div class="panel-header">
          <span class="panel-title">第三方原始数据</span>
        </div>
        <div class="data-content">
          <pre class="data-json">{{ JSON.stringify(thirdPartyData, null, 2) }}</pre>
        </div>
      </div>

      <!-- 中间：映射配置表格 -->
      <div class="mapping-panel">
        <div class="panel-header">
          <span class="panel-title">配置映射关系 (平台标准数据)</span>
        </div>
        <div class="mapping-content">
          <el-table :data="mappingConfigs" border style="width: 100%;" size="small">
            <el-table-column label="源字段" width="180">
              <template #default="{ row }">
                <div class="mapping-input">
                  <el-tag size="small" class="source-key">{{ row.sourceKey }}</el-tag>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="目标字段" width="200">
              <template #default="{ row }">
                <div class="mapping-input">
                  <el-input
                    v-model="row.targetKey"
                    size="small"
                    placeholder="请输入目标字段"
                  >
                    <template #prefix>
                      <el-tag size="small" type="success">{{ row.targetKey }}</el-tag>
                    </template>
                  </el-input>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="匹配方式" width="120">
              <template #default="{ row }">
                <el-select v-model="row.matchType" size="small" style="width: 100px;">
                  <el-option
                    v-for="opt in matchTypeOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="默认值" width="120">
              <template #default="{ row }">
                <el-select v-model="row.defaultValue" size="small" placeholder="默认值" style="width: 100px;" clearable>
                  <el-option label="默认值" value="default" />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="数据类型" width="100">
              <template #default="{ row }">
                <el-select v-model="row.dataType" size="small" style="width: 80px;">
                  <el-option
                    v-for="opt in dataTypeOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="转换方式" width="180">
              <template #default="{ row }">
                <el-select v-model="row.transformType" size="small" style="width: 160px;">
                  <el-option
                    v-for="opt in transformTypeOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ $index }">
                <div class="action-buttons">
                  <el-button
                    type="danger"
                    size="small"
                    :icon="Delete"
                    circle
                    @click="removeMapping($index)"
                  />
                  <el-button
                    type="primary"
                    size="small"
                    :icon="CopyDocument"
                    circle
                    @click="copyMapping($index)"
                  />
                </div>
              </template>
            </el-table-column>
          </el-table>

          <div class="add-mapping-btn">
            <el-button type="primary" size="small" :icon="Plus" @click="addMapping">
              添加 key
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-mapping-view {
  padding: 20px;
  background: #f5f5f5;
  min-height: 100%;
}

/* 顶部工具栏 */
.top-toolbar {
  background: #fff;
  padding: 16px 20px;
  border-radius: 4px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 24px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
  min-width: 80px;
}

.required {
  color: #f56c6c;
  margin-right: 2px;
}

.schedule-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-tip {
  font-size: 12px;
  color: #f56c6c;
  margin-left: 8px;
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

/* 数据映射容器 */
.mapping-container {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.data-panel,
.mapping-panel {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.left-panel {
  width: 400px;
  flex-shrink: 0;
}

.mapping-panel {
  flex: 1;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.data-content {
  padding: 16px;
  max-height: 600px;
  overflow: auto;
}

.data-json {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;
  color: #606266;
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.mapping-content {
  padding: 16px;
}

.mapping-input {
  display: flex;
  align-items: center;
}

.source-key {
  background: #f0f9ff;
  color: #409eff;
  border: 1px dashed #409eff;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.add-mapping-btn {
  margin-top: 12px;
  text-align: left;
}

/* 底部工具栏 */
.bottom-toolbar {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
