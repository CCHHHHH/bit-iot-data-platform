<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDeviceStore } from '../stores/device'
import { Plus, Edit, Delete, View, Search } from '@element-plus/icons-vue'

const router = useRouter()
const deviceStore = useDeviceStore()
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref('all')

// 分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 模拟设备数据
const mockDevices = [
  {
    id: 'dev-001',
    name: '温湿度传感器-001',
    type: '温湿度传感器',
    status: 'online' as const,
    lastActive: '2026-02-04 10:30:00',
    location: '办公楼1楼',
    metrics: {
      temperature: 25.5,
      humidity: 60.2,
      pressure: 1013.2,
      battery: 85
    }
  },
  {
    id: 'dev-002',
    name: '气压传感器-001',
    type: '气压传感器',
    status: 'warning' as const,
    lastActive: '2026-02-04 09:15:00',
    location: '办公楼2楼',
    metrics: {
      temperature: 22.8,
      humidity: 55.3,
      pressure: 998.5,
      battery: 60
    }
  },
  {
    id: 'dev-003',
    name: '光照传感器-001',
    type: '光照传感器',
    status: 'online' as const,
    lastActive: '2026-02-04 08:45:00',
    location: '办公楼3楼',
    metrics: {
      temperature: 23.1,
      humidity: 58.7,
      pressure: 1010.8,
      battery: 90
    }
  },
  {
    id: 'dev-004',
    name: '烟雾传感器-001',
    type: '烟雾传感器',
    status: 'offline' as const,
    lastActive: '2026-02-04 07:20:00',
    location: '办公楼4楼',
    metrics: {
      temperature: 0,
      humidity: 0,
      pressure: 0,
      battery: 0
    }
  },
  {
    id: 'dev-005',
    name: '温湿度传感器-002',
    type: '温湿度传感器',
    status: 'online' as const,
    lastActive: '2026-02-04 10:25:00',
    location: '办公楼5楼',
    metrics: {
      temperature: 24.2,
      humidity: 56.8,
      pressure: 1012.5,
      battery: 75
    }
  }
]

onMounted(() => {
  // 模拟加载
  setTimeout(() => {
    deviceStore.setDevices(mockDevices)
    pagination.value.total = mockDevices.length
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
const paginatedDevices = computed(() => {
  const devices = deviceStore.devices
  const { currentPage, pageSize } = pagination.value
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  return devices.slice(start, end)
})

// 筛选设备逻辑预留
// const filteredDevices = ref(mockDevices)

// 状态选项
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'online', label: '在线' },
  { value: 'offline', label: '离线' },
  { value: 'warning', label: '警告' }
]

// 状态样式
const getStatusClass = (status: string) => {
  switch (status) {
    case 'online':
      return 'status-online'
    case 'offline':
      return 'status-offline'
    case 'warning':
      return 'status-warning'
    default:
      return ''
  }
}

// 状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'online':
      return '在线'
    case 'offline':
      return '离线'
    case 'warning':
      return '警告'
    default:
      return status
  }
}

// 查看设备详情
const viewDeviceDetail = (id: string) => {
  router.push(`/device/${id}`)
}

// 编辑设备
const editDevice = (id: string) => {
  // 编辑设备逻辑
  console.log('编辑设备:', id)
}

// 删除设备
const deleteDevice = (id: string) => {
  // 删除设备逻辑
  console.log('删除设备:', id)
}

// 添加设备
const addDevice = () => {
  // 添加设备逻辑
  console.log('添加设备')
}

// 搜索设备
const searchDevices = () => {
  // 搜索设备逻辑
  console.log('搜索设备:', searchQuery.value)
  // 这里可以添加实际的搜索逻辑
  // 例如：根据searchQuery过滤设备数据
}

// 处理回车搜索
const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    searchDevices()
  }
}
</script>

<template>
  <div class="device-management-view">
    <div class="page-header">
      <h1 class="page-title">设备管理</h1>
      <el-button type="primary" class="add-device-btn" @click="addDevice">
        <el-icon><Plus /></el-icon>
        添加设备
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-filter-bar">
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索设备名称或ID"
          prefix-icon="Search"
          clearable
          @keydown.enter="searchDevices"
        >
          <template #append>
            <el-button @click="searchDevices">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
      <div class="filter-box">
        <el-select
          v-model="statusFilter"
          placeholder="筛选状态"
          clearable
        >
          <el-option
            v-for="option in statusOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 设备列表 -->
    <div class="device-list card" v-loading="loading">
      <el-table
        :data="paginatedDevices"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="id" label="设备ID" width="120" />
        <el-table-column prop="name" label="设备名称" min-width="150" />
        <el-table-column prop="type" label="设备类型" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="device-status" :class="getStatusClass(row.status)">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="lastActive" label="最后活跃" width="180" />
        <el-table-column prop="location" label="位置" min-width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              class="view-btn"
              @click="viewDeviceDetail(row.id)"
            >
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button
              type="warning"
              size="small"
              class="edit-btn"
              @click="editDevice(row.id)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              class="delete-btn"
              @click="deleteDevice(row.id)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
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
.device-management-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
}

.filter-box {
  min-width: 200px;
}

.device-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.status-online {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-offline {
  background-color: #f5f7fa;
  color: #909399;
}

.status-warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.view-btn {
  margin-right: 8px;
}

.edit-btn {
  margin-right: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .search-filter-bar {
    flex-direction: column;
  }

  .search-box,
  .filter-box {
    width: 100%;
  }

  .pagination-container {
    justify-content: center;
  }
}
</style>