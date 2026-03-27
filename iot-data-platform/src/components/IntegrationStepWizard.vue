<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import * as api from '../api/device-integration'

interface Plugin {
  id: string
  pluginName: string
  pluginStatus: number
}

const props = defineProps<{ plugins: Plugin[] }>()
const emit = defineEmits<{
  (e: 'done'): void
  (e: 'cancel'): void
}>()

// ── 步骤状态 ───────────────────────────────────────────
// 步骤: 1=集成配置 2=实例参数 3=设备属性 4=设备状态 5=时序数据
const TOTAL_STEPS = 5
const currentStep = ref(1)
const stepSaved = ref<Record<number, boolean>>({ 1: false, 2: false, 3: false, 4: false, 5: false })

const stepTitles: Record<number, string> = {
  1: '集成配置',
  2: '实例参数',
  3: '设备属性',
  4: '设备状态',
  5: '时序数据'
}

const stepMappingType: Record<number, string> = {
  3: 'device_attribute',
  4: 'device_status',
  5: 'timeseries'
}

const allDone = computed(() => Object.values(stepSaved.value).every(Boolean))

const canAccessStep = (step: number): boolean => {
  if (allDone.value) return true
  if (step === 1) return true
  if (step === 2) return stepSaved.value[1]
  if (step === 3) return stepSaved.value[1] && stepSaved.value[2]
  if (step === 4 || step === 5) return stepSaved.value[1] && stepSaved.value[2] && stepSaved.value[3]
  return false
}

const goToStep = (step: number) => {
  if (!canAccessStep(step)) {
    ElMessage.warning('请先完成前面的步骤')
    return
  }
  currentStep.value = step
}

// ── 步骤 1：集成配置 ───────────────────────────────────
const step1Form = ref({ integrationName: '', pluginId: '', integrationDesc: '' })
const step1Loading = ref(false)
const integrationId = ref('')

const saveStep1 = async () => {
  if (!step1Form.value.integrationName.trim()) {
    ElMessage.warning('请输入集成实例名称')
    return
  }
  if (!step1Form.value.pluginId) {
    ElMessage.warning('请选择插件')
    return
  }
  step1Loading.value = true
  try {
    const resp = await api.addIntegration({
      integrationName: step1Form.value.integrationName,
      pluginId: step1Form.value.pluginId,
      integrationDesc: step1Form.value.integrationDesc
    })
    if (resp.data?.code === 200) {
      integrationId.value = resp.data.data || ''
      stepSaved.value[1] = true
      ElMessage.success('集成配置已保存')
      currentStep.value = 2
    } else {
      ElMessage.error(resp.data?.message || '保存失败')
    }
  } catch {
    ElMessage.error('保存失败，请检查网络')
  } finally {
    step1Loading.value = false
  }
}

// ── 步骤 2：实例参数 ───────────────────────────────────
interface ParamItem {
  key: string
  label: string
  value: string
  required: boolean
  placeholder: string
}

// 测试数据：模拟从插件读取的配置参数
const mockParamsByPlugin: Record<string, ParamItem[]> = {
  default: [
    { key: 'host',           label: '服务器地址',  value: '',             required: true,  placeholder: '例：192.168.1.100' },
    { key: 'port',           label: '端口号',      value: '1883',         required: true,  placeholder: '例：1883' },
    { key: 'username',       label: '用户名',      value: '',             required: false, placeholder: '连接用户名（选填）' },
    { key: 'password',       label: '密码',        value: '',             required: false, placeholder: '连接密码（选填）' },
    { key: 'topic',          label: '订阅主题',    value: '#',            required: true,  placeholder: '例：/devices/#' },
    { key: 'clientId',       label: '客户端 ID',   value: 'iot-client-001', required: false, placeholder: '客户端唯一标识' },
    { key: 'keepAlive',      label: '心跳间隔(s)', value: '60',           required: false, placeholder: '秒，默认 60' },
    { key: 'connectTimeout', label: '连接超时(s)', value: '30',           required: false, placeholder: '秒，默认 30' },
  ]
}

const instanceParams = ref<ParamItem[]>([])
const step2Saved = ref(false)

// 当选择插件后，加载对应参数模板
watch(() => step1Form.value.pluginId, (pluginId) => {
  const template = mockParamsByPlugin[pluginId] ?? mockParamsByPlugin['default']
  instanceParams.value = template.map(p => ({ ...p }))
})

const saveStep2 = () => {
  const missing = instanceParams.value.filter(p => p.required && !p.value.trim())
  if (missing.length) {
    ElMessage.warning(`请填写必填参数：${missing.map(p => p.label).join('、')}`)
    return
  }
  stepSaved.value[2] = true
  step2Saved.value = true
  ElMessage.success('实例参数已保存')
  currentStep.value = 3
}

