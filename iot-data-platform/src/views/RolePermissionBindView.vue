<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { getRoleList, getPermissionList, bindRolePermissions, getRolePermissions } from '../api'

const loading = ref(false)
const roleListLoading = ref(false)
const permissionListLoading = ref(false)

// 角色列表
const roles = ref<any[]>([])
const selectedRoleId = ref('')

// 权限列表
const permissions = ref<any[]>([])
const selectedPermissionIds = ref<string[]>([])
const boundPermissionIds = ref<string[]>([])

// 绑定对话框
const bindDialogVisible = ref(false)
const bindLoading = ref(false)

// 获取角色列表
const fetchRoles = async () => {
  roleListLoading.value = true
  try {
    const response = await getRoleList({
      current: 1,
      size: 100
    })
    
    if (response.data && response.data.data) {
      roles.value = response.data.data || []
      if (roles.value.length > 0 && !selectedRoleId.value) {
        selectedRoleId.value = roles.value[0].id
      }
    }
  } catch (error: any) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  } finally {
    roleListLoading.value = false
  }
}

// 获取权限列表
const fetchPermissions = async () => {
  permissionListLoading.value = true
  try {
    const response = await getPermissionList({
      current: 1,
      size: 100
    })
    
    if (response.data && response.data.data) {
      permissions.value = response.data.data || []
    }
  } catch (error: any) {
    console.error('获取权限列表失败:', error)
    ElMessage.error('获取权限列表失败')
  } finally {
    permissionListLoading.value = false
  }
}

// 获取角色已绑定的权限
const fetchRolePermissions = async () => {
  if (!selectedRoleId.value) return
  
  loading.value = true
  try {
    const response = await getRolePermissions(selectedRoleId.value)
    if (response.data && response.data.data) {
      boundPermissionIds.value = response.data.data.map((p: any) => p.id)
      // 已绑定的权限默认选中
      selectedPermissionIds.value = [...boundPermissionIds.value]
    } else {
      boundPermissionIds.value = []
      selectedPermissionIds.value = []
    }
  } catch (error: any) {
    console.error('获取角色权限失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchRoles()
  await fetchPermissions()
})

// 角色变化时加载已绑定权限
const handleRoleChange = () => {
  fetchRolePermissions()
}

// 打开绑定对话框
const openBindDialog = () => {
  if (!selectedRoleId.value) {
    ElMessage.warning('请先选择一个角色')
    return
  }
  bindDialogVisible.value = true
}

// 提交绑定
const submitBind = async () => {
  if (!selectedRoleId.value) {
    ElMessage.warning('请选择角色')
    return
  }
  
  bindLoading.value = true
  try {
    await bindRolePermissions(selectedRoleId.value, selectedPermissionIds.value)
    ElMessage.success('绑定权限成功')
    bindDialogVisible.value = false
    await fetchRolePermissions()
  } catch (error: any) {
    console.error('绑定权限失败:', error)
    ElMessage.error(error.response?.data?.message || '绑定权限失败')
  } finally {
    bindLoading.value = false
  }
}

// 计算已绑定和未绑定的权限
const boundPermissions = computed(() => {
  return permissions.value.filter(p => boundPermissionIds.value.includes(p.id))
})

const unboundPermissions = computed(() => {
  return permissions.value.filter(p => !boundPermissionIds.value.includes(p.id))
})
</script>

<template>
  <div class="role-permission-bind-view">
    <h1 class="page-title">角色权限绑定</h1>
    
    <div class="card">
      <!-- 角色选择 -->
      <div class="form-section">
        <el-form label-width="100px">
          <el-form-item label="选择角色">
            <el-select
              v-model="selectedRoleId"
              placeholder="请选择角色"
              style="width: 300px;"
              @change="handleRoleChange"
            >
              <el-option
                v-for="role in roles"
                :key="role.id"
                :label="role.roleName"
                :value="role.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 权限绑定情况 -->
      <div class="permission-section" v-loading="loading">
        <div class="permission-columns">
          <!-- 已绑定权限 -->
          <div class="permission-column">
            <h3 class="column-title">已绑定权限 ({{ boundPermissions.length }})</h3>
            <el-table
              :data="boundPermissions"
              size="small"
              style="height: 400px;"
            >
              <el-table-column prop="permissionName" label="权限名称" />
              <el-table-column prop="permissionCode" label="权限标识" />
              <el-table-column prop="permissionType" label="类型" width="80">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.permissionType === 'MENU' ? 'info' : 'warning'">
                    {{ row.permissionType }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
          
          <!-- 未绑定权限 -->
          <div class="permission-column">
            <h3 class="column-title">未绑定权限 ({{ unboundPermissions.length }})</h3>
            <el-table
              :data="unboundPermissions"
              size="small"
              style="height: 400px;"
            >
              <el-table-column prop="permissionName" label="权限名称" />
              <el-table-column prop="permissionCode" label="权限标识" />
              <el-table-column prop="permissionType" label="类型" width="80">
                <template #default="{ row }">
                  <el-tag size="small" :type="row.permissionType === 'MENU' ? 'info' : 'warning'">
                    {{ row.permissionType }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="form-actions" style="margin-top: 20px; text-align: center;">
        <el-button type="primary" @click="openBindDialog" :disabled="!selectedRoleId">
          绑定权限
        </el-button>
      </div>
    </div>
    
    <!-- 绑定权限对话框 -->
    <el-dialog
      v-model="bindDialogVisible"
      title="绑定权限"
      width="600px"
    >
      <p style="margin-bottom: 15px;">
        当前角色：<strong>{{ roles.find(r => r.id === selectedRoleId)?.roleName }}</strong>
      </p>
      <el-form label-width="100px" v-loading="permissionListLoading">
        <el-form-item label="选择权限">
          <el-checkbox-group v-model="selectedPermissionIds">
            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
              <el-checkbox
                v-for="permission in permissions"
                :key="permission.id"
                :label="permission.id"
                border
              >
                {{ permission.permissionName }} ({{ permission.permissionCode }})
              </el-checkbox>
            </div>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="bindDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBind" :loading="bindLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.role-permission-bind-view {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
}

.form-section {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.permission-section {
  padding: 20px 0;
}

.permission-columns {
  display: flex;
  gap: 20px;
}

.permission-column {
  flex: 1;
}

.column-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e4e7ed;
}

.form-actions {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
}

@media (max-width: 768px) {
  .permission-columns {
    flex-direction: column;
  }
}
</style>
