<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { addRule, updateRule, saveDataSources, saveRuleParams, getRuleById } from '../api/rule-engine'
import { getDeviceList } from '../api/device'

const props = defineProps<{
  visible: boolean
  editData: any | null
  algorithms: any[]
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'done'): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

const currentStep = ref(0)
const ruleId = ref('')
const isReadOnly = ref(false)

// ========== Step 1: Basic Config ==========

const step1Form = ref({
  ruleName: '',
  ruleDesc: '',
  algorithmId: '',
  triggerType: 'realtime' as 'realtime' | 'periodic',
  triggerCron: '',
  windowType: 'tumbling' as 'tumbling' | 'sliding' | 'session',
  windowSize: 5,
  windowSlide: undefined as number | undefined,
  windowUnit: 'm' as 's' | 'm' | 'h' | 'd',
  keyStrategy: 'device_point' as 'device_point' | 'device',
  parallelism: 1
})
const step1FormRef = ref()
const step1Loading = ref(false)

const enabledAlgorithms = computed(() =>
  props.algorithms.filter((a) => a.algorithmStatus === 1)
)

const step1Rules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  algorithmId: [{ required: true, message: '请选择算法', trigger: 'change' }],
  triggerType: [{ required: true, message: '请选择触发类型', trigger: 'change' }],
  triggerCron: [
    {
      validator: (_rule: any, value: string, cb: Function) => {
        if (step1Form.value.triggerType === 'periodic' && !value) {
          cb(new Error('定时触发需填写 Cron 表达式'))
        } else {
          cb()
        }
      },
      trigger: 'blur'
    }
  ],
  windowType: [{ required: true, message: '请选择窗口类型', trigger: 'change' }],
  windowSize: [{ required: true, message: '请填写窗口大小', trigger: 'blur' }],
  windowUnit: [{ required: true, message: '请选择窗口单位', trigger: 'change' }],
  keyStrategy: [{ required: true, message: '请选择分组策略', trigger: 'change' }],
  parallelism: [{ required: true, message: '请填写并行度', trigger: 'blur' }]
}

// ========== Step 2: Data Sources ==========

interface DataSourceForm {
  deviceId: string
  deviceName: string
  pointCodes: string[]
  timeRangeStart: string
  timeRangeEnd: string
}

const dataSources = ref<DataSourceForm[]>([])
const step2Loading = ref(false)
const deviceOptions = ref<any[]>([])
const deviceLoading = ref(false)

const fetchDevices = async (query?: string) => {
  deviceLoading.value = true
  try {
    const res = await getDeviceList({ current: 1, size: 50, deviceName: query || undefined })
    if (res.data?.data) {
      deviceOptions.value = res.data.data.records || res.data.data || []
    }
  } catch {
    // silent
  } finally {
    deviceLoading.value = false
  }
}

const addDataSource = () => {
  dataSources.value.push({
    deviceId: '',
    deviceName: '',
    pointCodes: [],
    timeRangeStart: '',
    timeRangeEnd: ''
  })
}

const removeDataSource = (idx: number) => {
  dataSources.value.splice(idx, 1)
}

const onDeviceSelect = (idx: number, deviceId: string) => {
  const device = deviceOptions.value.find((d) => d.id === deviceId || d.deviceId === deviceId)
  if (device) {
    dataSources.value[idx].deviceName = device.deviceName || device.name || ''
  }
}

// ========== Step 3: Rule Params ==========

interface ParamRow {
  paramKey: string
  paramValue: string
  paramDesc: string
}

const ruleParams = ref<ParamRow[]>([])
const step3Loading = ref(false)

const addParam = () => {
  ruleParams.value.push({ paramKey: '', paramValue: '', paramDesc: '' })
}

const removeParam = (idx: number) => {
  ruleParams.value.splice(idx, 1)
}

// ========== Dialog Open / Reset ==========

const resetAll = () => {
  currentStep.value = 0
  ruleId.value = ''
  isReadOnly.value = false
  step1Form.value = {
    ruleName: '',
    ruleDesc: '',
    algorithmId: '',
    triggerType: 'realtime',
    triggerCron: '',
    windowType: 'tumbling',
    windowSize: 5,
    windowSlide: undefined,
    windowUnit: 'm',
    keyStrategy: 'device_point',
    parallelism: 1
  }
  dataSources.value = []
  ruleParams.value = []
}

