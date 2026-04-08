<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRoleList, addRole as apiAddRole, deleteRole as apiDeleteRole, getPermissionList, getRolePermissions, bindRolePermissions as bindRolePermissionsApi } from '../api'

const loading = ref(true)
const searchQuery = ref('')

// 角色数据
const roles = ref<any[]>([])

// 分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 新增角色对话框
const addRoleDialogVisible = ref(false)
const addRoleForm = ref({
  roleName: '',
  description: ''
})
const addRoleFormRef = ref()
const addRoleLoading = ref(false)

// 权限绑定对话框
const bindPermissionDialogVisible = ref(false)
const bindPermissionLoading = ref(false)
const currentRoleId = ref('')
const currentRoleName = ref('')
const currentPermissionIds = ref<string[]>([])
const allPermissions = ref<any[]>([])
const bindPermissionFormRef = ref()

const isAllSelected = computed(() =>
  allPermissions.value.length > 0 && currentPermissionIds.value.length === allPermissions.value.length
)
const isIndeterminate = computed(() =>
  currentPermissionIds.value.length > 0 && currentPermissionIds.value.length < allPermissions.value.length
)
const toggleSelectAll = (checked: boolean) => {
  currentPermissionIds.value = checked ? allPermissions.value.map((p: any) => p.id) : []
}

// 获取角色数据
const fetchRoles = async () => {
  loading.value = true
  try {
    const response = await getRoleList({
      current: pagination.value.currentPage,
      size: pagination.value.pageSize,
      roleName: searchQuery.value
    })
    
    if (response.data && response.data.data) {
      roles.value = response.data.data || []
      pagination.value.total = response.data.total || 0
    }
  } catch (error: any) {
    ElMessage.error('获取角色数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRoles()
})

// 分页方法
const handleSizeChange = async (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  await fetchRoles()
}

const handleCurrentChange = async (current: number) => {
  pagination.value.currentPage = current
  await fetchRoles()
}

// 添加角色
const addRole = () => {
  addRoleForm.value = {
    roleName: '',
    description: ''
  }
  addRoleDialogVisible.value = true
}

// 提交新增角色
const submitAddRole = async () => {
  if (!addRoleFormRef.value) return
  
  await addRoleFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    addRoleLoading.value = true
    try {
      await apiAddRole(addRoleForm.value)
      ElMessage.success('添加角色成功')
      addRoleDialogVisible.value = false
      await fetchRoles()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '添加角色失败')
    } finally {
      addRoleLoading.value = false
    }
  })
}

