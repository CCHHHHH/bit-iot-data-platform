<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Edit, Delete, RefreshRight, Upload, VideoPlay, VideoPause, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Tab切换状态
const activeTab = ref('plugins')

// 模拟插件数据
const mockPlugins = [
  {
    id: 'plugin-001',
    name: 'MQTT插件',
    version: '1.0.0',
    description: 'MQTT协议设备接入插件',
    fileSize: '2.5MB',
    status: 'active',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: 'plugin-002',
    name: 'REST API插件',
    version: '1.2.0',
    description: 'RESTful API设备接入插件',
    fileSize: '1.8MB',
    status: 'active',
    createdAt: '2026-02-01 10:30:00',
    updatedAt: '2026-02-01 10:30:00'
  },
  {
    id: 'plugin-003',
    name: 'WebSocket插件',
    version: '0.9.0',
    description: 'WebSocket设备接入插件',
    fileSize: '3.2MB',
    status: 'inactive',
    createdAt: '2026-02-01 11:00:00',
    updatedAt: '2026-02-01 11:00:00'
  }
]

// 模拟集成数据
const mockIntegrations = [
  {
    id: 'int-001',
    name: 'MQTT Broker',
    pluginId: 'plugin-001',
    pluginName: 'MQTT插件',
    type: 'mqtt',
    description: 'MQTT消息代理',
    endpoint: 'mqtt://broker.example.com:1883',
    status: 'connected',
    config: {
      host: 'broker.example.com',
      port: 1883,
      username: 'admin',
      password: '******'
    },
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: 'int-002',
    name: 'REST API',
    pluginId: 'plugin-002',
    pluginName: 'REST API插件',
    type: 'rest',
    description: 'RESTful API集成',
    endpoint: 'https://api.example.com/v1',
    status: 'connected',
    config: {
      url: 'https://api.example.com/v1',
      apiKey: '******',
      timeout: 30000
    },
    createdAt: '2026-02-01 10:30:00',
    updatedAt: '2026-02-01 10:30:00'
  },
  {
    id: 'int-003',
    name: 'WebSocket',
    pluginId: 'plugin-003',
    pluginName: 'WebSocket插件',
    type: 'websocket',
    description: 'WebSocket连接',
    endpoint: 'ws://socket.example.com:8080',
    status: 'disconnected',
    config: {
      url: 'ws://socket.example.com:8080',
      reconnect: true,
      interval: 5000
    },
    createdAt: '2026-02-01 11:00:00',
    updatedAt: '2026-02-01 11:00:00'
  }
]

const plugins = ref(mockPlugins)
const integrations = ref(mockIntegrations)
const loading = ref({
  plugins: true,
  integrations: true
})
const searchQuery = ref({
  plugins: '',
  integrations: ''
})

// 分页状态
const pluginPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: mockPlugins.length
})

const integrationPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: mockIntegrations.length
})

onMounted(() => {
  // 模拟加载
  setTimeout(() => {
    loading.value.plugins = false
    loading.value.integrations = false
  }, 1000)
})

// 插件管理功能
const uploadPlugin = () => {
  // 上传插件逻辑
  console.log('上传插件')
  ElMessage.info('上传插件功能开发中')
}

const updatePlugin = (id: string) => {
  // 更新插件逻辑
  console.log('更新插件:', id)
  ElMessage.info(`更新插件: ${id}`)
}

