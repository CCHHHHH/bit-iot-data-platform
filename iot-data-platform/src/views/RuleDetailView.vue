<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, CopyDocument, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getRuleById, getFlinkStatus, clearExecutionLogs, getExecutionLogs } from '../api/rule-engine'

const route = useRoute()
const router = useRouter()

const ruleId = computed(() => route.params.id as string)

// ── 规则详情 ──────────────────────────────────────
const loading = ref(false)
const detail = ref<any>(null)

const fetchDetail = async () => {
  loading.value = true
  try {
    const res = await getRuleById(ruleId.value)
    if (res.data?.code === 200) {
      detail.value = res.data.data
    } else {
      ElMessage.error(res.data?.msg || '获取规则详情失败')
    }
  } catch {
    ElMessage.error('获取规则详情失败')
  } finally {
    loading.value = false
  }
}

// ── Flink 状态轮询 ────────────────────────────────
const flinkStatus = ref<string>('')
const flinkLoading = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

const fetchFlinkStatus = async () => {
  flinkLoading.value = true
  try {
    const res = await getFlinkStatus(ruleId.value)
    if (res.data?.code === 200) {
      flinkStatus.value = res.data.data || ''
    }
  } catch {
    flinkStatus.value = 'UNKNOWN'
  } finally {
    flinkLoading.value = false
  }
}

const startPolling = () => {
  fetchFlinkStatus()
  pollTimer = setInterval(fetchFlinkStatus, 5000)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// ── 执行日志 ──────────────────────────────────────
const logLoading = ref(false)
const logs = ref<any[]>([])
const logPagination = ref({ currentPage: 1, pageSize: 10, total: 0 })
const logStatusFilter = ref<number | ''>('')
const expandedLogs = ref<Set<string>>(new Set())

const fetchLogs = async () => {
  logLoading.value = true
  try {
    const res = await getExecutionLogs({
      current: logPagination.value.currentPage,
      size: logPagination.value.pageSize,
      ruleId: ruleId.value,
      execStatus: logStatusFilter.value !== '' ? logStatusFilter.value as number : undefined
    })
    if (res.data?.code === 200) {
      logs.value = res.data.data?.records || []
      logPagination.value.total = res.data.data?.total || 0
    }
  } catch {
    ElMessage.error('获取执行日志失败')
  } finally {
    logLoading.value = false
  }
}

const handleClearLogs = async () => {
  try {
    await clearExecutionLogs(ruleId.value)
    ElMessage.success('日志已清空')
    fetchLogs()
  } catch {
    ElMessage.error('清空失败')
  }
}

const toggleLogExpand = (id: string) => {
  if (expandedLogs.value.has(id)) {
    expandedLogs.value.delete(id)
  } else {
    expandedLogs.value.add(id)
  }
}

const formatResultData = (str: string) => {
  try { return JSON.stringify(JSON.parse(str), null, 2) } catch { return str }
}

// ── helpers ───────────────────────────────────────
const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => ElMessage.success('已复制'))
}

const getTriggerLabel = (t: string) => t === 'periodic' ? '定时触发' : '实时流处理'
const getWindowLabel = (cfg: any) => {
  const typeMap: Record<string, string> = { tumbling: '滚动窗口', sliding: '滑动窗口', session: '会话窗口' }
  const unitMap: Record<string, string> = { s: '秒', m: '分钟', h: '小时', d: '天' }
  return `${typeMap[cfg.windowType] || cfg.windowType}  ${cfg.windowSize} ${unitMap[cfg.windowUnit] || cfg.windowUnit}`
}
const getKeyStrategyLabel = (s: string) => s === 'device_point' ? '按设备+测点' : '按设备'

const getFlinkStatusType = (s: string) => {
  if (s === 'RUNNING') return 'success'
  if (['FAILING', 'FAILED'].includes(s)) return 'danger'
  if (['CANCELLING', 'CANCELED', 'FINISHED'].includes(s)) return 'info'
  if (s === 'RESTARTING') return 'warning'
  return 'info'
}

const parsePointCodes = (str: string) => {
  try { return JSON.parse(str) as string[] } catch { return [] }
}

const getExecStatusInfo = (s: number) => {
  if (s === 0) return { label: '执行中', cls: 'status-pending' }
  if (s === 1) return { label: '成功',   cls: 'status-running' }
  return            { label: '失败',   cls: 'status-stopped' }
}

