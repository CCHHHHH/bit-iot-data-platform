<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { Refresh, Search } from '@element-plus/icons-vue'

const dashboardStore = useDashboardStore()
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')
const levelFilter = ref('all')

// 分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 模拟告警数据
const mockAlerts = [
  {
    id: '1',
    deviceId: 'dev-001',
    deviceName: '温湿度传感器-001',
    type: 'temperature',
    message: '温度超出阈值',
    level: 'error' as const,
    timestamp: '2026-02-04 10:30:00',
    status: 'active' as const
  },
  {
    id: '2',
    deviceId: 'dev-002',
    deviceName: '气压传感器-001',
    type: 'pressure',
    message: '气压异常',
    level: 'warning' as const,
    timestamp: '2026-02-04 09:15:00',
    status: 'active' as const
  },
  {
    id: '3',
    deviceId: 'dev-003',
    deviceName: '光照传感器-001',
    type: 'light',
    message: '光照强度不足',
    level: 'info' as const,
    timestamp: '2026-02-04 08:45:00',
    status: 'active' as const
  },
  {
    id: '4',
    deviceId: 'dev-004',
    deviceName: '烟雾传感器-001',
    type: 'smoke',
    message: '烟雾浓度过高',
    level: 'error' as const,
    timestamp: '2026-02-04 07:20:00',
    status: 'resolved' as const
  },
  {
    id: '5',
    deviceId: 'dev-005',
    deviceName: '温湿度传感器-002',
    type: 'humidity',
    message: '湿度异常',
    level: 'warning' as const,
    timestamp: '2026-02-04 06:50:00',
    status: 'resolved' as const
  }
]

onMounted(() => {
  // 模拟加载
  setTimeout(() => {
    dashboardStore.setAlerts(mockAlerts)
    pagination.value.total = mockAlerts.length
    loading.value = false
  }, 1000)
})

// 分页方法
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

const handleCurrentChange = (current: number) => {
  pagination.value.currentPage = current
}

// 计算分页后的数据
const paginatedAlerts = computed(() => {
  const alerts = dashboardStore.alerts
  const { currentPage, pageSize } = pagination.value
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  return alerts.slice(start, end)
})

// 状态选项
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '活跃' },
  { value: 'resolved', label: '已解决' }
]

// 级别选项
const levelOptions = [
  { value: 'all', label: '全部级别' },
  { value: 'error', label: '错误' },
  { value: 'warning', label: '警告' },
  { value: 'info', label: '信息' }
]

// 告警级别样式
const getAlertLevelClass = (level: string) => {
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

// 状态样式
const getStatusClass = (status: string) => {
  return status === 'active' ? 'status-active' : 'status-resolved'
}

// 处理告警
const handleAlert = (id: string) => {
  // 处理告警逻辑
  console.log('处理告警:', id)
  dashboardStore.resolveAlert(id)
}

// 刷新告警
const refreshAlerts = () => {
  // 刷新告警逻辑
  console.log('刷新告警')
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}

// 搜索告警
const searchAlerts = () => {
  // 搜索告警逻辑
  console.log('搜索告警:', searchQuery.value)
  // 这里可以添加实际的搜索逻辑
  // 例如：根据 searchQuery 过滤告警数据
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

    <!-- 告警列表面板 -->
    <div class="list-panel" v-loading="loading">
      <div class="list-toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索设备名称或告警信息"
          prefix-icon="Search"
          clearable
          style="width: 280px;"
          @keydown.enter="searchAlerts"
        />
        <el-select
          v-model="statusFilter"
          placeholder="全部状态"
          clearable
          style="width: 120px;"
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
          style="width: 120px;"
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
        :data="paginatedAlerts"
        style="width: 100%"
        size="small"
        :row-style="{ height: '48px' }"
      >
        <el-table-column prop="deviceName" label="设备名称" show-overflow-tooltip />
        <el-table-column prop="message" label="告警信息" show-overflow-tooltip />
        <el-table-column prop="level" label="告警级别" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="alert-level" :class="getAlertLevelClass(row.level)">
              {{ row.level === 'error' ? '错误' : row.level === 'warning' ? '警告' : '信息' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="发生时间" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="alert-status" :class="getStatusClass(row.status)">
              {{ row.status === 'active' ? '活跃' : '已解决' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" class-name="table-action-column" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'active'"
              type="primary"
              size="small"
              @click="handleAlert(row.id)"
            >
              处理
            </el-button>
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


.alert-level {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.alert-error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.alert-warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.alert-info {
  background-color: #ecf5ff;
  color: #409eff;
}

.alert-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #fef0f0;
  color: #f56c6c;
}

.status-resolved {
  background-color: #f0f9eb;
  color: #67c23a;
}

</style>