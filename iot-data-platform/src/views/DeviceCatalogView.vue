<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Plus, 
  Edit, 
  Delete, 
  Search, 
  Folder, 
  FolderOpened, 
  Document,
  Remove
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElTree } from 'element-plus'
import { 
  getDeviceCatalogTree, 
  createDeviceCatalog, 
  updateDeviceCatalog, 
  deleteDeviceCatalog,
  getDevicesByCatalogId,
  addDevicesToCatalog,
  removeDeviceFromCatalog,
  moveCatalog
} from '../api'
import type { DeviceCatalog, DeviceInfo } from '../types/device-catalog'

// 树形数据
const catalogTree = ref<DeviceCatalog[]>([])
const treeRef = ref<InstanceType<typeof ElTree>>()
const loading = ref(false)
const searchQuery = ref('')

// 当前选中的节点
const currentSelectedNode = ref<DeviceCatalog | null>(null)
const currentNodeId = ref<string>('')

// 右键菜单
const contextMenuVisible = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const rightClickNode = ref<DeviceCatalog | null>(null)

// 创建/编辑目录对话框
const catalogDialogVisible = ref(false)
const catalogFormRef = ref()
const catalogForm = ref({
  id: '',
  name: '',
  parentId: null as string | null,
  description: '',
  order: 0
})
const catalogDialogLoading = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')

// 设备挂载对话框
const deviceDialogVisible = ref(false)
const deviceDialogLoading = ref(false)
const currentCatalogId = ref<string>('')
const currentCatalogName = ref('')
const devicesInCatalog = ref<DeviceInfo[]>([])
const allDevices = ref<DeviceInfo[]>([])
const selectedDeviceIds = ref<string[]>([])

// 分页
const devicePagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 获取目录树
const fetchCatalogTree = async () => {
  loading.value = true
  try {
    const response = await getDeviceCatalogTree({ 
      name: searchQuery.value 
    })
    
    if (response.data && response.data.data) {
      catalogTree.value = response.data.data || []
    }
  } catch (error: any) {
    console.error('获取目录树失败:', error)
    ElMessage.error('获取目录树失败')
  } finally {
    loading.value = false
  }
}

// 节点点击事件
const handleNodeClick = (data: DeviceCatalog) => {
  currentSelectedNode.value = data
  currentNodeId.value = data.id
}

// 节点右键事件
const handleNodeContextmenu = (event: MouseEvent, data: DeviceCatalog) => {
  event.preventDefault()
  event.stopPropagation()
  
  rightClickNode.value = data
  currentSelectedNode.value = data
  currentNodeId.value = data.id
  
  contextMenuPosition.value = {
    x: event.clientX,
    y: event.clientY
  }
  contextMenuVisible.value = true
}

// 关闭右键菜单
const closeContextMenu = () => {
  contextMenuVisible.value = false
  rightClickNode.value = null
}

// 搜索目录
const searchCatalog = () => {
  fetchCatalogTree()
}

// 创建根目录
const createRootCatalog = () => {
  dialogMode.value = 'create'
  catalogForm.value = {
    id: '',
    name: '',
    parentId: null,
    description: '',
    order: 0
  }
  catalogDialogVisible.value = true
}

// 创建子目录
const createChildCatalog = () => {
  if (!currentSelectedNode.value) {
    ElMessage.warning('请先选择一个目录')
    return
  }
  
  dialogMode.value = 'create'
  catalogForm.value = {
    id: '',
    name: '',
    parentId: currentSelectedNode.value.id,
    description: '',
    order: 0
  }
  catalogDialogVisible.value = true
  closeContextMenu()
}

// 编辑目录
const editCatalog = () => {
  if (!currentSelectedNode.value) {
    ElMessage.warning('请先选择一个目录')
    return
  }
  
  dialogMode.value = 'edit'
  catalogForm.value = {
    id: currentSelectedNode.value.id,
    name: currentSelectedNode.value.name,
    parentId: currentSelectedNode.value.parentId,
    description: currentSelectedNode.value.description || '',
    order: currentSelectedNode.value.order || 0
  }
  catalogDialogVisible.value = true
  closeContextMenu()
}

// 删除目录
const deleteCatalog = async () => {
  if (!currentSelectedNode.value) {
    ElMessage.warning('请先选择一个目录')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除目录"${currentSelectedNode.value.name}"吗？删除后其子目录和设备关联关系也将被删除，此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteDeviceCatalog(currentSelectedNode.value.id)
    ElMessage.success('删除成功')
    await fetchCatalogTree()
    currentSelectedNode.value = null
    currentNodeId.value = ''
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除目录失败:', error)
      ElMessage.error(error.response?.data?.message || '删除目录失败')
    }
  }
  closeContextMenu()
}

