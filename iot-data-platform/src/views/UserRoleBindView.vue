<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, getRoleList, batchBindUserRoles, batchUnbindUserRoles } from '../api'

const loading = ref(false)
const userListLoading = ref(false)
const roleListLoading = ref(false)

// 用户列表
const users = ref<any[]>([])
const selectedUserIds = ref<string[]>([])

// 角色列表
const roles = ref<any[]>([])
const selectedRoleIds = ref<string[]>([])

// 已绑定角色的用户（用于取消绑定）
const boundUsers = ref<any[]>([])
const searchQuery = ref('')

// 分页
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 绑定角色对话框
const bindDialogVisible = ref(false)
const bindLoading = ref(false)

// 取消绑定对话框
const unbindDialogVisible = ref(false)
const unbindLoading = ref(false)

// 获取用户列表
const fetchUsers = async () => {
  userListLoading.value = true
  try {
    const response = await getUserList({
      current: pagination.value.currentPage,
      size: pagination.value.pageSize,
      username: searchQuery.value
    })
    
    if (response.data && response.data.data) {
      users.value = response.data.data || []
      pagination.value.total = response.data.total || 0
    }
  } catch (error: any) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    userListLoading.value = false
  }
}

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
    }
  } catch (error: any) {
    console.error('获取角色列表失败:', error)
    ElMessage.error('获取角色列表失败')
  } finally {
    roleListLoading.value = false
  }
}