const deletePlugin = (id: string) => {
  // 删除插件逻辑
  console.log('删除插件:', id)
  ElMessageBox.confirm('确定要删除该插件吗？', {
    title: '删除确认',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    // 执行删除操作
    const index = plugins.value.findIndex(plugin => plugin.id === id)
    if (index !== -1) {
      plugins.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
    ElMessage.info('已取消删除')
  })
}

const togglePluginStatus = (id: string) => {
  // 切换插件状态逻辑
  console.log('切换插件状态:', id)
  const plugin = plugins.value.find(p => p.id === id)
  if (plugin) {
    plugin.status = plugin.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(`插件已${plugin.status === 'active' ? '启用' : '禁用'}`)
  }
}

// 集成管理功能
const addIntegration = () => {
  // 添加集成逻辑
  console.log('添加集成')
  ElMessage.info('添加集成功能开发中')
}

const editIntegration = (id: string) => {
  // 编辑集成逻辑
  console.log('编辑集成:', id)
  ElMessage.info(`编辑集成: ${id}`)
}

const deleteIntegration = (id: string) => {
  // 删除集成逻辑
  console.log('删除集成:', id)
  ElMessageBox.confirm('确定要删除该集成吗？', {
    title: '删除确认',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    // 执行删除操作
    const index = integrations.value.findIndex(integration => integration.id === id)
    if (index !== -1) {
      integrations.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
    ElMessage.info('已取消删除')
  })
}

const testConnection = (id: string) => {
  // 测试连接逻辑
  console.log('测试连接:', id)
  const integration = integrations.value.find(int => int.id === id)
  if (integration) {
    // 模拟连接测试
    const loading = ElMessage({
      message: '正在测试连接...',
      duration: 0,
      showClose: false
    })
    setTimeout(() => {
      // 随机模拟连接结果
      const isConnected = Math.random() > 0.3
      integration.status = isConnected ? 'connected' : 'disconnected'
      loading.close()
      ElMessage.success(`连接测试${isConnected ? '成功' : '失败'}`)
    }, 1500)
  }
}

const startIntegration = (id: string) => {
  // 启动集成逻辑
  console.log('启动集成:', id)
  const integration = integrations.value.find(int => int.id === id)
  if (integration) {
    integration.status = 'connected'
    ElMessage.success('集成已启动')
  }
}

const stopIntegration = (id: string) => {
  // 停止集成逻辑
  console.log('停止集成:', id)
  const integration = integrations.value.find(int => int.id === id)
  if (integration) {
    integration.status = 'disconnected'
    ElMessage.success('集成已停止')
  }
}

// 分页方法
const handlePluginSizeChange = (size: number) => {
  pluginPagination.value.pageSize = size
  pluginPagination.value.currentPage = 1
}

const handlePluginCurrentChange = (current: number) => {
  pluginPagination.value.currentPage = current
}

const handleIntegrationSizeChange = (size: number) => {
  integrationPagination.value.pageSize = size
  integrationPagination.value.currentPage = 1
}

const handleIntegrationCurrentChange = (current: number) => {
  integrationPagination.value.currentPage = current
}

// 计算分页后的数据
const getPaginatedPlugins = () => {
  const { currentPage, pageSize } = pluginPagination.value
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  return plugins.value.slice(start, end)
}

const getPaginatedIntegrations = () => {
  const { currentPage, pageSize } = integrationPagination.value
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  return integrations.value.slice(start, end)
}

// 状态样式
const getStatusClass = (status: string) => {
  switch (status) {
    case 'connected':
    case 'active':
      return 'status-active'
    case 'disconnected':
    case 'inactive':
      return 'status-inactive'
    default:
      return 'status-unknown'
  }
}

// 状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'connected':
    case 'active':
      return '已启用'
    case 'disconnected':
    case 'inactive':
      return '已禁用'
    default:
      return '未知'
  }
}

// 搜索插件
const searchPlugins = () => {
  // 搜索插件逻辑
  console.log('搜索插件:', searchQuery.value)
  // 这里可以添加实际的搜索逻辑
}

// 搜索集成
const searchIntegrations = () => {
  // 搜索集成逻辑
  console.log('搜索集成:', searchQuery.value)
  // 这里可以添加实际的搜索逻辑
}
</script>