// 提交目录表单
const submitCatalogForm = async () => {
  if (!catalogFormRef.value) return
  
  await catalogFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    catalogDialogLoading.value = true
    try {
      if (dialogMode.value === 'create') {
        await createDeviceCatalog(catalogForm.value)
        ElMessage.success('创建目录成功')
      } else {
        await updateDeviceCatalog(catalogForm.value)
        ElMessage.success('更新目录成功')
      }
      
      catalogDialogVisible.value = false
      await fetchCatalogTree()
    } catch (error: any) {
      console.error('保存目录失败:', error)
      ElMessage.error(error.response?.data?.message || '保存目录失败')
    } finally {
      catalogDialogLoading.value = false
    }
  })
}

// 打开设备管理对话框
const openDeviceDialog = async () => {
  if (!currentSelectedNode.value) {
    ElMessage.warning('请先选择一个目录')
    return
  }
  
  currentCatalogId.value = currentSelectedNode.value.id
  currentCatalogName.value = currentSelectedNode.value.name
  devicePagination.value.currentPage = 1
  
  await loadDevicesInCatalog()
  deviceDialogVisible.value = true
  closeContextMenu()
}

// 加载目录中的设备
const loadDevicesInCatalog = async () => {
  deviceDialogLoading.value = true
  try {
    const response = await getDevicesByCatalogId(currentCatalogId.value, {
      current: devicePagination.value.currentPage,
      size: devicePagination.value.pageSize
    })
    
    if (response.data && response.data.data) {
      devicesInCatalog.value = response.data.data || []
      devicePagination.value.total = response.data.total || 0
    }
  } catch (error: any) {
    console.error('加载设备列表失败:', error)
    ElMessage.error('加载设备列表失败')
  } finally {
    deviceDialogLoading.value = false
  }
}

// 打开添加设备对话框
const openAddDeviceDialog = async () => {
  // TODO: 加载所有可用设备
  // 这里应该调用获取所有设备的接口
  allDevices.value = [
    {
      id: '1',
      name: '测试设备 1',
      sn: 'SN001',
      model: 'Model A',
      status: 'online',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      name: '测试设备 2',
      sn: 'SN002',
      model: 'Model B',
      status: 'offline',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]
  
  selectedDeviceIds.value = []
  
  // 使用自定义对话框
  deviceDialogLoading.value = true
  try {
    // 简单实现，后续可以替换为更复杂的设备选择器
    // 这里使用简单的确认框，实际应该用独立的选择器组件
    const result = await ElMessageBox.prompt(
      '请输入设备 ID，多个设备用逗号分隔',
      '添加设备',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /.+/,
        inputErrorMessage: '请输入设备 ID',
        type: 'info'
      }
    )
    
    const deviceIds = (result as any).value.split(',').map((id: any) => String(id).trim()).filter((id: string) => id)
    
    if (deviceIds.length === 0) {
      ElMessage.warning('请至少选择一个设备')
      return
    }
    
    await addDevicesToCatalog(currentCatalogId.value, deviceIds)
    ElMessage.success('添加设备成功')
    await loadDevicesInCatalog()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('添加设备失败:', error)
      ElMessage.error(error.response?.data?.message || '添加设备失败')
    }
  } finally {
    deviceDialogLoading.value = false
  }
}

// 移除设备
const removeDevice = async (deviceId: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要移除该设备吗？',
      '移除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await removeDeviceFromCatalog(currentCatalogId.value, deviceId)
    ElMessage.success('移除设备成功')
    await loadDevicesInCatalog()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('移除设备失败:', error)
      ElMessage.error(error.response?.data?.message || '移除设备失败')
    }
  }
}

// 设备分页
const handleDeviceSizeChange = (size: number) => {
  devicePagination.value.pageSize = size
  devicePagination.value.currentPage = 1
  loadDevicesInCatalog()
}

const handleDeviceCurrentChange = (current: number) => {
  devicePagination.value.currentPage = current
  loadDevicesInCatalog()
}

// 拖拽开始
const handleDragStart = () => {
  // 可以在这里设置拖拽数据
}

// 拖拽进入
const handleDragEnter = () => {
  return true
}

// 拖拽离开
const handleDragLeave = () => {
  // 无需处理
}