// 获取已绑定角色的用户
const fetchBoundUsers = async () => {
  loading.value = true
  try {
    const response = await getUserList({
      current: 1,
      size: 100
    })
    
    if (response.data && response.data.data) {
      // 只显示有角色的用户
      boundUsers.value = (response.data.data || []).filter((user: any) => 
        user.roles && user.roles.length > 0
      )
    }
  } catch (error: any) {
    console.error('获取已绑定用户失败:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchUsers()
  await fetchRoles()
  await fetchBoundUsers()
})

// 分页
const handleSizeChange = async (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  await fetchUsers()
}

const handleCurrentChange = async (current: number) => {
  pagination.value.currentPage = current
  await fetchUsers()
}

// 搜索
const searchUsers = async () => {
  pagination.value.currentPage = 1
  await fetchUsers()
}

// 用户选择
const handleUserSelection = (selection: any[]) => {
  selectedUserIds.value = selection.map(item => item.id)
}

// 已绑定用户选择
const handleBoundUserSelection = (selection: any[]) => {
  selectedUserIds.value = selection.map(item => item.id)
}

// 打开绑定角色对话框
const openBindDialog = () => {
  if (selectedUserIds.value.length === 0) {
    ElMessage.warning('请选择要绑定角色的用户')
    return
  }
  selectedRoleIds.value = []
  bindDialogVisible.value = true
}

// 提交绑定角色
const submitBind = async () => {
  if (selectedRoleIds.value.length === 0) {
    ElMessage.warning('请选择要绑定的角色')
    return
  }
  
  bindLoading.value = true
  try {
    await batchBindUserRoles(selectedUserIds.value, selectedRoleIds.value)
    ElMessage.success('绑定角色成功')
    bindDialogVisible.value = false
    await fetchUsers()
    await fetchBoundUsers()
    selectedUserIds.value = []
    selectedRoleIds.value = []
  } catch (error: any) {
    console.error('绑定角色失败:', error)
    ElMessage.error(error.response?.data?.message || '绑定角色失败')
  } finally {
    bindLoading.value = false
  }
}

// 打开取消绑定对话框
const openUnbindDialog = () => {
  if (selectedUserIds.value.length === 0) {
    ElMessage.warning('请选择要取消绑定角色的用户')
    return
  }
  selectedRoleIds.value = []
  unbindDialogVisible.value = true
}

// 提交取消绑定
const submitUnbind = async () => {
  if (selectedRoleIds.value.length === 0) {
    ElMessage.warning('请选择要取消绑定的角色')
    return
  }
  
  ElMessageBox.confirm(`确定要取消选中用户的选中角色吗？`, {
    title: '取消绑定确认',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    unbindLoading.value = true
    try {
      await batchUnbindUserRoles(selectedUserIds.value, selectedRoleIds.value)
      ElMessage.success('取消绑定成功')
      unbindDialogVisible.value = false
      await fetchBoundUsers()
      selectedUserIds.value = []
      selectedRoleIds.value = []
    } catch (error: any) {
      console.error('取消绑定失败:', error)
      ElMessage.error(error.response?.data?.message || '取消绑定失败')
    } finally {
      unbindLoading.value = false
    }
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

// 获取用户的角色名称
const getRoleNames = (user: any) => {
  if (!user.roles || user.roles.length === 0) {
    return '无角色'
  }
  return user.roles.map((r: any) => r.roleName).join(', ')
}
</script>

<template>
  <div class="user-role-bind-view">
    <h1 class="page-title">用户角色绑定</h1>
    
    <!-- 批量绑定角色 -->
    <div class="card" style="margin-bottom: 20px;">
      <div class="page-header">
        <h2 class="section-title">批量绑定角色</h2>
        <div>
          <el-button type="primary" @click="openBindDialog" :disabled="selectedUserIds.length === 0">
            <el-icon><Plus /></el-icon>
            批量绑定角色
          </el-button>
        </div>
      </div>
      
      <!-- 搜索 -->
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名"
          clearable
          style="width: 400px;"
          @keydown.enter="searchUsers"
        >
          <template #append>
            <el-button @click="searchUsers">
              <el-icon><Search /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
      
      <!-- 用户列表 -->
      <el-table
        :data="users"
        v-loading="userListLoading"
        @selection-change="handleUserSelection"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="phoneNumber" label="手机号" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column label="当前角色">
          <template #default="{ row }">
            <span class="user-roles">{{ getRoleNames(row) }}</span>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
    
    <!-- 批量取消绑定 -->
    <div class="card">
      <div class="page-header">
        <h2 class="section-title">批量取消绑定</h2>
        <div>
          <el-button type="danger" @click="openUnbindDialog" :disabled="selectedUserIds.length === 0">
            <el-icon><Delete /></el-icon>
            批量取消绑定
          </el-button>
        </div>
      </div>
      
      <!-- 已绑定用户列表 -->
      <el-table
        :data="boundUsers"
        v-loading="loading"
        @selection-change="handleBoundUserSelection"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="phoneNumber" label="手机号" />
        <el-table-column label="已绑定角色">
          <template #default="{ row }">
            <span class="user-roles">{{ getRoleNames(row) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 绑定角色对话框 -->
    <el-dialog
      v-model="bindDialogVisible"
      title="批量绑定角色"
      width="500px"
    >
      <p style="margin-bottom: 10px;">已选择 {{ selectedUserIds.length }} 个用户</p>
      <el-form label-width="80px">
        <el-form-item label="选择角色">
          <el-checkbox-group v-model="selectedRoleIds">
            <el-checkbox
              v-for="role in roles"
              :key="role.id"
              :label="role.id"
            >
              {{ role.roleName }}
            </el-checkbox>
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
    
    <!-- 取消绑定对话框 -->
    <el-dialog
      v-model="unbindDialogVisible"
      title="批量取消绑定"
      width="500px"
    >
      <p style="margin-bottom: 10px;">已选择 {{ selectedUserIds.length }} 个用户</p>
      <el-form label-width="80px">
        <el-form-item label="选择角色">
          <el-checkbox-group v-model="selectedRoleIds">
            <el-checkbox
              v-for="role in roles"
              :key="role.id"
              :label="role.id"
            >
              {{ role.roleName }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="unbindDialogVisible = false">取消</el-button>
        <el-button type="danger" @click="submitUnbind" :loading="unbindLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-role-bind-view {
  padding: 20px;
}

.page-title {
  margin-bottom: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.search-bar {
  margin-bottom: 20px;
}

.user-roles {
  color: #666;
  font-size: 13px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