onMounted(async () => {
  await fetchDetail()
  startPolling()
  fetchLogs()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="rule-detail-view" v-loading="loading">
    <!-- 顶栏 -->
    <div class="detail-header">
      <el-button link @click="router.back()">
        <el-icon><ArrowLeft /></el-icon>返回
      </el-button>
      <h1 class="page-title" style="margin:0">
        {{ detail?.ruleConfig?.ruleName || '规则详情' }}
      </h1>
    </div>

    <template v-if="detail">
      <el-row :gutter="16">
        <!-- ── 基本信息 ── -->
        <el-col :span="16">
          <el-card class="detail-card" shadow="never">
            <template #header><span class="card-title">基本信息</span></template>
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="规则名称">{{ detail.ruleConfig.ruleName }}</el-descriptions-item>
              <el-descriptions-item label="算法">
                {{ detail.algorithmName }}
                <el-tag size="small" style="margin-left:6px"
                  :type="detail.algorithmType === 'jar' ? 'primary' : 'warning'">
                  {{ detail.algorithmType === 'jar' ? 'JAR' : 'Python' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="触发类型">{{ getTriggerLabel(detail.ruleConfig.triggerType) }}</el-descriptions-item>
              <el-descriptions-item v-if="detail.ruleConfig.triggerCron" label="Cron 表达式">
                <code>{{ detail.ruleConfig.triggerCron }}</code>
              </el-descriptions-item>
              <el-descriptions-item label="窗口配置">{{ getWindowLabel(detail.ruleConfig) }}</el-descriptions-item>
              <el-descriptions-item label="分组策略">{{ getKeyStrategyLabel(detail.ruleConfig.keyStrategy) }}</el-descriptions-item>
              <el-descriptions-item label="并行度">{{ detail.ruleConfig.parallelism }}</el-descriptions-item>
              <el-descriptions-item v-if="detail.ruleConfig.ruleDesc" label="描述" :span="2">
                {{ detail.ruleConfig.ruleDesc }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>

        <!-- ── 运行状态 ── -->
        <el-col :span="8">
          <el-card class="detail-card" shadow="never">
            <template #header>
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <span class="card-title">运行状态</span>
                <el-button link size="small" :loading="flinkLoading" @click="fetchFlinkStatus">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </template>
            <div class="status-panel">
              <div class="status-row">
                <span class="status-label">规则状态</span>
                <span class="status-badge" :class="detail.ruleConfig.ruleStatus === 1 ? 'status-running' : 'status-stopped'">
                  {{ detail.ruleConfig.ruleStatus === 1 ? '运行中' : '已停止' }}
                </span>
              </div>
              <div class="status-row">
                <span class="status-label">Flink 状态</span>
                <el-tag v-if="flinkStatus" :type="getFlinkStatusType(flinkStatus)" size="small">
                  {{ flinkStatus }}
                </el-tag>
                <span v-else class="muted">—</span>
              </div>
              <div v-if="detail.ruleConfig.flinkJobId" class="status-row">
                <span class="status-label">Job ID</span>
                <div style="display:flex;align-items:center;gap:4px;">
                  <code class="job-id">{{ detail.ruleConfig.flinkJobId }}</code>
                  <el-button link size="small" @click="copyText(detail.ruleConfig.flinkJobId)">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="poll-hint" v-if="detail.ruleConfig.ruleStatus === 1">
                每 5 秒自动刷新 Flink 状态
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="16" style="margin-top:16px">
        <!-- ── 数据源 ── -->
        <el-col :span="12">
          <el-card class="detail-card" shadow="never">
            <template #header><span class="card-title">数据源配置</span></template>
            <el-empty v-if="!detail.dataSources?.length" description="暂无数据源" :image-size="60" />
            <div v-for="(ds, idx) in detail.dataSources" :key="ds.id || idx" class="datasource-item">
              <div class="datasource-header">
                <span class="datasource-device">{{ ds.deviceName || ds.deviceId }}</span>
                <span class="muted" style="font-size:12px">{{ ds.deviceId }}</span>
              </div>
              <div v-if="parsePointCodes(ds.pointCodes).length" class="point-codes">
                <el-tag
                  v-for="code in parsePointCodes(ds.pointCodes)"
                  :key="code"
                  size="small"
                  style="margin:2px"
                >{{ code }}</el-tag>
              </div>
              <div v-else class="muted" style="font-size:12px">全部测点</div>
              <div v-if="ds.timeRangeStart" class="time-range">
                {{ ds.timeRangeStart }} ~ {{ ds.timeRangeEnd }}
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- ── 规则参数 ── -->
        <el-col :span="12">
          <el-card class="detail-card" shadow="never">
            <template #header><span class="card-title">规则参数</span></template>
            <el-empty v-if="!detail.params?.length" description="暂无参数" :image-size="60" />
            <el-table v-else :data="detail.params" size="small" :show-header="true">
              <el-table-column prop="paramKey" label="参数键" min-width="120" />
              <el-table-column prop="paramValue" label="参数值" min-width="120" />
              <el-table-column prop="paramDesc" label="描述" min-width="140" show-overflow-tooltip />
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <!-- ── 执行日志 ── -->
      <el-card class="detail-card" shadow="never" style="margin-top:16px">
        <template #header>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <span class="card-title">执行日志</span>
            <div style="display:flex;gap:8px;align-items:center;">
              <el-select
                v-model="logStatusFilter"
                placeholder="全部状态"
                clearable
                size="small"
                style="width:120px"
                @change="fetchLogs"
              >
                <el-option label="执行中" :value="0" />
                <el-option label="成功" :value="1" />
                <el-option label="失败" :value="2" />
              </el-select>
              <el-button size="small" @click="fetchLogs"><el-icon><Refresh /></el-icon></el-button>
              <el-button size="small" type="danger" plain @click="handleClearLogs">清空日志</el-button>
            </div>
          </div>
        </template>
        <el-table :data="logs" size="small" v-loading="logLoading">
          <el-table-column prop="startTime" label="开始时间" width="165" show-overflow-tooltip />
          <el-table-column prop="endTime" label="结束时间" width="165" show-overflow-tooltip />
          <el-table-column prop="durationMs" label="耗时(ms)" width="90" />
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <span class="status-badge" :class="getExecStatusInfo(row.execStatus).cls">
                {{ getExecStatusInfo(row.execStatus).label }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="结果/错误" min-width="200">
            <template #default="{ row }">
              <template v-if="row.execStatus === 2 && row.errorMsg">
                <span class="error-text">{{ row.errorMsg }}</span>
              </template>
              <template v-else-if="row.resultData">
                <el-button text size="small" @click="toggleLogExpand(row.id)">
                  {{ expandedLogs.has(row.id) ? '收起' : '展开结果' }}
                </el-button>
                <pre v-if="expandedLogs.has(row.id)" class="result-pre">{{ formatResultData(row.resultData) }}</pre>
              </template>
              <span v-else class="muted">—</span>
            </template>
          </el-table-column>
        </el-table>
        <div class="list-footer">
          <el-pagination
            v-model:current-page="logPagination.currentPage"
            v-model:page-size="logPagination.pageSize"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            :total="logPagination.total"
            prev-text="上一页" next-text="下一页"
            @size-change="() => fetchLogs()"
            @current-change="() => fetchLogs()"
          />
        </div>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.rule-detail-view {
  padding: 20px;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.detail-card {
  border-color: var(--color-border-light);
}

.status-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.status-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.poll-hint {
  font-size: 11px;
  color: var(--color-text-tertiary);
  text-align: center;
  margin-top: 4px;
}

.job-id {
  font-size: 11px;
  font-family: var(--font-family-mono, monospace);
  color: var(--color-text-secondary);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
}

.datasource-item {
  padding: 10px 0;
  border-bottom: 1px solid var(--color-border-light);
}
.datasource-item:last-child { border-bottom: none; }

.datasource-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.datasource-device {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.point-codes { margin-bottom: 4px; }

.time-range {
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-top: 4px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}
.status-badge::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
}
.status-running { background: var(--color-success-bg); color: var(--color-success); }
.status-stopped { background: var(--color-bg-tertiary); color: var(--color-text-tertiary); }
.status-pending { background: #EFF6FF; color: #1668DC; }

.error-text { color: var(--color-danger); font-size: 12px; }
.muted { color: var(--color-text-tertiary); }

.result-pre {
  margin: 6px 0 0;
  padding: 8px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-family: var(--font-family-mono, monospace);
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}
</style>