watch(
  () => props.visible,
  async (v) => {
    if (!v) return
    resetAll()
    fetchDevices()

    if (props.editData) {
      // Load existing rule detail
      try {
        const res = await getRuleById(props.editData.id)
        const detail = res.data?.data
        if (detail) {
          const cfg = detail.ruleConfig
          ruleId.value = cfg.id
          isReadOnly.value = cfg.ruleStatus === 1

          step1Form.value = {
            ruleName: cfg.ruleName || '',
            ruleDesc: cfg.ruleDesc || '',
            algorithmId: cfg.algorithmId || '',
            triggerType: cfg.triggerType || 'realtime',
            triggerCron: cfg.triggerCron || '',
            windowType: cfg.windowType || 'tumbling',
            windowSize: cfg.windowSize || 5,
            windowSlide: cfg.windowSlide,
            windowUnit: cfg.windowUnit || 'm',
            keyStrategy: cfg.keyStrategy || 'device_point',
            parallelism: cfg.parallelism || 1
          }

          dataSources.value = (detail.dataSources || []).map((ds: any) => ({
            deviceId: ds.deviceId || '',
            deviceName: ds.deviceName || '',
            pointCodes: ds.pointCodes ? (() => { try { return JSON.parse(ds.pointCodes) } catch { return [] } })() : [],
            timeRangeStart: ds.timeRangeStart || '',
            timeRangeEnd: ds.timeRangeEnd || ''
          }))

          ruleParams.value = (detail.params || []).map((p: any) => ({
            paramKey: p.paramKey || '',
            paramValue: p.paramValue || '',
            paramDesc: p.paramDesc || ''
          }))
        }
      } catch {
        ElMessage.error('加载规则详情失败')
      }
    }
  }
)

// ========== Step Actions ==========

const handleStep1Next = async () => {
  if (!step1FormRef.value) return
  await step1FormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    step1Loading.value = true
    try {
      const payload: any = {
        ruleName: step1Form.value.ruleName,
        ruleDesc: step1Form.value.ruleDesc || undefined,
        algorithmId: step1Form.value.algorithmId,
        triggerType: step1Form.value.triggerType,
        triggerCron: step1Form.value.triggerType === 'periodic' ? step1Form.value.triggerCron : undefined,
        windowType: step1Form.value.windowType,
        windowSize: step1Form.value.windowSize,
        windowSlide: step1Form.value.windowType === 'sliding' ? step1Form.value.windowSlide : undefined,
        windowUnit: step1Form.value.windowUnit,
        keyStrategy: step1Form.value.keyStrategy,
        parallelism: step1Form.value.parallelism
      }
      if (ruleId.value) {
        payload.id = ruleId.value
        await updateRule(payload)
      } else {
        const res = await addRule(payload)
        // 后端创建接口将新 ID 放在 message 字段（data 为 null）
        ruleId.value = res.data?.message || res.data?.data || ''
      }
      currentStep.value = 1
    } catch (e: any) {
      ElMessage.error(e.response?.data?.msg || '保存基本配置失败')
    } finally {
      step1Loading.value = false
    }
  })
}

const handleStep2Next = async () => {
  // Validate device IDs
  for (let i = 0; i < dataSources.value.length; i++) {
    if (!dataSources.value[i].deviceId) {
      ElMessage.warning(`第 ${i + 1} 行数据源的设备 ID 不能为空`)
      return
    }
    const ds = dataSources.value[i]
    if ((ds.timeRangeStart && !ds.timeRangeEnd) || (!ds.timeRangeStart && ds.timeRangeEnd)) {
      ElMessage.warning(`第 ${i + 1} 行时间段须同时填写起止时间`)
      return
    }
  }

  step2Loading.value = true
  try {
    const payload = dataSources.value.map((ds) => ({
      deviceId: ds.deviceId,
      deviceName: ds.deviceName || undefined,
      pointCodes: ds.pointCodes.length > 0 ? JSON.stringify(ds.pointCodes) : undefined,
      timeRangeStart: ds.timeRangeStart || undefined,
      timeRangeEnd: ds.timeRangeEnd || undefined
    }))
    await saveDataSources(ruleId.value, payload)
    currentStep.value = 2
  } catch (e: any) {
    ElMessage.error(e.response?.data?.msg || '保存数据源失败')
  } finally {
    step2Loading.value = false
  }
}

