<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'
import { useRoleStore } from '../stores/role'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(true)
const searchQuery = ref('')
const roleStore = useRoleStore()

// 模拟用户数据
const mockUsers = [
  {
    id: 'user-001',
    username: 'admin',
    name: '管理员',
    email: 'admin@example.com',
    phone: '13800138000',
    roleId: '1', // 管理员角色ID
    status: 'active',
    created: '2026-02-01 10:00:00'
  },
  {
    id: 'user-002',
    username: 'operator',
    name: '操作员',
    email: 'operator@example.com',
    phone: '13800138001',
    roleId: '2', // 操作员角色ID
    status: 'active',
    created: '2026-02-01 10:30:00'
  },
  {
    id: 'user-003',
    username: 'viewer',
    name: '查看员',
    email: 'viewer@example.com',
    phone: '13800138002',
    roleId: '3', // 查看员角色ID
    status: 'inactive',
    created: '2026-02-01 11:00:00'
  }
]

const users = ref(mockUsers)

onMounted(async () => {
  // 模拟加载
  setTimeout(async () => {
    // 初始化角色数据
    await roleStore.initializeRoles()
    loading.value = false
  }, 1000)
})

// 分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: mockUsers.length
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
const getPaginatedUsers = () => {
  const { currentPage, pageSize } = pagination.value
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  return users.value.slice(start, end)
}

// 角色选项（预留）
// const roleOptions = computed(() => {
//   return roleStore.roles.map(role => ({
//     value: role.id,
//     label: role.name
//   }))
// })

// 状态选项（预留）
// const statusOptions = [
//   { value: 'active', label: '活跃' },
//   { value: 'inactive', label: '禁用' }
// ]

// 获取角色名称
const getRoleName = (roleId: string) => {
  const role = roleStore.getRoleById(roleId)
  return role ? role.name : '未知角色'
}

// 角色样式
const getRoleClass = (roleId: string) => {
  const role = roleStore.getRoleById(roleId)
  if (!role) return ''
  
  switch (role.code) {
    case 'admin':
      return 'role-admin'
    case 'operator':
      return 'role-operator'
    case 'viewer':
      return 'role-viewer'
    default:
      return ''
  }
}

// 角色文本
const getRoleText = (roleId: string) => {
  return getRoleName(roleId)
}

// 状态样式
const getStatusClass = (status: string) => {
  return status === 'active' ? 'status-active' : 'status-inactive'
}

// 状态文本
const getStatusText = (status: string) => {
  return status === 'active' ? '活跃' : '禁用'
}

// 编辑用户
const editUser = (id: string) => {
  // 编辑用户逻辑
  console.log('编辑用户:', id)
  // 这里可以打开编辑对话框
  ElMessage.info(`编辑用户: ${id}`)
}

// 删除用户
const deleteUser = (id: string) => {
  // 删除用户逻辑
  console.log('删除用户:', id)
  // 这里可以打开删除确认对话框
  ElMessageBox.confirm('确定要删除该用户吗？', {
    title: '删除确认',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    // 执行删除操作
    const index = users.value.findIndex(user => user.id === id)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
    ElMessage.info('已取消删除')
  })
}

// 添加用户
const addUser = () => {
  // 添加用户逻辑
  console.log('添加用户')
  ElMessage.info('添加用户功能开发中')
}

// 搜索用户
const searchUsers = () => {
  // 搜索用户逻辑
  console.log('搜索用户:', searchQuery.value)
  // 这里可以添加实际的搜索逻辑
  // 例如：根据 searchQuery 过滤用户数据
}
</script>

<template>
  <div class="user-management-view">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <el-button type="primary" class="add-user-btn" @click="addUser">
        <el-icon><Plus /></el-icon>
        添加用户
      </el-button>
    </div>

    <!-- 搜索 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索用户名或姓名"
        prefix-icon="Search"
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
    <div class="user-list card" v-loading="loading">
      <el-table
        :data="getPaginatedUsers()"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="email" label="邮箱" min-width="200" />
        <el-table-column prop="phone" label="手机号" width="150" />
        <el-table-column prop="roleId" label="角色" width="100">
          <template #default="{ row }">
            <span class="user-role" :class="getRoleClass(row.roleId)">
              {{ getRoleText(row.roleId) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="user-status" :class="getStatusClass(row.status)">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="created" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              class="edit-btn"
              @click="editUser(row.id)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              class="delete-btn"
              @click="deleteUser(row.id)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-container" style="margin-top: 24px; padding: 0 16px;">
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
  </div>
</template>

<style scoped>
.user-management-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.user-role {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.role-admin {
  background-color: #ecf5ff;
  color: #409eff;
}

.role-operator {
  background-color: #f0f9eb;
  color: #67c23a;
}

.role-viewer {
  background-color: #f5f7fa;
  color: #909399;
}

.user-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-inactive {
  background-color: #f5f7fa;
  color: #909399;
}

.edit-btn {
  margin-right: 8px;
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