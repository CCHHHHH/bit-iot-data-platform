<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Edit, Delete, View, Folder, FolderOpened, Bell } from '@element-plus/icons-vue'
import { ElTree, ElMessage } from 'element-plus'
import { getDeviceCatalogueTree } from '../api/device'
import { getDeviceList, getDevicesByCatalogueId } from '../api/device'
import type { DeviceCatalogue, Device } from '../types/device'
import DeviceEventDialog from '../components/DeviceEventDialog.vue'

const router = useRouter()
const loading = ref(true)
const deviceSearchQuery = ref('')
const catalogueSearchQuery = ref('')
const statusFilter = ref('all')
const treeLoading = ref(false)

// 分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 目录树相关
const catalogTree = ref<DeviceCatalogue[]>([])
const currentSelectedCatalogId = ref<string>('')
const currentSelectedCatalogName = ref<string>('')

// 设备列表
const devices = ref<Device[]>([])

// 事件对话框
const eventDialogVisible = ref(false)
const currentEventDevice = ref<any>(null)

// 模拟设备数据（用于演示，匹配真实 Device 类型）
const mockDevices: Device[] = [
  {
    id: 'dev-001',
    deviceName: '温湿度传感器 -001',
    deviceCode: 'TH-001',
    deviceType: '温湿度传感器',
    status: 'online',
    catalogueId: 'catalogue-001',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  },
  {
    id: 'dev-002',
    deviceName: '气压传感器 -001',
    deviceCode: 'BP-001',
    deviceType: '气压传感器',
    status: 'warning',
    catalogueId: 'catalogue-001',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  },
  {
    id: 'dev-003',
    deviceName: '光照传感器 -001',
    deviceCode: 'LS-001',
    deviceType: '光照传感器',
    status: 'online',
    catalogueId: 'catalogue-002',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  },
  {
    id: 'dev-004',
    deviceName: '烟雾传感器 -001',
    deviceCode: 'SM-001',
    deviceType: '烟雾传感器',
    status: 'offline',
    catalogueId: 'catalogue-002',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  },
  {
    id: 'dev-005',
    deviceName: '温湿度传感器 -002',
    deviceCode: 'TH-002',
    deviceType: '温湿度传感器',
    status: 'online',
    catalogueId: 'catalogue-003',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  }
]

onMounted(async () => {
  await fetchCatalogTree()
  // 默认加载所有设备
  await loadDevicesByCatalogId('')
})

// 获取目录树
const fetchCatalogTree = async () => {
  treeLoading.value = true
  try {
    const response = await getDeviceCatalogueTree()
    
    if (response.data && response.data.data) {
      catalogTree.value = response.data.data || []
    }
  } catch (error: any) {
    console.error('获取目录树失败:', error)
    ElMessage.error('获取目录树失败')
  } finally {
    treeLoading.value = false
  }
}

// 加载指定目录下的设备
const loadDevicesByCatalogId = async (catalogId: string) => {
  loading.value = true
  try {
    let deviceList = []
    
    if (catalogId) {
      // 加载指定目录下的设备，支持按设备名称搜索
      const response = await getDevicesByCatalogueId(catalogId, {
        deviceName: deviceSearchQuery.value || undefined
      })
      
      if (response.data && response.data.data) {
        deviceList = response.data.data || []
        pagination.value.total = response.data.total || deviceList.length
      }
    } else {
      // 加载所有设备（使用真实 API）
      const response = await getDeviceList({
        current: pagination.value.currentPage,
        size: pagination.value.pageSize,
        deviceName: deviceSearchQuery.value || undefined
      })
      
      if (response.data && response.data.data) {
        deviceList = response.data.data || []
        pagination.value.total = response.data.total || deviceList.length
      } else {
        // 如果 API 失败，使用模拟数据
        deviceList = mockDevices
        pagination.value.total = mockDevices.length
      }
    }
    
    devices.value = deviceList
  } catch (error: any) {
    console.error('加载设备列表失败:', error)
    // 使用模拟数据
    devices.value = mockDevices
    pagination.value.total = mockDevices.length
  } finally {
    loading.value = false
  }
}

// 目录树节点点击事件
const handleNodeClick = async (data: DeviceCatalogue) => {
  currentSelectedCatalogId.value = data.id
  currentSelectedCatalogName.value = data.catalogueName
  
  // 重置分页
  pagination.value.currentPage = 1
  
  // 加载该目录下的设备
  await loadDevicesByCatalogId(data.id)
}

// 分页方法
const handleSizeChange = (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

const handleCurrentChange = (current: number) => {
  pagination.value.currentPage = current
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

// 查看设备事件
const viewDeviceEvents = (device: any) => {
  currentEventDevice.value = device
  eventDialogVisible.value = true
}

// 关闭事件对话框
const closeEventDialog = () => {
  eventDialogVisible.value = false
  currentEventDevice.value = null
}

// 添加设备
const addDevice = () => {
  // 添加设备逻辑
  console.log('添加设备')
}

// 搜索设备
const searchDevices = async () => {
  console.log('搜索设备:', deviceSearchQuery.value)
  // 重置分页
  pagination.value.currentPage = 1
  // 重新加载设备
  await loadDevicesByCatalogId(currentSelectedCatalogId.value)
}

// 搜索目录
const searchCatalogues = async () => {
  console.log('搜索目录:', catalogueSearchQuery.value)
  // 这里可以添加搜索目录的逻辑
  await fetchCatalogTree()
}

// 筛选设备
const filterDevices = async () => {
  console.log('筛选设备:', statusFilter.value)
  // 重置分页
  pagination.value.currentPage = 1
  // 重新加载设备
  await loadDevicesByCatalogId(currentSelectedCatalogId.value)
}

// 状态选项
const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'online', label: '在线' },
  { value: 'offline', label: '离线' },
  { value: 'warning', label: '警告' }
]
</script>