// ── 步骤 3-5：数据对接 ─────────────────────────────────
interface MappingStep {
  methodName: string
  schedulerTime: number
  schedulerUnit: string
  invokeResult: any
  invokeLoading: boolean
  saveLoading: boolean
}

const mappings = ref<Record<string, MappingStep>>({
  device_attribute: { methodName: '', schedulerTime: 30, schedulerUnit: 's', invokeResult: null, invokeLoading: false, saveLoading: false },
  device_status:    { methodName: '', schedulerTime: 30, schedulerUnit: 's', invokeResult: null, invokeLoading: false, saveLoading: false },
  timeseries:       { methodName: '', schedulerTime: 30, schedulerUnit: 's', invokeResult: null, invokeLoading: false, saveLoading: false },
})

const currentMappingType = computed(() => stepMappingType[currentStep.value] ?? '')
const currentMapping = computed<MappingStep | null>(() =>
  currentMappingType.value ? mappings.value[currentMappingType.value] : null
)

const invokeResultStr = computed(() => {
  const r = currentMapping.value?.invokeResult
  if (r === null || r === undefined) return ''
  return typeof r === 'string' ? r : JSON.stringify(r, null, 2)
})

const invokeMethod = async () => {
  const m = currentMapping.value!
  if (!m.methodName.trim()) {
    ElMessage.warning('请输入方法名')
    return
  }
  m.invokeLoading = true
  m.invokeResult = null
  try {
    const resp = await api.invokePlugin(step1Form.value.pluginId, m.methodName, [])
    if (resp.data?.code === 200) {
      m.invokeResult = resp.data.data
      ElMessage.success('调用成功')
    } else {
      ElMessage.error(resp.data?.message || '调用失败')
    }
  } catch {
    ElMessage.error('调用失败')
  } finally {
    m.invokeLoading = false
  }
}

const saveMappingStep = async () => {
  const step = currentStep.value
  const m = currentMapping.value!
  m.saveLoading = true
  try {
    const payload: any = {
      integrationId: integrationId.value,
      mappingType: currentMappingType.value,
      sourceData: m.invokeResult != null ? JSON.stringify(m.invokeResult) : '',
      schedulerTime: m.schedulerTime,
      schedulerUnit: m.schedulerUnit
    }
    const resp = await api.addDataMapping(payload)
    if (resp.data?.code === 200) {
      stepSaved.value[step] = true
      ElMessage.success('保存成功')
      if (step === 3 && !stepSaved.value[4]) {
        currentStep.value = 4
      } else if (step === 4 && !stepSaved.value[5]) {
        currentStep.value = 5
      }
    } else {
      ElMessage.error(resp.data?.message || '保存失败')
    }
  } catch {
    ElMessage.error('保存失败')
  } finally {
    m.saveLoading = false
  }
}
</script>