const handleStep3Submit = async () => {
  // Validate params
  for (let i = 0; i < ruleParams.value.length; i++) {
    const p = ruleParams.value[i]
    if (!p.paramKey) {
      ElMessage.warning(`第 ${i + 1} 行参数键不能为空`)
      return
    }
    if (!p.paramValue) {
      ElMessage.warning(`第 ${i + 1} 行参数值不能为空`)
      return
    }
  }

  step3Loading.value = true
  try {
    await saveRuleParams(ruleId.value, ruleParams.value.map((p) => ({ ...p })))
    ElMessage.success('规则保存成功')
    dialogVisible.value = false
    emit('done')
  } catch (e: any) {
    ElMessage.error(e.response?.data?.msg || '保存规则参数失败')
  } finally {
    step3Loading.value = false
  }
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="editData ? '编辑规则' : '新增规则'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="isReadOnly" class="readonly-tip">
      <el-alert type="warning" :closable="false" show-icon>
        该规则当前正在运行中，请先停止规则后再编辑。
      </el-alert>
    </div>

    <el-steps :active="currentStep" align-center style="margin-bottom: 24px;">
      <el-step title="基本配置" />
      <el-step title="数据源配置" />
      <el-step title="规则参数" />
    </el-steps>

    <!-- Step 1: Basic Config -->
    <div v-show="currentStep === 0">
      <el-form
        ref="step1FormRef"
        :model="step1Form"
        :rules="step1Rules"
        label-width="100px"
        label-position="left"
        :disabled="isReadOnly"
      >
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model="step1Form.ruleName" placeholder="请输入规则名称，长度 1~64" maxlength="64" />
        </el-form-item>
        <el-form-item label="规则描述" prop="ruleDesc">
          <el-input v-model="step1Form.ruleDesc" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>
        <el-form-item label="绑定算法" prop="algorithmId">
          <el-select v-model="step1Form.algorithmId" placeholder="请选择已启用的算法" filterable style="width: 100%;">
            <el-option
              v-for="alg in enabledAlgorithms"
              :key="alg.id"
              :label="alg.algorithmName"
              :value="alg.id"
            >
              <span>{{ alg.algorithmName }}</span>
              <el-tag size="small" style="margin-left: 8px;" :type="alg.algorithmType === 'jar' ? 'primary' : 'warning'">
                {{ alg.algorithmType === 'jar' ? 'JAR' : 'Python' }}
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="触发类型" prop="triggerType">
          <el-radio-group v-model="step1Form.triggerType">
            <el-radio value="realtime">实时流处理</el-radio>
            <el-radio value="periodic">定时触发</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="step1Form.triggerType === 'periodic'" label="Cron 表达式" prop="triggerCron">
          <el-input v-model="step1Form.triggerCron" placeholder="如：0 */5 * * * ?" />
        </el-form-item>
        <el-form-item label="窗口类型" prop="windowType">
          <el-select v-model="step1Form.windowType" style="width: 100%;">
            <el-option label="滚动窗口 (Tumbling)" value="tumbling" />
            <el-option label="滑动窗口 (Sliding)" value="sliding" />
            <el-option label="会话窗口 (Session)" value="session" />
          </el-select>
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="10">
            <el-form-item label="窗口大小" prop="windowSize">
              <el-input-number v-model="step1Form.windowSize" :min="1" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="窗口单位" prop="windowUnit">
              <el-select v-model="step1Form.windowUnit" style="width: 100%;">
                <el-option label="秒" value="s" />
                <el-option label="分钟" value="m" />
                <el-option label="小时" value="h" />
                <el-option label="天" value="d" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item v-if="step1Form.windowType === 'sliding'" label="窗口步长" prop="windowSlide">
          <el-input-number v-model="step1Form.windowSlide" :min="1" :max="step1Form.windowSize - 1" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="分组策略" prop="keyStrategy">
          <el-radio-group v-model="step1Form.keyStrategy">
            <el-radio value="device_point">按设备+测点</el-radio>
            <el-radio value="device">按设备</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="并行度" prop="parallelism">
          <el-input-number v-model="step1Form.parallelism" :min="1" :max="32" style="width: 160px;" />
        </el-form-item>
      </el-form>
    </div>

    <!-- Step 2: Data Sources -->
    <div v-show="currentStep === 1">
      <div style="margin-bottom: 12px;">
        <el-button type="primary" size="small" :disabled="isReadOnly" @click="addDataSource">
          <el-icon><Plus /></el-icon>添加数据源
        </el-button>
        <span style="margin-left: 12px; font-size: 12px; color: var(--color-text-tertiary);">
          测点编码为空时，后端读取该设备全部测点
        </span>
      </div>
      <div v-for="(ds, idx) in dataSources" :key="idx" class="datasource-row">
        <div class="datasource-row-header">
          <span class="datasource-index">数据源 {{ idx + 1 }}</span>
          <el-button type="danger" size="small" link :disabled="isReadOnly" @click="removeDataSource(idx)">
            <el-icon><Delete /></el-icon>删除
          </el-button>
        </div>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="设备" label-width="60px">
              <el-select
                v-model="ds.deviceId"
                filterable
                remote
                :remote-method="fetchDevices"
                :loading="deviceLoading"
                placeholder="请选择设备"
                style="width: 100%;"
                :disabled="isReadOnly"
                @change="(val: string) => onDeviceSelect(idx, val)"
              >
                <el-option
                  v-for="dev in deviceOptions"
                  :key="dev.id || dev.deviceId"
                  :label="dev.deviceName || dev.name"
                  :value="dev.id || dev.deviceId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="测点编码" label-width="80px">
              <el-select
                v-model="ds.pointCodes"
                multiple
                filterable
                allow-create
                placeholder="输入测点编码后回车，留空表示全部"
                style="width: 100%;"
                :disabled="isReadOnly"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="起始时间" label-width="80px">
              <el-input v-model="ds.timeRangeStart" placeholder="HH:mm:ss（可选）" :disabled="isReadOnly" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间" label-width="80px">
              <el-input v-model="ds.timeRangeEnd" placeholder="HH:mm:ss（可选）" :disabled="isReadOnly" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>
      <el-empty v-if="dataSources.length === 0" description="暂无数据源，请添加" :image-size="80" />
    </div>

    <!-- Step 3: Rule Params -->
    <div v-show="currentStep === 2">
      <div style="margin-bottom: 12px;">
        <el-button type="primary" size="small" :disabled="isReadOnly" @click="addParam">
          <el-icon><Plus /></el-icon>添加参数
        </el-button>
      </div>
      <el-table :data="ruleParams" size="small" border>
        <el-table-column label="参数键" min-width="150">
          <template #default="{ row }">
            <el-input v-model="row.paramKey" placeholder="paramKey" size="small" :disabled="isReadOnly" />
          </template>
        </el-table-column>
        <el-table-column label="参数值" min-width="150">
          <template #default="{ row }">
            <el-input v-model="row.paramValue" placeholder="paramValue" size="small" :disabled="isReadOnly" />
          </template>
        </el-table-column>
        <el-table-column label="描述" min-width="160">
          <template #default="{ row }">
            <el-input v-model="row.paramDesc" placeholder="选填" size="small" :disabled="isReadOnly" />
          </template>
        </el-table-column>
        <el-table-column label="" width="60" fixed="right">
          <template #default="{ $index }">
            <el-button type="danger" size="small" link :disabled="isReadOnly" @click="removeParam($index)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="ruleParams.length === 0" description="暂无参数" :image-size="60" />
    </div>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button v-if="currentStep > 0" @click="currentStep--">上一步</el-button>
      <el-button
        v-if="currentStep === 0"
        type="primary"
        :loading="step1Loading"
        :disabled="isReadOnly"
        @click="handleStep1Next"
      >
        下一步
      </el-button>
      <el-button
        v-if="currentStep === 1"
        type="primary"
        :loading="step2Loading"
        :disabled="isReadOnly"
        @click="handleStep2Next"
      >
        下一步
      </el-button>
      <el-button
        v-if="currentStep === 2"
        type="primary"
        :loading="step3Loading"
        :disabled="isReadOnly"
        @click="handleStep3Submit"
      >
        完成
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.readonly-tip {
  margin-bottom: 16px;
}

.datasource-row {
  border: 1px solid var(--color-border-light);
  border-radius: 6px;
  padding: 12px 12px 4px;
  margin-bottom: 12px;
  background: var(--color-bg-secondary);
}

.datasource-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.datasource-index {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}
</style>