<template>
  <div class="device-management-view">
    <div class="page-header">
      <h1 class="page-title">设备管理</h1>
    </div>

    <div class="main-container">
      <!-- 左侧目录树 -->
      <div class="sidebar card" v-loading="treeLoading">
        <div class="sidebar-header">
          <h2 class="sidebar-title">
            <el-icon :size="18"><FolderOpened /></el-icon>
            设备目录
          </h2>
        </div>
        
        <div class="tree-search">
          <el-input
            v-model="catalogueSearchQuery"
            placeholder="搜索目录"
            prefix-icon="Search"
            clearable
            size="small"
            @keydown.enter="searchCatalogues"
          />
        </div>
        
        <el-tree
          ref="treeRef"
          :data="catalogTree"
          :props="{
            label: 'catalogueName',
            children: 'children'
          }"
          node-key="id"
          default-expand-all
          highlight-current
          :expand-on-click-node="false"
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <div class="tree-node-content">
              <el-icon :size="16" style="margin-right: 8px;">
                <component :is="node.expanded ? FolderOpened : Folder" />
              </el-icon>
              <span class="tree-node-label">{{ node.label }}</span>
              <span 
                v-if="data.deviceCount && data.deviceCount > 0"
                class="tree-node-count"
              >
                ({{ data.deviceCount }})
              </span>
            </div>
          </template>
        </el-tree>
      </div>

      <!-- 右侧设备列表 -->
      <div class="content-area">
        <!-- 设备列表 -->
        <div class="list-panel" v-loading="loading">
          <div class="list-toolbar">
            <el-input
              v-model="deviceSearchQuery"
              placeholder="搜索设备名称、型号或 IP"
              prefix-icon="Search"
              clearable
              style="width: 280px;"
              @keydown.enter="searchDevices"
            />
            <el-select
              v-model="statusFilter"
              placeholder="全部状态"
              clearable
              style="width: 120px;"
              @change="filterDevices"
            >
              <el-option
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
            <div class="current-catalog-info" v-if="currentSelectedCatalogId">
              <el-tag type="info" size="small">
                当前目录：{{ currentSelectedCatalogName }}
              </el-tag>
              <el-button
                type="text"
                size="small"
                @click="loadDevicesByCatalogId('')"
              >
                清除选择
              </el-button>
            </div>
            <div class="toolbar-right">
              <el-button @click="searchDevices">搜索</el-button>
              <el-button type="primary" @click="addDevice">
                <el-icon><Plus /></el-icon>添加设备
              </el-button>
            </div>
          </div>
          <el-table
            :data="devices"
            style="width: 100%"
            size="small"
            :row-style="{ height: '48px' }"
          >
            <el-table-column prop="id" label="设备 ID" width="120" show-overflow-tooltip />
            <el-table-column prop="deviceName" label="设备名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="deviceCode" label="设备编码" width="120" show-overflow-tooltip />
            <el-table-column prop="deviceType" label="设备类型" width="120" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100" show-overflow-tooltip>
              <template #default="{ row }">
                <el-tag
                  :type="row.status === 'online' ? 'success' : row.status === 'offline' ? 'info' : 'warning'"
                  size="small"
                >
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="160" show-overflow-tooltip />
            <el-table-column label="操作" fixed="right" width="280" class-name="table-action-column">
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
                  type="info"
                  size="small"
                  class="event-btn"
                  @click="viewDeviceEvents(row)"
                >
                  <el-icon><Bell /></el-icon>
                  事件
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
    </div>
    
    <!-- 设备事件对话框 -->
    <DeviceEventDialog
      v-if="eventDialogVisible && currentEventDevice"
      :device-id="currentEventDevice.id"
      :device-name="currentEventDevice.deviceName"
      @close="closeEventDialog"
    />
  </div>
</template>

<style scoped>
.device-management-view {
  padding: 20px;
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
}


.main-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 16px;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.tree-search {
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-light);
  flex-shrink: 0;
}

:deep(.el-tree) {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

:deep(.el-tree-node__content) {
  height: auto;
  padding-top: 6px;
  padding-right: 8px;
  padding-bottom: 6px;
  border-radius: 4px;
  margin-bottom: 4px;
}

:deep(.el-tree-node__content:hover) {
  background-color: var(--color-bg-secondary);
}

:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background-color: var(--color-primary-50);
  color: var(--color-primary-500);
}

.tree-node-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.tree-node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.tree-node-count {
  font-size: 12px;
  color: var(--color-text-tertiary);
  margin-left: 8px;
}

.content-area {
  display: flex;
  flex-direction: column;
  overflow: auto;
  min-height: 0;
}

.current-catalog-info {
  display: flex;
  align-items: center;
  gap: 8px;
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
  background-color: var(--color-bg-secondary);
  color: var(--color-text-tertiary);
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

@media (max-width: 768px) {
  .device-management-view {
    height: auto;
  }

  .main-container {
    grid-template-columns: 1fr;
  }

  .sidebar {
    max-height: 300px;
  }
}
</style>
