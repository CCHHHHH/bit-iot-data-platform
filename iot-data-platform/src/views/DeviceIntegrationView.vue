<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { Plus, Edit, Delete, RefreshRight, Upload, Search, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, genFileId } from 'element-plus'
import type { UploadFile, UploadFiles, UploadInstance, UploadRawFile, UploadUserFile } from 'element-plus'
import IntegrationStepWizard from '../components/IntegrationStepWizard.vue'
import * as deviceIntegrationApi from '../api/device-integration'

// Tab 切换状态
const activeTab = ref('plugins')

// 插件数据
const plugins = ref<any[]>([])
const pluginLoading = ref(false)
const pluginSearchQuery = ref('')

// 集成数据
const integrations = ref<any[]>([])
const integrationLoading = ref(false)
const integrationSearchQuery = ref('')

// 分页状态
const pluginPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const integrationPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 加载插件列表
const loadPlugins = async () => {
  try {
    pluginLoading.value = true
    const response = await deviceIntegrationApi.getPluginList({
      current: pluginPagination.value.currentPage,
      size: pluginPagination.value.pageSize,
      pluginName: pluginSearchQuery.value
    })
    
    console.log('插件列表响应:', response)
    
    if (response.data && response.data.code === 200) {
      const data = response.data.data
      if (Array.isArray(data)) {
        plugins.value = data
        pluginPagination.value.total = data.length
      } else if (data && Array.isArray(data.records)) {
        plugins.value = data.records
        pluginPagination.value.total = data.total || data.records.length
      }
      console.log('插件数据:', plugins.value)
    } else {
      ElMessage.error(response.data?.message || '获取插件列表失败')
    }
  } catch (error) {
    console.error('加载插件列表失败:', error)
    ElMessage.error('加载插件列表失败')
  } finally {
    pluginLoading.value = false
  }
}

// 加载集成列表
const loadIntegrations = async () => {
  try {
    integrationLoading.value = true
    const response = await deviceIntegrationApi.getIntegrationList({
      current: integrationPagination.value.currentPage,
      size: integrationPagination.value.pageSize,
      integrationName: integrationSearchQuery.value
    })
    
    console.log('集成列表响应:', response)
    
    if (response.data && response.data.code === 200) {
      const data = response.data.data
      if (Array.isArray(data)) {
        integrations.value = data
        integrationPagination.value.total = data.length
      } else if (data && Array.isArray(data.records)) {
        integrations.value = data.records
        integrationPagination.value.total = data.total || data.records.length
      }
      console.log('集成数据:', integrations.value)
    } else {
      ElMessage.error(response.data?.message || '获取集成列表失败')
    }
  } catch (error) {
    console.error('加载集成列表失败:', error)
    ElMessage.error('加载集成列表失败')
  } finally {
    integrationLoading.value = false
  }
}

// 分页方法
const handlePluginSizeChange = (size: number) => {
  pluginPagination.value.pageSize = size
  pluginPagination.value.currentPage = 1
  loadPlugins()
}

const handlePluginCurrentChange = (current: number) => {
  pluginPagination.value.currentPage = current
  loadPlugins()
}

const handleIntegrationSizeChange = (size: number) => {
  integrationPagination.value.pageSize = size
  integrationPagination.value.currentPage = 1
  loadIntegrations()
}

const handleIntegrationCurrentChange = (current: number) => {
  integrationPagination.value.currentPage = current
  loadIntegrations()
}

// 搜索方法
const searchPlugins = () => {
  pluginPagination.value.currentPage = 1
  loadPlugins()
}

const searchIntegrations = () => {
  integrationPagination.value.currentPage = 1
  loadIntegrations()
}

onMounted(async () => {
  await loadPlugins()
  await loadIntegrations()
})

// ========== 插件管理功能 ==========

// 上传插件对话框
const uploadDialogVisible = ref(false)
const uploadFileRef = ref<UploadInstance>()
const uploadForm = ref({ pluginName: '', pluginType: '', description: '' })
const uploadLoading = ref(false)
const uploadFileList = ref<UploadUserFile[]>([])

// 打开上传对话框
const openUploadDialog = () => {
  uploadForm.value = { pluginName: '', pluginType: '', description: '' }
  uploadFileList.value = []
  uploadDialogVisible.value = true
  nextTick(() => {
    uploadFileRef.value?.clearFiles()
  })
}

