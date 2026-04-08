<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getAlarmList, resolveAlarm as resolveAlarmApi } from '../api/rule-engine'

type AlertLevel = 'error' | 'warning' | 'info'
type AlertStatus = 'active' | 'resolved'

interface AlertListItem {
  id: string
  deviceId: string
  deviceName: string
  title: string
  message: string
  level: AlertLevel
  rawLevel: string
  timestamp: string
  status: AlertStatus
  rawStatus: string
  ruleName: string
  triggerCount: number
}

const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')
const levelFilter = ref('all')
const alerts = ref<AlertListItem[]>([])

const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const normalizeAlarmLevel = (level?: string): AlertLevel => {
  const normalized = (level || '').toLowerCase()

  if (['critical', 'major', 'error', 'urgent', 'high'].includes(normalized)) {
    return 'error'
  }

  if (['minor', 'warning', 'warn', 'medium'].includes(normalized)) {
    return 'warning'
  }

  return 'info'
}

const normalizeAlarmStatus = (status?: string): AlertStatus => {
  const normalized = (status || '').toLowerCase()

  if (['resolved', 'closed', 'handled', 'done', 'processed'].includes(normalized)) {
    return 'resolved'
  }

  return 'active'
}

const mapAlarmRecord = (item: any): AlertListItem => ({
  id: item.id || '',
  deviceId: item.deviceId || '',
  deviceName: item.deviceName || '未关联设备',
  title: item.alarmTitle || '未命名告警',
  message: item.alarmMessage || item.alarmTitle || '-',
  level: normalizeAlarmLevel(item.alarmLevel),
  rawLevel: item.alarmLevel || '',
  timestamp: item.lastTriggerTime || item.firstTriggerTime || item.createTime || '',
  status: normalizeAlarmStatus(item.alarmStatus),
  rawStatus: item.alarmStatus || '',
  ruleName: item.ruleName || '-',
  triggerCount: Number(item.triggerCount || 0)
})

const buildAlarmQuery = () => ({
  current: pagination.value.currentPage,
  size: pagination.value.pageSize,
  keyword: searchQuery.value || undefined,
  alarmStatus: statusFilter.value === 'all' ? undefined : statusFilter.value,
  alarmLevel: levelFilter.value === 'all' ? undefined : levelFilter.value
})

const loadAlerts = async () => {
  loading.value = true
  try {
    const response = await getAlarmList(buildAlarmQuery())

    if (response.data?.code === 200) {
      const data = Array.isArray(response.data.data) ? response.data.data : []
      alerts.value = data.map(mapAlarmRecord)
      pagination.value.total = response.data.total || data.length
    } else {
      alerts.value = []
      pagination.value.total = 0
      ElMessage.error(response.data?.message || '获取告警列表失败')
    }
  } catch (error) {
    alerts.value = []
    pagination.value.total = 0
    ElMessage.error('获取告警列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAlerts()
})

const handleSizeChange = async (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  await loadAlerts()
}

const handleCurrentChange = async (current: number) => {
  pagination.value.currentPage = current
  await loadAlerts()
}

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'ACTIVE', label: '未解决' },
  { value: 'RESOLVED', label: '已解决' }
]

const levelOptions = [
  { value: 'all', label: '全部级别' },
  { value: 'CRITICAL', label: '严重' },
  { value: 'MAJOR', label: '重要' },
  { value: 'MINOR', label: '次要' },
  { value: 'WARNING', label: '提示' }
]

const getAlertLevelClass = (level: AlertLevel) => {
  switch (level) {
    case 'error':
      return 'alert-error'
    case 'warning':
      return 'alert-warning'
    case 'info':
      return 'alert-info'
    default:
      return ''
  }
}

const getAlertLevelText = (alert: AlertListItem) => {
  const normalized = (alert.rawLevel || '').toUpperCase()

  if (normalized === 'CRITICAL') return '严重'
  if (normalized === 'MAJOR') return '重要'
  if (normalized === 'MINOR') return '次要'
  if (normalized === 'WARNING') return '提示'

  if (alert.level === 'error') return '错误'
  if (alert.level === 'warning') return '警告'
  return '信息'
}