<template>
  <div class="wizard">
    <!-- 步骤指示器 -->
    <div class="step-nav">
      <template v-for="step in TOTAL_STEPS" :key="step">
        <div
          class="step-item"
          :class="{
            'is-active': currentStep === step,
            'is-done': stepSaved[step],
            'is-locked': !canAccessStep(step)
          }"
          @click="goToStep(step)"
        >
          <div class="step-circle">
            <el-icon v-if="stepSaved[step]" :size="14"><Check /></el-icon>
            <span v-else>{{ step }}</span>
          </div>
          <span class="step-label">{{ stepTitles[step] }}</span>
        </div>
        <div v-if="step < TOTAL_STEPS" class="step-line" :class="{ 'is-done': stepSaved[step] }" />
      </template>
    </div>

    <!-- 步骤内容 -->
    <div class="step-body">

      <!-- ── 步骤 1：集成配置 ── -->
      <div v-if="currentStep === 1" class="step-panel">
        <el-form :model="step1Form" label-width="110px" label-position="left">
          <el-form-item label="集成实例名称" required>
            <el-input
              v-model="step1Form.integrationName"
              placeholder="请输入集成实例名称"
              :disabled="stepSaved[1]"
            />
          </el-form-item>
          <el-form-item label="选择插件" required>
            <el-select
              v-model="step1Form.pluginId"
              placeholder="请选择插件"
              style="width: 100%"
              :disabled="stepSaved[1]"
            >
              <el-option
                v-for="p in plugins"
                :key="p.id"
                :label="p.pluginName"
                :value="p.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="实例描述">
            <el-input
              v-model="step1Form.integrationDesc"
              type="textarea"
              :rows="3"
              placeholder="请输入集成实例描述（选填）"
              :disabled="stepSaved[1]"
            />
          </el-form-item>
        </el-form>
        <div v-if="stepSaved[1]" class="saved-hint">
          <el-alert type="success" :closable="false" show-icon title="集成配置已保存，可修改后重新保存" />
        </div>
      </div>

      <!-- ── 步骤 2：实例参数 ── -->
      <div v-else-if="currentStep === 2" class="step-panel">
        <div class="params-desc">
          以下参数从插件配置中读取，<strong>参数名</strong>不可修改，请填写对应的参数值。
        </div>
        <div class="params-table">
          <div class="params-header">
            <span class="col-key">参数名</span>
            <span class="col-label">说明</span>
            <span class="col-value">参数值</span>
          </div>
          <div
            v-for="param in instanceParams"
            :key="param.key"
            class="params-row"
          >
            <span class="col-key">
              <code>{{ param.key }}</code>
              <el-tag v-if="param.required" type="danger" size="small" class="required-tag">必填</el-tag>
            </span>
            <span class="col-label">{{ param.label }}</span>
            <span class="col-value">
              <el-input
                v-model="param.value"
                :placeholder="param.placeholder"
                size="small"
                clearable
              />
            </span>
          </div>
          <div v-if="instanceParams.length === 0" class="params-empty">
            <el-empty description="该插件无配置参数" :image-size="60" />
          </div>
        </div>
        <div v-if="stepSaved[2]" class="saved-hint">
          <el-alert type="success" :closable="false" show-icon title="实例参数已保存，可修改后重新保存" />
        </div>
      </div>

      <!-- ── 步骤 3-5：数据对接 ── -->
      <div v-else-if="currentMapping" class="step-panel">
        <div class="scheduler-row">
          <span class="scheduler-label">同步周期</span>
          <el-input-number
            v-model="currentMapping.schedulerTime"
            :min="1"
            :max="9999"
            controls-position="right"
            style="width: 120px"
          />
          <el-select v-model="currentMapping.schedulerUnit" style="width: 80px">
            <el-option label="秒" value="s" />
            <el-option label="分" value="m" />
            <el-option label="时" value="h" />
          </el-select>
          <span class="scheduler-suffix">执行一次</span>
        </div>

        <div class="invoke-row">
          <el-input
            v-model="currentMapping.methodName"
            placeholder="请输入插件方法名"
            style="flex: 1"
            clearable
          />
          <el-button
            type="primary"
            :loading="currentMapping.invokeLoading"
            @click="invokeMethod"
          >
            调用
          </el-button>
        </div>

        <div class="json-panel">
          <div class="json-header">
            <span>返回数据</span>
            <el-tag v-if="currentMapping.invokeResult !== null" type="success" size="small">已获取</el-tag>
          </div>
          <div class="json-content">
            <pre v-if="invokeResultStr">{{ invokeResultStr }}</pre>
            <div v-else class="json-empty">暂无数据，请先输入方法名并点击「调用」</div>
          </div>
        </div>

        <div v-if="stepSaved[currentStep]" class="saved-hint">
          <el-alert type="success" :closable="false" show-icon title="当前步骤已保存，可重新调用并保存" />
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="step-footer">
      <div class="footer-left">
        <el-button @click="emit('cancel')">取消</el-button>
      </div>
      <div class="footer-right">
        <!-- 步骤 1 -->
        <template v-if="currentStep === 1">
          <el-button type="primary" :loading="step1Loading" @click="saveStep1">
            {{ stepSaved[1] ? '重新保存' : '保存并进入下一步' }}
          </el-button>
          <el-button v-if="stepSaved[1]" @click="goToStep(2)">下一步</el-button>
        </template>

        <!-- 步骤 2 -->
        <template v-else-if="currentStep === 2">
          <el-button @click="goToStep(1)">上一步</el-button>
          <el-button type="primary" @click="saveStep2">
            {{ stepSaved[2] ? '重新保存' : '保存并进入下一步' }}
          </el-button>
          <el-button v-if="stepSaved[2]" @click="goToStep(3)">下一步</el-button>
        </template>

        <!-- 步骤 3 -->
        <template v-else-if="currentStep === 3">
          <el-button @click="goToStep(2)">上一步</el-button>
          <el-button
            type="primary"
            :loading="currentMapping?.saveLoading"
            @click="saveMappingStep"
          >
            {{ stepSaved[3] ? '重新保存' : '保存' }}
          </el-button>
          <el-button v-if="stepSaved[3]" @click="goToStep(4)">下一步</el-button>
        </template>

        <!-- 步骤 4 -->
        <template v-else-if="currentStep === 4">
          <el-button @click="goToStep(3)">上一步</el-button>
          <el-button @click="goToStep(5)">切换到步骤 5</el-button>
          <el-button
            type="primary"
            :loading="currentMapping?.saveLoading"
            @click="saveMappingStep"
          >
            {{ stepSaved[4] ? '重新保存' : '保存' }}
          </el-button>
        </template>

        <!-- 步骤 5 -->
        <template v-else-if="currentStep === 5">
          <el-button @click="goToStep(3)">上一步</el-button>
          <el-button @click="goToStep(4)">切换到步骤 4</el-button>
          <el-button
            type="primary"
            :loading="currentMapping?.saveLoading"
            @click="saveMappingStep"
          >
            {{ stepSaved[5] ? '重新保存' : '保存' }}
          </el-button>
        </template>

        <!-- 全部完成后显示「完成」 -->
        <el-button v-if="allDone" type="success" @click="emit('done')">完成</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wizard {
  display: flex;
  flex-direction: column;
  min-height: 520px;
}