const handleFileChange = (file: UploadFile, files: UploadFiles) => {
  uploadFileList.value = files.slice(-1)

  if (!uploadForm.value.pluginType && file.name) {
    const suffix = file.name.split('.').pop()?.toLowerCase()
    uploadForm.value.pluginType = suffix || ''
  }

  if (!uploadForm.value.pluginName && file.name) {
    uploadForm.value.pluginName = file.name.replace(/\.[^.]+$/, '')
  }
}

// 超出 limit 时用新文件替换旧文件
const handleFileExceed = (files: UploadRawFile[]) => {
  uploadFileRef.value?.clearFiles()
  const file = files[0]
  file.uid = genFileId()
  uploadFileRef.value?.handleStart(file)
  uploadFileList.value = [file]
}

// 上传插件
const handleUploadPlugin = async () => {
  try {
    const file = uploadFileList.value[0]?.raw

    if (!file) {
      ElMessage.warning('请选择要上传的插件文件')
      return
    }

    uploadLoading.value = true

    const response = await deviceIntegrationApi.uploadPlugin(file, {
      pluginName: uploadForm.value.pluginName || undefined,
      pluginType: uploadForm.value.pluginType || undefined,
      description: uploadForm.value.description || undefined
    })

    if (response.data && response.data.code === 200) {
      ElMessage.success('插件上传成功')
      uploadDialogVisible.value = false
      uploadFileList.value = []
      uploadFileRef.value?.clearFiles()
      await loadPlugins()
    } else {
      ElMessage.error(response.data?.message || '插件上传失败')
    }
  } catch (error) {
    console.error('上传插件失败:', error)
    ElMessage.error('上传插件失败')
  } finally {
    uploadLoading.value = false
  }
}

// 编辑插件对话框
const editPluginDialogVisible = ref(false)
const editPluginFormRef = ref()
const editPluginForm = ref({
  id: '',
  pluginName: '',
  pluginVersion: '',
  pluginDescription: '',
  pluginType: ''
})
const editPluginLoading = ref(false)

// 打开编辑插件对话框
const openEditPluginDialog = (row: any) => {
  editPluginForm.value = {
    id: row.id || '',
    pluginName: row.pluginName || '',
    pluginVersion: row.pluginVersion || '',
    pluginDescription: row.pluginDescription || '',
    pluginType: row.pluginType || ''
  }
  editPluginDialogVisible.value = true
}

// 保存编辑插件
const handleEditPlugin = async () => {
  try {
    editPluginLoading.value = true

    const response = await deviceIntegrationApi.updatePlugin(editPluginForm.value)

    if (response.data && response.data.code === 200) {
      ElMessage.success('插件更新成功')
      editPluginDialogVisible.value = false
      await loadPlugins()
    } else {
      ElMessage.error(response.data?.message || '插件更新失败')
    }
  } catch (error) {
    console.error('更新插件失败:', error)
    ElMessage.error('更新插件失败')
  } finally {
    editPluginLoading.value = false
  }
}

// 启用/禁用插件（pluginStatus: 1=启用, 0=禁用）
const togglePluginStatus = async (row: any) => {
  try {
    const isEnabled = row.pluginStatus === 1
    const action = isEnabled ? '禁用' : '启用'

    await ElMessageBox.confirm(`确定要${action}该插件吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const apiFunc = isEnabled
      ? deviceIntegrationApi.disablePlugin
      : deviceIntegrationApi.enablePlugin

    const response = await apiFunc(row.id)

    if (response.data && response.data.code === 200) {
      ElMessage.success(`${action}成功`)
      await loadPlugins()
    } else {
      ElMessage.error(response.data?.message || `${action}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换插件状态失败:', error)
      ElMessage.error('切换插件状态失败')
    }
  }
}

// 删除插件
const deletePlugin = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该插件吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    
    const response = await deviceIntegrationApi.deletePlugin(id)
    
    if (response.data && response.data.code === 200) {
      ElMessage.success('删除成功')
      await loadPlugins()
    } else {
      ElMessage.error(response.data?.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除插件失败:', error)
      ElMessage.error('删除插件失败')
    }
  }
}

// ========== 集成管理功能 ==========

// 新增集成向导对话框
const wizardDialogVisible = ref(false)
const wizardMode = ref<'create' | 'edit'>('create')
const editingIntegration = ref<any>(null)

const openCreateIntegration = () => {
  wizardMode.value = 'create'
  editingIntegration.value = null
  wizardDialogVisible.value = true
}