<template>
  <div class="device-integration-view">
    <div class="page-header">
      <h1 class="page-title">设备集成</h1>
    </div>

    <!-- Tab切换 -->
    <el-tabs v-model="activeTab" class="integration-tabs" style="margin-bottom: 24px;padding-left: 16px;padding-right: 16px;">
      <el-tab-pane label="插件管理" name="plugins">
        <div class="tab-header">
          <div class="search-bar">
            <el-input
              v-model="searchQuery.plugins"
              placeholder="搜索插件名称或版本"
              clearable
              style="width: 400px;"
              @keydown.enter="searchPlugins"
            >
              <template #append>
                <el-button @click="searchPlugins">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
          <el-button type="primary" class="upload-plugin-btn" @click="uploadPlugin">
            <el-icon><Upload /></el-icon>
            上传插件
          </el-button>
        </div>

        <!-- 插件列表 -->
        <div class="plugin-list card" v-loading="loading.plugins">
          <el-table
            :data="getPaginatedPlugins()"
            style="width: 100%"
            size="small"
            :row-style="{ height: '48px' }"
          >
            <el-table-column prop="name" label="插件名称" />
            <el-table-column prop="version" label="版本" />
            <el-table-column prop="description" label="插件描述" />
            <el-table-column prop="fileSize" label="文件大小" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <span class="plugin-status" :class="getStatusClass(row.status)">
                  {{ getStatusText(row.status) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" />
            <el-table-column label="操作" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  class="toggle-btn"
                  @click="togglePluginStatus(row.id)"
                >
                  <el-icon v-if="row.status === 'active'">
                    <VideoPause />
                  </el-icon>
                  <el-icon v-else>
                    <VideoPlay />
                  </el-icon>
                  {{ row.status === 'active' ? '禁用' : '启用' }}
                </el-button>
                <el-button
                  type="warning"
                  size="small"
                  class="update-btn"
                  @click="updatePlugin(row.id)"
                >
                  <el-icon><Upload /></el-icon>
                  更新
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  class="delete-btn"
                  @click="deletePlugin(row.id)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="pluginPagination.currentPage"
              v-model:page-size="pluginPagination.pageSize"
              :page-sizes="[5, 10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="pluginPagination.total"
              prev-text="上一页"
              next-text="下一页"
              @size-change="handlePluginSizeChange"
              @current-change="handlePluginCurrentChange"
            />
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="集成管理" name="integrations">
        <div class="tab-header">
          <div class="search-bar">
            <el-input
              v-model="searchQuery.integrations"
              placeholder="搜索集成名称或类型"
              clearable
              style="width: 400px;"
              @keydown.enter="searchIntegrations"
            >
              <template #append>
                <el-button @click="searchIntegrations">
                  <el-icon><Search /></el-icon>
                </el-button>
              </template>
            </el-input>
          </div>
          <el-button type="primary" class="add-integration-btn" @click="addIntegration">
            <el-icon><Plus /></el-icon>
            添加集成
          </el-button>
        </div>

        <!-- 集成列表 -->
        <div class="integration-list card" v-loading="loading.integrations">
          <el-table
            :data="getPaginatedIntegrations()"
            style="width: 100%"
            size="small"
            :row-style="{ height: '48px' }"
          >
            <el-table-column prop="name" label="集成名称" />
            <el-table-column prop="pluginName" label="绑定插件" />
            <el-table-column prop="type" label="集成类型" />
            <el-table-column prop="description" label="集成描述" />
            <el-table-column prop="endpoint" label="端点地址" />
            <el-table-column prop="status" label="状态">
              <template #default="{ row }">
                <span class="integration-status" :class="getStatusClass(row.status)">
                  {{ getStatusText(row.status) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" />
            <el-table-column label="操作" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  class="test-btn"
                  @click="testConnection(row.id)"
                >
                  <el-icon><RefreshRight /></el-icon>
                  测试连接
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  class="start-btn"
                  v-if="row.status === 'disconnected'"
                  @click="startIntegration(row.id)"
                >
                  <el-icon><VideoPlay /></el-icon>
                  启动
                </el-button>
                <el-button
                  type="warning"
                  size="small"
                  class="stop-btn"
                  v-else
                  @click="stopIntegration(row.id)"
                >
                  <el-icon><VideoPause /></el-icon>
                  停止
                </el-button>
                <el-button
                  type="info"
                  size="small"
                  class="edit-btn"
                  @click="editIntegration(row.id)"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  class="delete-btn"
                  @click="deleteIntegration(row.id)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="integrationPagination.currentPage"
              v-model:page-size="integrationPagination.pageSize"
              :page-sizes="[5, 10, 20, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              :total="integrationPagination.total"
              prev-text="上一页"
              next-text="下一页"
              @size-change="handleIntegrationSizeChange"
              @current-change="handleIntegrationCurrentChange"
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.device-integration-view {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

/* Tab样式 */
.integration-tabs {
  background-color: var(--background-white);
  border-radius: 10px;
  box-shadow: var(--card-shadow);
  padding: 0;
  overflow: hidden;
  margin-top: 24px;
}

.integration-tabs .el-tabs__header {
  border-bottom: 1px solid var(--border-color);
  background-color: var(--background-white);
}

.integration-tabs .el-tabs__nav {
  margin: 0;
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
}

.integration-tabs .el-tabs__item {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
  padding: 0 28px;
  height: 48px;
  line-height: 48px;
  margin-right: 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.integration-tabs .el-tabs__item:hover {
  color: var(--primary-color);
  background-color: rgba(0, 102, 204, 0.05);
}

.integration-tabs .el-tabs__item.is-active {
  color: var(--primary-color);
  font-weight: 600;
  background-color: rgba(0, 102, 204, 0.1);
}

.integration-tabs .el-tabs__active-bar {
  background-color: var(--primary-color);
  height: 3px;
  border-radius: 3px;
  bottom: 1px;
}

.integration-tabs .el-tabs__content {
  padding: 32px;
}

/* Tab内容样式 */
.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 0px;
}

.search-bar {
  margin-bottom: 0;
}

.search-bar .el-input {
  width: 400px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.search-bar .el-input:focus-within {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
}

.upload-plugin-btn,
.add-integration-btn {
  border-radius: 8px;
  font-weight: 500;
  padding: 10px 20px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.upload-plugin-btn:hover,
.add-integration-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

/* 插件管理样式 */
.plugin-list {
  margin-top: 16px;
  padding: 5 16px;
}

/* 集成管理样式 */
.integration-list {
  margin-top: 16px;
  padding: 5 16px;
}

/* 表格样式 */
.el-table {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.el-table th {
  font-weight: 600;
  font-size: 14px;
  padding: 16px;
  background-color: #f8fafc;
  border-bottom: 1px solid var(--border-color);
}

.el-table td {
  padding: 16px;
  font-size: 14px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
}

.el-table .cell {
  white-space: normal;
  word-break: break-word;
}

/* 操作列样式 */
.el-table-column--fixed-right {
  right: 0;
  z-index: 10;
}

.el-table-column--fixed-right .el-table__cell {
  background-color: var(--background-white);
}

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
  padding: 0 16px;
}

/* 响应式表格 */
@media (max-width: 1200px) {
  .integration-tabs .el-tabs__content {
    padding: 24px;
  }
  
  .tab-header {
    padding: 0 12px;
    margin-bottom: 24px;
  }
  
  .search-bar .el-input {
    width: 300px;
  }
  
  .plugin-list,
  .integration-list {
    padding: 0 12px;
    margin-top: 24px;
  }
  
  .el-table {
    font-size: 13px;
  }
  
  .el-table th,
  .el-table td {
    padding: 12px;
  }
  
  .el-button--small {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  .el-button--small .el-icon {
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .tab-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 0 16px;
  }
  
  .search-bar .el-input {
    width: 100%;
  }
  
  .plugin-list,
  .integration-list {
    padding: 0 16px;
  }
}

.plugin-status {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.integration-status {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

/* 状态样式 */
.status-active {
  background-color: rgba(0, 179, 134, 0.1) !important;
  color: var(--success-color) !important;
}

.status-inactive {
  background-color: rgba(144, 147, 153, 0.1) !important;
  color: #909399 !important;
}

/* 按钮样式 */
.upload-plugin-btn,
.add-integration-btn {
  border-radius: 8px;
  font-weight: 500;
}

.test-btn,
.toggle-btn,
.start-btn,
.stop-btn,
.edit-btn,
.update-btn {
  margin-right: 8px;
  border-radius: 6px;
}

.delete-btn {
  border-radius: 6px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .tab-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .search-bar {
    width: 100%;
  }

  .el-input {
    width: 100% !important;
  }

  .integration-tabs .el-tabs__item {
    padding: 0 16px;
    margin-right: 8px;
  }

  .integration-tabs .el-tabs__content {
    padding: 16px;
  }

  .plugin-list,
  .integration-list {
    margin-top: 16px;
  }

  /* 表格操作按钮响应式 */
  .el-table-column--fixed-right {
    width: auto !important;
  }

  .el-button--small {
    padding: 4px 8px !important;
    font-size: 12px !important;
  }

  .el-button--small .el-icon {
    font-size: 12px !important;
  }
}
</style>