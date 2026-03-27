<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Delete, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getPermissionList, 
  addPermission as apiAddPermission, 
  deletePermission as apiDeletePermission
} from '../api'

const loading = ref(true)
const searchQuery = ref('')
const selectedPermissionIds = ref<string[]>([])

// 权限数据
const permissions = ref<any[]>([])

// 分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 新增权限对话框
const addPermissionDialogVisible = ref(false)
const addPermissionForm = ref({
  permissionName: '',
  permissionCode: '',
  description: '',
  permissionType: 'MENU'
})
const addPermissionFormRef = ref()
const addPermissionLoading = ref(false)

// 获取权限数据
const fetchPermissions = async () => {
  loading.value = true
  try {
    const response = await getPermissionList({
      current: pagination.value.currentPage,
      size: pagination.value.pageSize,
      permissionName: searchQuery.value
    })
    
    if (response.data && response.data.data) {
      permissions.value = response.data.data || []
      pagination.value.total = response.data.total || 0
    }
  } catch (error: any) {
    console.error('获取权限数据失败:', error)
    ElMessage.error('获取权限数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPermissions()
})

// 分页方法
const handleSizeChange = async (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  await fetchPermissions()
}

const handleCurrentChange = async (current: number) => {
  pagination.value.currentPage = current
  await fetchPermissions()
}

// 搜索权限
const searchPermissions = async () => {
  pagination.value.currentPage = 1
  await fetchPermissions()
}

// 选择权限
const handleSelectionChange = (selection: any[]) => {
  selectedPermissionIds.value = selection.map(item => item.id)
}

// 添加权限
const addPermission = () => {
  addPermissionForm.value = {
    permissionName: '',
    permissionCode: '',
    description: '',
    permissionType: 'MENU'
  }
  addPermissionDialogVisible.value = true
}

// 提交新增权限
const submitAddPermission = async () => {
  if (!addPermissionFormRef.value) return
  
  await addPermissionFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    addPermissionLoading.value = true
    try {
      await apiAddPermission(addPermissionForm.value)
      ElMessage.success('添加权限成功')
      addPermissionDialogVisible.value = false
      await fetchPermissions()
    } catch (error: any) {
      console.error('添加权限失败:', error)
      ElMessage.error(error.response?.data?.message || '添加权限失败')
    } finally {
      addPermissionLoading.value = false
    }
  })
}

// 删除单个权限
const deletePermission = async (id: string, permissionName: string) => {
  ElMessageBox.confirm(`确定要删除权限"${permissionName}"吗？此操作不可恢复！`, {
    title: '删除确认',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiDeletePermission(id)
      ElMessage.success('删除成功')
      await fetchPermissions()
    } catch (error: any) {
      console.error('删除权限失败:', error)
      ElMessage.error(error.response?.data?.message || '删除权限失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 批量删除权限
const batchDelete = async () => {
  if (selectedPermissionIds.value.length === 0) {
    ElMessage.warning('请选择要删除的权限')
    return
  }
  
  ElMessageBox.confirm(`确定要删除选中的 ${selectedPermissionIds.value.length} 个权限吗？此操作不可恢复！`, {
    title: '批量删除确认',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 如果没有批量删除接口，就逐个删除
      const deletePromises = selectedPermissionIds.value.map(id => apiDeletePermission(id))
      await Promise.all(deletePromises)
      
      ElMessage.success('批量删除成功')
      selectedPermissionIds.value = []
      await fetchPermissions()
    } catch (error: any) {
      console.error('批量删除失败:', error)
      ElMessage.error(error.response?.data?.message || '批量删除失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 权限类型标签
const getPermissionTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    'MENU': 'info',
    'BUTTON': 'warning',
    'API': 'success'
  }
  const textMap: Record<string, string> = {
    'MENU': '菜单',
    'BUTTON': '按钮',
    'API': '接口'
  }
  return {
    type: typeMap[type] || 'info',
    text: textMap[type] || type
  }
}
</script>

<template>
  <div class="permission-management-view">
    <div class="page-header">
      <h1 class="page-title">权限管理</h1>
    </div>

    <!-- 权限列表面板 -->
    <div class="list-panel" v-loading="loading">
      <div class="list-toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索权限名称"
          prefix-icon="Search"
          clearable
          style="width: 320px;"
          @keydown.enter="searchPermissions"
        />
        <div class="toolbar-right">
          <el-button @click="searchPermissions">搜索</el-button>
          <el-button
            type="danger"
            :disabled="selectedPermissionIds.length === 0"
            @click="batchDelete"
          >
            <el-icon><Delete /></el-icon>批量删除
          </el-button>
          <el-button type="primary" @click="addPermission">
            <el-icon><Plus /></el-icon>添加权限
          </el-button>
        </div>
      </div>
      <el-table
        :data="permissions"
        style="width: 100%"
        size="small"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="permissionName" label="权限名称" show-overflow-tooltip />
        <el-table-column prop="permissionCode" label="权限标识" show-overflow-tooltip />
        <el-table-column prop="permissionType" label="权限类型" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag :type="getPermissionTypeTag(row.permissionType).type">
              {{ getPermissionTypeTag(row.permissionType).text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" width="180" class-name="table-action-column">
          <template #default="{ row }">
            <el-button
              type="danger"
              size="small"
              class="delete-btn"
              @click="deletePermission(row.id, row.permissionName)"
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
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          prev-text="上一页"
          next-text="下一页"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 新增权限对话框 -->
    <el-dialog
      v-model="addPermissionDialogVisible"
      title="添加权限"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="addPermissionFormRef"
        :model="addPermissionForm"
        label-width="100px"
        label-position="left"
      >
        <el-form-item
          label="权限名称"
          prop="permissionName"
          :rules="[{ required: true, message: '请输入权限名称', trigger: 'blur' }]"
        >
          <el-input v-model="addPermissionForm.permissionName" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item
          label="权限标识"
          prop="permissionCode"
          :rules="[{ required: true, message: '请输入权限标识', trigger: 'blur' }]"
        >
          <el-input v-model="addPermissionForm.permissionCode" placeholder="请输入权限标识（如：user:add）" />
        </el-form-item>
        <el-form-item
          label="权限类型"
          prop="permissionType"
          :rules="[{ required: true, message: '请选择权限类型', trigger: 'change' }]"
        >
          <el-select v-model="addPermissionForm.permissionType" placeholder="请选择权限类型" style="width: 100%;">
            <el-option label="菜单" value="MENU" />
            <el-option label="按钮" value="BUTTON" />
            <el-option label="接口" value="API" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="描述"
          prop="description"
          :rules="[{ required: false }]"
        >
          <el-input
            v-model="addPermissionForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入权限描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addPermissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddPermission" :loading="addPermissionLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.permission-management-view {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}


.delete-btn {
  margin-right: 0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .search-bar {
    width: 100%;
  }

  .el-input {
    width: 100% !important;
  }
}
</style>