const getStatusClass = (status: AlertStatus) => {
  return status === 'active' ? 'status-active' : 'status-resolved'
}

const getStatusText = (alert: AlertListItem) => {
  const normalized = (alert.rawStatus || '').toUpperCase()

  if (normalized === 'RESOLVED') return '已解决'
  if (normalized === 'ACTIVE') return '未解决'

  return alert.status === 'active' ? '活跃' : '已解决'
}

const handleAlert = async (id: string) => {
  try {
    const response = await resolveAlarmApi(id)

    if (response.data?.code === 200) {
      ElMessage.success('告警已处理')
      await loadAlerts()
    } else {
      ElMessage.error(response.data?.message || '处理告警失败')
    }
  } catch {
    ElMessage.error('处理告警失败')
  }
}

const refreshAlerts = async () => {
  await loadAlerts()
}

const searchAlerts = async () => {
  pagination.value.currentPage = 1
  await loadAlerts()
}
</script>

<template>
  <div class="alert-management-view">
    <div class="page-header">
      <h1 class="page-title">告警管理</h1>
      <el-button type="text" class="refresh-btn" @click="refreshAlerts">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>

    <div class="list-panel" v-loading="loading">
      <div class="list-toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索设备名称、规则名称或告警信息"
          prefix-icon="Search"
          clearable
          style="width: 320px;"
          @keydown.enter="searchAlerts"
        />
        <el-select
          v-model="statusFilter"
          placeholder="全部状态"
          clearable
          style="width: 132px;"
          @change="searchAlerts"
        >
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <el-select
          v-model="levelFilter"
          placeholder="全部级别"
          clearable
          style="width: 132px;"
          @change="searchAlerts"
        >
          <el-option
            v-for="option in levelOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
        <div class="toolbar-right">
          <el-button @click="searchAlerts">搜索</el-button>
          <el-button @click="refreshAlerts">
            <el-icon><Refresh /></el-icon>刷新
          </el-button>
        </div>
      </div>
      <el-table
        :data="alerts"
        style="width: 100%"
        size="small"
        :row-style="{ height: '48px' }"
      >
        <el-table-column prop="deviceName" label="设备名称" min-width="160" show-overflow-tooltip />
        <el-table-column prop="title" label="告警标题" min-width="160" show-overflow-tooltip />
        <el-table-column prop="message" label="告警信息" min-width="220" show-overflow-tooltip />
        <el-table-column prop="ruleName" label="规则名称" min-width="140" show-overflow-tooltip />
        <el-table-column prop="level" label="告警级别" width="100" align="center">
          <template #default="{ row }">
            <span class="alert-level" :class="getAlertLevelClass(row.level)">
              {{ getAlertLevelText(row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="triggerCount" label="触发次数" width="90" align="center" />
        <el-table-column prop="timestamp" label="最近触发时间" width="180" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <span class="alert-status" :class="getStatusClass(row.status)">
              {{ getStatusText(row) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" class-name="table-action-column" width="120" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'active'"
              type="primary"
              size="small"
              @click="handleAlert(row.id)"
            >
              处理
            </el-button>
            <span v-else class="resolved-text">已处理</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="list-footer">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          prev-text="上一页"
          next-text="下一页"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-management-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.alert-level {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.alert-error {
  background-color: #fef2f2;
  color: #dc2626;
}

.alert-warning {
  background-color: #fffbeb;
  color: #d97706;
}

.alert-info {
  background-color: #eff6ff;
  color: #1668dc;
}

.alert-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #fef3c7;
  color: #b45309;
}

.status-resolved {
  background-color: #f0fdf4;
  color: #15803d;
}

.resolved-text {
  font-size: 12px;
  color: #909399;
}
</style>