const handleWizardDone = async () => {
  wizardDialogVisible.value = false
  editingIntegration.value = null
  await loadIntegrations()
}

const openEditIntegration = (row: any) => {
  editingIntegration.value = {
    id: row.id || '',
    integrationName: row.integrationName || '',
    pluginId: row.pluginId || '',
    integrationDesc: row.integrationDesc || ''
  }
  wizardMode.value = 'edit'
  wizardDialogVisible.value = true
}

// 启动/停止集成（integrationStatus: 1=运行中, 0=已暂停）
const toggleIntegrationStatus = async (row: any) => {
  try {
    const isRunning = row.integrationStatus === 1
    const action = isRunning ? '暂停' : '启动'

    await ElMessageBox.confirm(`确定要${action}该集成吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const apiFunc = isRunning
      ? deviceIntegrationApi.stopIntegration
      : deviceIntegrationApi.startIntegration

    const response = await apiFunc(row.id)

    if (response.data && response.data.code === 200) {
      ElMessage.success(`${action}成功`)
      await loadIntegrations()
    } else {
      ElMessage.error(response.data?.message || `${action}失败`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换集成状态失败:', error)
      ElMessage.error('切换集成状态失败')
    }
  }
}

// 删除集成
const deleteIntegration = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该集成吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    
    const response = await deviceIntegrationApi.deleteIntegration(id)
    
    if (response.data && response.data.code === 200) {
      ElMessage.success('删除成功')
      await loadIntegrations()
    } else {
      ElMessage.error(response.data?.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除集成失败:', error)
      ElMessage.error('删除集成失败')
    }
  }
}

</script>

<template>
  <div class="device-integration-view">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 插件管理 -->
      <el-tab-pane label="插件管理" name="plugins">
        <div class="toolbar">
          <div class="toolbar__left">
            <el-input
              v-model="pluginSearchQuery"
              placeholder="搜索插件"
              style="width: 240px"
              clearable
              @keyup.enter="searchPlugins"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="searchPlugins">搜索</el-button>
            <el-button @click="loadPlugins">
              <el-icon><RefreshRight /></el-icon>
              刷新
            </el-button>
          </div>
          <div class="toolbar__right">
            <el-button type="primary" @click="openUploadDialog">
              <el-icon><Upload /></el-icon>
              上传插件
            </el-button>
          </div>
        </div>

        <el-table
          v-loading="pluginLoading"
          :data="plugins"
          style="width: 100%"
          border
          stripe
        >
          <el-table-column prop="pluginName" label="插件名称" show-overflow-tooltip />
          <el-table-column prop="pluginVersion" label="版本" width="100" show-overflow-tooltip />
          <el-table-column prop="pluginDescription" label="描述" show-overflow-tooltip />
          <el-table-column prop="pluginType" label="类型" width="100" show-overflow-tooltip />
          <el-table-column prop="pluginSize" label="文件大小" width="100" show-overflow-tooltip>
            <template #default="{ row }">
              {{ row.pluginSize ? (row.pluginSize / 1024).toFixed(1) + ' KB' : '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="pluginStatus" label="状态" width="90" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tag :type="row.pluginStatus === 1 ? 'success' : 'info'" size="small">
                {{ row.pluginStatus === 1 ? '已启用' : '已禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="170" show-overflow-tooltip />
          <el-table-column label="操作" fixed="right" class-name="table-action-column" width="280">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="togglePluginStatus(row)"
              >
                {{ row.pluginStatus === 1 ? '禁用' : '启用' }}
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="openEditPluginDialog(row)"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deletePlugin(row.id)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="pluginPagination.currentPage"
            v-model:page-size="pluginPagination.pageSize"
            :total="pluginPagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePluginSizeChange"
            @current-change="handlePluginCurrentChange"
          />
        </div>
      </el-tab-pane>

      <!-- 集成管理 -->
      <el-tab-pane label="集成管理" name="integrations">
        <div class="toolbar">
          <div class="toolbar__left">
            <el-input
              v-model="integrationSearchQuery"
              placeholder="搜索集成"
              style="width: 240px"
              clearable
              @keyup.enter="searchIntegrations"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="searchIntegrations">搜索</el-button>
            <el-button @click="loadIntegrations">
              <el-icon><RefreshRight /></el-icon>
              刷新
            </el-button>
          </div>
          <div class="toolbar__right">
            <el-button type="primary" @click="openCreateIntegration">
              <el-icon><Plus /></el-icon>
              新增集成
            </el-button>
          </div>
        </div>

        <el-table
          v-loading="integrationLoading"
          :data="integrations"
          style="width: 100%"
          border
          stripe
        >
          <el-table-column prop="integrationName" label="集成名称" show-overflow-tooltip />
          <el-table-column prop="pluginId" label="绑定插件" show-overflow-tooltip />
          <el-table-column prop="integrationDesc" label="描述" show-overflow-tooltip />
          <el-table-column prop="integrationStatus" label="状态" width="100" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tag :type="row.integrationStatus === 1 ? 'success' : 'info'" size="small">
                {{ row.integrationStatus === 1 ? '运行中' : '已暂停' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="170" show-overflow-tooltip />
          <el-table-column prop="updateTime" label="更新时间" width="170" show-overflow-tooltip />
          <el-table-column label="操作" fixed="right" class-name="table-action-column" width="320">
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                @click="toggleIntegrationStatus(row)"
              >
                {{ row.integrationStatus === 1 ? '暂停' : '启动' }}
              </el-button>
              <el-button
                type="primary"
                size="small"
                @click="openEditIntegration(row)"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="deleteIntegration(row.id)"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <el-pagination
            v-model:current-page="integrationPagination.currentPage"
            v-model:page-size="integrationPagination.pageSize"
            :total="integrationPagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleIntegrationSizeChange"
            @current-change="handleIntegrationCurrentChange"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 上传插件对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传插件"
      width="500px"
    >
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="插件文件" required>
          <el-upload
            ref="uploadFileRef"
            v-model:file-list="uploadFileList"
            drag
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-exceed="handleFileExceed"
            :limit="1"
            accept=".jar,.zip"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">只能上传 jar/zip 文件</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="插件名称">
          <el-input v-model="uploadForm.pluginName" placeholder="默认使用文件名" clearable />
        </el-form-item>
        <el-form-item label="插件类型">
          <el-input v-model="uploadForm.pluginType" placeholder="默认从文件扩展名获取" clearable />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="uploadForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入插件描述（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="uploadLoading" @click="handleUploadPlugin">
            上传
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑插件对话框 -->
    <el-dialog
      v-model="editPluginDialogVisible"
      title="编辑插件"
      width="500px"
    >
      <el-form ref="editPluginFormRef" :model="editPluginForm" label-width="100px">
        <el-form-item label="插件名称" prop="pluginName">
          <el-input v-model="editPluginForm.pluginName" placeholder="请输入插件名称" />
        </el-form-item>
        <el-form-item label="版本号" prop="pluginVersion">
          <el-input v-model="editPluginForm.pluginVersion" placeholder="请输入版本号" />
        </el-form-item>
        <el-form-item label="插件类型" prop="pluginType">
          <el-input v-model="editPluginForm.pluginType" placeholder="请输入插件类型" />
        </el-form-item>
        <el-form-item label="描述" prop="pluginDescription">
          <el-input
            v-model="editPluginForm.pluginDescription"
            type="textarea"
            :rows="3"
            placeholder="请输入插件描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editPluginDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="editPluginLoading" @click="handleEditPlugin">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增集成向导对话框 -->
    <el-dialog
      v-model="wizardDialogVisible"
      :title="wizardMode === 'edit' ? '编辑集成实例' : '新增集成实例'"
      width="780px"
      :close-on-click-modal="false"
      destroy-on-close
      class="wizard-dialog"
    >
      <IntegrationStepWizard
        :plugins="plugins"
        :edit-data="editingIntegration"
        @done="handleWizardDone"
        @cancel="wizardDialogVisible = false; editingIntegration = null"
      />
    </el-dialog>
  </div>
</template>

<style scoped>
.device-integration-view {
  padding: 20px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.toolbar__left,
.toolbar__right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.el-icon--upload {
  font-size: 67px;
  color: #8c939d;
  margin: 40px 0 16px;
}

:deep(.el-tabs__content) {
  padding: 16px 20px;
}

/* 向导对话框去除默认 body padding */
:deep(.wizard-dialog .el-dialog__body) {
  padding: 0;
  overflow: hidden;
}

:deep(.el-table) {
  font-size: var(--el-font-size-base);
}

:deep(.el-pagination) {
  padding: 16px 0;
}
</style>