// 删除角色
const deleteRole = async (id: string) => {
  ElMessageBox.confirm('确定要删除该角色吗？此操作不可恢复！', {
    title: '删除确认',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await apiDeleteRole(id)
      ElMessage.success('删除成功')
      await fetchRoles()
    } catch (error: any) {
      ElMessage.error(error.response?.data?.message || '删除角色失败')
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 搜索角色
const searchRoles = async () => {
  pagination.value.currentPage = 1
  await fetchRoles()
}

// 编辑角色
const editRole = () => {
  ElMessage.info('编辑角色功能开发中')
}

// 打开权限绑定对话框
const openBindPermissions = async (roleId: string, roleName: string) => {
  currentRoleId.value = roleId
  currentRoleName.value = roleName
  
  // 获取所有权限
  try {
    const response = await getPermissionList({ current: 1, size: 100 })
    if (response.data && response.data.data) {
      allPermissions.value = response.data.data
    }
    
    // 获取角色当前权限
    const permsResponse = await getRolePermissions(roleId)
    
    if (permsResponse.data && permsResponse.data.data) {
      const rolePerms = permsResponse.data.data
      
      // 处理嵌套的权限数据结构
      if (Array.isArray(rolePerms)) {
        // 检查第一个元素是否有 permissions 字段
        if (rolePerms.length > 0 && rolePerms[0].permissions) {
          // 嵌套结构：[{ permissions: [{id: '1'}, {id: '2'}] }]
          rolePerms.forEach(role => {
            if (role.permissions && Array.isArray(role.permissions)) {
              role.permissions.forEach((perm: any) => {
                if (perm.id) {
                  currentPermissionIds.value.push(perm.id)
                }
              })
            }
          })
        } else if (rolePerms.length > 0 && typeof rolePerms[0] === 'string') {
          // 字符串数组：直接就是 ID 列表
          currentPermissionIds.value = rolePerms.filter((id: string) => id)
        } else {
          // 对象数组：提取 ID
          rolePerms.forEach((p: any) => {
            if (p.id || p.permissionId) {
              currentPermissionIds.value.push(p.id || p.permissionId)
            }
          })
        }
      }
      
      currentPermissionIds.value = currentPermissionIds.value
    } else {
      currentPermissionIds.value = []
    }
    
    bindPermissionDialogVisible.value = true
  } catch (error: any) {
    ElMessage.error('获取权限列表失败')
  }
}

// 提交权限绑定
const submitBindPermissions = async () => {
  if (!currentRoleId.value) {
    ElMessage.error('角色 ID 不能为空')
    return
  }
  
  // 确保权限 ID 列表不为空且没有 null 值
  const validPermissionIds = currentPermissionIds.value.filter(id => id != null && id !== '')
  
  if (validPermissionIds.length === 0) {
    ElMessage.warning('请至少选择一个权限')
    return
  }
  
  bindPermissionLoading.value = true
  try {
    await bindRolePermissionsApi(currentRoleId.value, validPermissionIds)
    ElMessage.success('权限绑定成功')
    bindPermissionDialogVisible.value = false
    await fetchRoles()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '绑定权限失败')
  } finally {
    bindPermissionLoading.value = false
  }
}

// 权限标签类型
const getPermissionTagType = (permissionType: string) => {
  switch (permissionType) {
    case 'MENU':
      return 'primary'
    case 'BUTTON':
      return 'warning'
    case 'API':
      return 'success'
    default:
      return ''
  }
}
</script>

<template>
  <div class="role-management-view">
    <div class="page-header">
      <h1 class="page-title">角色管理</h1>
    </div>

    <!-- 角色列表面板 -->
    <div class="list-panel" v-loading="loading">
      <div class="list-toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索角色名称"
          prefix-icon="Search"
          clearable
          style="width: 320px;"
          @keydown.enter="searchRoles"
        />
        <div class="toolbar-right">
          <el-button @click="searchRoles">搜索</el-button>
          <el-button type="primary" @click="addRole">
            <el-icon><Plus /></el-icon>添加角色
          </el-button>
        </div>
      </div>
      <el-table
        :data="roles"
        style="width: 100%"
        size="small"
      >
        <el-table-column prop="roleName" label="角色名称" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column label="权限" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="permission-tags-container">
              <el-tooltip 
                v-if="row.permissions && row.permissions.length > 0"
                placement="top"
                :disabled="row.permissions.length <= 3"
              >
                <template #content>
                  <div class="permission-tooltip">
                    <div v-for="perm in row.permissions" :key="perm.id" class="permission-tooltip-item">
                      <el-tag :type="getPermissionTagType(perm.permissionType)" size="small">
                        {{ perm.permissionName }}
                      </el-tag>
                    </div>
                  </div>
                </template>
                <div class="permission-tags">
                  <el-tag
                    v-for="(perm, index) in row.permissions"
                    :key="perm.id"
                    :type="getPermissionTagType(perm.permissionType)"
                    size="small"
                    class="permission-tag"
                    :style="{ display: index >= 3 ? 'none' : 'inline-block' }"
                  >
                    {{ perm.permissionName }}
                  </el-tag>
                  <el-tag
                    v-if="row.permissions.length > 3"
                    type="info"
                    size="small"
                    class="permission-tag-more"
                  >
                    +{{ row.permissions.length - 3 }}
                  </el-tag>
                </div>
              </el-tooltip>
              <span v-else class="no-permission">未分配权限</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" show-overflow-tooltip />
        <el-table-column prop="updateTime" label="更新时间" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" width="320" class-name="table-action-column">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              class="edit-btn"
              @click="editRole"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="success"
              size="small"
              class="bind-permission-btn"
              @click="openBindPermissions(row.id, row.roleName)"
            >
              <el-icon><Plus /></el-icon>
              权限绑定
            </el-button>
            <el-button
              type="danger"
              size="small"
              class="delete-btn"
              @click="deleteRole(row.id)"
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

    <!-- 新增角色对话框 -->
    <el-dialog
      v-model="addRoleDialogVisible"
      title="添加角色"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="addRoleFormRef"
        :model="addRoleForm"
        label-width="80px"
        label-position="left"
      >
        <el-form-item
          label="角色名称"
          prop="roleName"
          :rules="[{ required: true, message: '请输入角色名称', trigger: 'blur' }]"
        >
          <el-input v-model="addRoleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item
          label="描述"
          prop="description"
          :rules="[{ required: false }]"
        >
          <el-input
            v-model="addRoleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addRoleDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddRole" :loading="addRoleLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 权限绑定对话框 -->
    <el-dialog
      v-model="bindPermissionDialogVisible"
      title="权限绑定"
      width="600px"
      :close-on-click-modal="false"
    >
      <p style="margin-bottom: 15px;">
        当前角色：<strong>{{ currentRoleName }}</strong>
      </p>
      <el-form
        ref="bindPermissionFormRef"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="选择权限">
          <div style="width: 100%;">
            <el-checkbox
              :model-value="isAllSelected"
              :indeterminate="isIndeterminate"
              style="margin-bottom: 10px; font-weight: 500;"
              @change="toggleSelectAll"
            >全选</el-checkbox>
            <el-divider style="margin: 0 0 10px;" />
            <el-checkbox-group v-model="currentPermissionIds">
              <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                <el-checkbox
                  v-for="permission in allPermissions"
                  :key="permission.id"
                  :label="permission.permissionName"
                  :value="permission.id"
                  border
                >
                  {{ permission.permissionName }} ({{ permission.permissionCode }})
                </el-checkbox>
              </div>
            </el-checkbox-group>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bindPermissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBindPermissions" :loading="bindPermissionLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.role-management-view {
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


.edit-btn {
  margin-right: 8px;
}

.permission-tags-container {
  display: flex;
  align-items: center;
  min-height: 24px;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.permission-tag {
  cursor: pointer;
}

.permission-tag-more {
  cursor: pointer;
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
}

.no-permission {
  color: #909399;
  font-style: italic;
}

.permission-tooltip {
  max-height: 200px;
  overflow-y: auto;
}

.permission-tooltip-item {
  margin-bottom: 4px;
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