// 拖拽放下
const handleDrop = async (
  draggedNode: any,
  dropNode: any,
  dropType: 'before' | 'after' | 'inner'
) => {
  const draggedData = draggedNode.data as DeviceCatalog
  const dropData = dropNode.data as DeviceCatalog
  
  let newParentId: string | null
  
  if (dropType === 'inner') {
    // 放入节点内部，成为子节点
    newParentId = dropData.id
  } else if (dropType === 'before' || dropType === 'after') {
    // 放到节点之前或之后，成为兄弟节点
    newParentId = dropData.parentId
  } else {
    return
  }
  
  try {
    await moveCatalog(draggedData.id, newParentId)
    ElMessage.success('移动目录成功')
    await fetchCatalogTree()
  } catch (error: any) {
    console.error('移动目录失败:', error)
    ElMessage.error(error.response?.data?.message || '移动目录失败')
    // 移动失败，重新加载树
    await fetchCatalogTree()
  }
}



onMounted(() => {
  fetchCatalogTree()
  
  // 点击其他地方关闭右键菜单
  document.addEventListener('click', closeContextMenu)
})
</script>

<template>
  <div class="device-catalog-view">
    <div class="page-header">
      <h1 class="page-title">设备目录管理</h1>
      <div class="header-actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索目录名称"
          prefix-icon="Search"
          clearable
          style="width: 300px; margin-right: 12px;"
          @keydown.enter="searchCatalog"
        >
          <template #append>
            <el-button @click="searchCatalog">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
        <el-button type="primary" @click="createRootCatalog">
          <el-icon><Plus /></el-icon>
          创建根目录
        </el-button>
      </div>
    </div>

    <div class="catalog-container">
      <!-- 左侧目录树 -->
      <div class="catalog-tree card" v-loading="loading">
        <div class="tree-header">
          <span class="tree-title">目录结构</span>
        </div>
        
        <el-tree
          ref="treeRef"
          :data="catalogTree"
          :props="{
            label: 'name',
            children: 'children',
            disabled: 'disabled'
          }"
          node-key="id"
          default-expand-all
          :expand-on-click-node="false"
          draggable
          :allow-drop="() => true"
          @node-click="handleNodeClick"
          @node-contextmenu="handleNodeContextmenu as any"
          @drag-start="handleDragStart"
          @drag-enter="handleDragEnter"
          @drag-leave="handleDragLeave"
          @drop="handleDrop"
        >
          <template #default="{ node, data }">
            <div 
              class="catalog-node"
              :class="{ 'is-selected': currentSelectedNode?.id === data.id }"
            >
              <el-icon :size="16" style="margin-right: 8px;">
                <component :is="node.expanded ? FolderOpened : Folder" />
              </el-icon>
              <span class="catalog-node-label">{{ node.label }}</span>
              <span 
                v-if="data.deviceCount && data.deviceCount > 0"
                class="catalog-node-device-count"
              >
                ({{ data.deviceCount }}台设备)
              </span>
            </div>
          </template>
        </el-tree>
      </div>

      <!-- 右侧详情面板 -->
      <div class="catalog-detail card" v-if="currentSelectedNode">
        <div class="detail-header">
          <h2 class="detail-title">
            <el-icon :size="20" style="margin-right: 8px;">
              <FolderOpened />
            </el-icon>
            {{ currentSelectedNode.name }}
          </h2>
          <div class="detail-actions">
            <el-button 
              type="primary" 
              size="small" 
              @click="editCatalog"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              @click="openDeviceDialog"
            >
              <el-icon><Document /></el-icon>
              管理设备
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteCatalog"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
        
        <div class="detail-content">
          <el-descriptions title="目录信息" :column="1" border>
            <el-descriptions-item label="目录 ID">{{ currentSelectedNode.id }}</el-descriptions-item>
            <el-descriptions-item label="目录名称">{{ currentSelectedNode.name }}</el-descriptions-item>
            <el-descriptions-item label="父目录">
              {{ currentSelectedNode.parentId || '根目录' }}
            </el-descriptions-item>
            <el-descriptions-item label="描述">
              {{ currentSelectedNode.description || '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="设备数量">
              {{ currentSelectedNode.deviceCount || 0 }} 台
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ currentSelectedNode.createdAt }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间">
              {{ currentSelectedNode.updatedAt }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      
      <!-- 未选择时的提示 -->
      <div class="catalog-detail card empty-state" v-else>
        <el-empty description="请选择一个目录查看详情" />
      </div>
    </div>

    <!-- 右键菜单 -->
    <div
      v-if="contextMenuVisible"
      class="context-menu"
      :style="{ left: contextMenuPosition.x + 'px', top: contextMenuPosition.y + 'px' }"
    >
      <div class="context-menu-item" @click="createChildCatalog">
        <el-icon><Plus /></el-icon>
        创建子目录
      </div>
      <div class="context-menu-item" @click="editCatalog">
        <el-icon><Edit /></el-icon>
        编辑目录
      </div>
      <el-divider style="margin: 4px 0;" />
      <div class="context-menu-item" @click="openDeviceDialog">
        <el-icon><Document /></el-icon>
        管理设备
      </div>
      <el-divider style="margin: 4px 0;" />
      <div class="context-menu-item danger" @click="deleteCatalog">
        <el-icon><Delete /></el-icon>
        删除目录
      </div>
    </div>

    <!-- 创建/编辑目录对话框 -->
    <el-dialog
      v-model="catalogDialogVisible"
      :title="dialogMode === 'create' ? '创建目录' : '编辑目录'"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="catalogFormRef"
        :model="catalogForm"
        label-width="80px"
        label-position="left"
      >
        <el-form-item
          label="目录名称"
          prop="name"
          :rules="[{ required: true, message: '请输入目录名称', trigger: 'blur' }]"
        >
          <el-input v-model="catalogForm.name" placeholder="请输入目录名称" />
        </el-form-item>
        <el-form-item
          v-if="dialogMode === 'create'"
          label="父目录"
          prop="parentId"
        >
          <el-input 
            v-model="catalogForm.parentId" 
            placeholder="不填写则为根目录"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="描述"
          prop="description"
          :rules="[{ required: false }]"
        >
          <el-input
            v-model="catalogForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入目录描述"
          />
        </el-form-item>
        <el-form-item
          label="排序"
          prop="order"
        >
          <el-input-number v-model="catalogForm.order" :min="0" :max="999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="catalogDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCatalogForm" :loading="catalogDialogLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 设备管理对话框 -->
    <el-dialog
      v-model="deviceDialogVisible"
      title="设备管理"
      width="800px"
      :close-on-click-modal="false"
    >
      <p style="margin-bottom: 15px;">
        当前目录：<strong>{{ currentCatalogName }}</strong>
      </p>
      
      <div class="device-toolbar" style="margin-bottom: 16px;">
        <el-button type="primary" size="small" @click="openAddDeviceDialog">
          <el-icon><Plus /></el-icon>
          添加设备
        </el-button>
      </div>
      
      <div v-loading="deviceDialogLoading">
        <el-table
          :data="devicesInCatalog"
          style="width: 100%"
          size="small"
        >
          <el-table-column prop="name" label="设备名称" show-overflow-tooltip />
          <el-table-column prop="sn" label="设备序列号" show-overflow-tooltip />
          <el-table-column prop="model" label="型号" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tag 
                :type="row.status === 'online' ? 'success' : row.status === 'offline' ? 'info' : 'danger'"
                size="small"
              >
                {{ row.status === 'online' ? '在线' : row.status === 'offline' ? '离线' : '故障' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="添加时间" show-overflow-tooltip />
          <el-table-column label="操作" width="120" class-name="table-action-column">
            <template #default="{ row }">
              <el-button
                type="danger"
                size="small"
                @click="removeDevice(row.id)"
              >
                <el-icon><Remove /></el-icon>
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-container" style="margin-top: 16px;">
          <el-pagination
            v-model:current-page="devicePagination.currentPage"
            v-model:page-size="devicePagination.pageSize"
            :page-sizes="[5, 10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="devicePagination.total"
            @size-change="handleDeviceSizeChange"
            @current-change="handleDeviceCurrentChange"
          />
        </div>
      </div>
      
      <template #footer>
        <el-button @click="deviceDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.device-catalog-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  align-items: center;
}

.catalog-container {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 16px;
  height: calc(100vh - 220px);
}

.catalog-tree {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tree-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 8px;
}

.tree-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

:deep(.el-tree) {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

:deep(.el-tree-node__content) {
  height: auto;
  padding: 4px 0;
  border-radius: 4px;
  margin-bottom: 4px;
}

:deep(.el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

.catalog-node {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 8px;
  border-radius: 4px;
}

.catalog-node.is-selected {
  background-color: #ecf5ff;
}

.catalog-node-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  color: #303133;
}

.catalog-node-device-count {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.catalog-detail {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 16px;
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
}

.detail-actions {
  display: flex;
  gap: 8px;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 右键菜单 */
.context-menu {
  position: fixed;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 4px 0;
  z-index: 9999;
  min-width: 150px;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #303133;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: #f5f7fa;
}

.context-menu-item .el-icon {
  margin-right: 8px;
  width: 16px;
}

.context-menu-item.danger {
  color: #f56c6c;
}

.context-menu-item.danger:hover {
  background-color: #fef0f0;
}

/* 设备管理对话框 */
.device-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-dialog__body) {
  max-height: 70vh;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }
  
  .el-input {
    width: 100% !important;
  }
  
  .catalog-container {
    grid-template-columns: 1fr;
    height: auto;
  }
  
  .catalog-tree {
    max-height: 400px;
  }
}
</style>