/* ── 步骤指示器 ── */
.step-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  background: #fff;
  flex-shrink: 0;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.step-item.is-locked {
  cursor: not-allowed;
  opacity: 0.4;
}

.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #909399;
  background: #fff;
  transition: all 0.25s;
  flex-shrink: 0;
}

.step-item.is-active .step-circle {
  border-color: var(--el-color-primary, #409eff);
  background: var(--el-color-primary, #409eff);
  color: #fff;
}

.step-item.is-done .step-circle {
  border-color: var(--el-color-success, #67c23a);
  background: var(--el-color-success, #67c23a);
  color: #fff;
}

.step-label {
  font-size: 13px;
  color: #606266;
}

.step-item.is-active .step-label {
  color: var(--el-color-primary, #409eff);
  font-weight: 600;
}

.step-item.is-done .step-label {
  color: var(--el-color-success, #67c23a);
}

.step-line {
  flex: 1;
  height: 2px;
  background: #e4e7ed;
  margin: 0 8px;
  min-width: 24px;
  max-width: 56px;
  transition: background 0.25s;
}

.step-line.is-done {
  background: var(--el-color-success, #67c23a);
}

/* ── 步骤内容区 ── */
.step-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
  background: #f5f7fa;
}

.step-panel {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.saved-hint {
  margin-top: 4px;
}

/* ── 步骤 2：实例参数 ── */
.params-desc {
  font-size: 13px;
  color: #606266;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 8px;
  padding: 12px 16px;
  line-height: 1.6;
}

.params-table {
  background: #fff;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 8px;
  overflow: hidden;
}

.params-header {
  display: grid;
  grid-template-columns: 180px 1fr 220px;
  padding: 10px 16px;
  background: #fafafa;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.params-row {
  display: grid;
  grid-template-columns: 180px 1fr 220px;
  padding: 10px 16px;
  border-bottom: 1px solid #f5f5f5;
  align-items: center;
  gap: 8px;
  transition: background 0.15s;
}

.params-row:last-child {
  border-bottom: none;
}

.params-row:hover {
  background: #fafafa;
}

.col-key {
  display: flex;
  align-items: center;
  gap: 6px;
}

.col-key code {
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 13px;
  color: #e6a23c;
  background: #fdf6ec;
  padding: 1px 6px;
  border-radius: 3px;
}

.required-tag {
  flex-shrink: 0;
}

.col-label {
  font-size: 13px;
  color: #606266;
}

.col-value {
  font-size: 13px;
}

.params-empty {
  padding: 24px;
  display: flex;
  justify-content: center;
}

/* ── 定时周期 ── */
.scheduler-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 8px;
  padding: 14px 16px;
}

.scheduler-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
}

.scheduler-suffix {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

/* ── 调用行 ── */
.invoke-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* ── JSON 展示 ── */
.json-panel {
  background: #fff;
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 8px;
  overflow: hidden;
}

.json-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter, #ebeef5);
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  background: #fafafa;
}

.json-content {
  min-height: 160px;
  max-height: 260px;
  overflow: auto;
}

.json-content pre {
  margin: 0;
  padding: 14px 16px;
  font-size: 13px;
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
  color: #2c3e50;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}

.json-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  color: #c0c4cc;
  font-size: 14px;
}

/* ── 底部 ── */
.step-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
  background: #fff;
  flex-shrink: 0;
}

.footer-right {
  display: flex;
  gap: 10px;
}
</style>
