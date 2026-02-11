<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Edit, Delete, View, Search } from '@element-plus/icons-vue'
import { useRoleStore } from '../stores/role'
import { ElMessage, ElMessageBox } from 'element-plus'

const roleStore = useRoleStore()
const router = useRouter()
const loading = ref(true)
const searchQuery = ref('')

// 分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

onMounted(async () => {
  // 模拟加载
  loading.value = true
  await roleStore.initializeRoles()
  pagination.value.total = roleStore.roles.length
  loading.value = false
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
const getPaginatedRoles = () => {
  const { currentPage, pageSize } = pagination.value
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  return roleStore.roles.slice(start, end)
}

// 编辑角色
const editRole = (id: string) => {
  // 编辑角色逻辑
  console.log('编辑角色:', id)
  ElMessage.info(`编辑角色: ${id}`)
}

// 删除角色
const deleteRole = (id: string) => {
  // 删除角色逻辑
  console.log('删除角色:', id)
  ElMessageBox.confirm('确定要删除该角色吗？', {
    title: '删除确认',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    // 执行删除操作
    roleStore.deleteRole(id)
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
    ElMessage.info('已取消删除')
  })
}

// 添加角色
const addRole = () => {
  // 添加角色逻辑
  console.log('添加角色')
  ElMessage.info('添加角色功能开发中')
}

// 查看角色详情
const viewRoleDetail = (id: string) => {
  // 查看角色详情逻辑
  console.log('查看角色详情:', id)
  // 跳转到角色权限分配页面
  router.push(`/role/${id}/permission`)
}

// 角色权限数量
const getPermissionCount = (permissions: any[]) => {
  return permissions.length
}

// 搜索角色
const searchRoles = () => {
  // 搜索角色逻辑
  console.log('搜索角色:', searchQuery.value)
  // 这里可以添加实际的搜索逻辑
  // 例如：根据searchQuery过滤角色数据
}

// 处理回车搜索
const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    searchRoles()
  }
}
</script>

<template>
  <div class="role-management-view">
    <div class="page-header">
      <h1 class="page-title">角色管理</h1>
      <el-button type="primary" class="add-role-btn" @click="addRole">
        <el-icon><Plus /></el-icon>
        添加角色
      </el-button>
    </div>

    <!-- 搜索 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索角色名称或代码"
        clearable
        style="width: 400px;"
        @keydown.enter="searchRoles"
      >
        <template #append>
          <el-button @click="searchRoles">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 角色列表 -->
    <div class="role-list card" v-loading="loading">
      <el-table
        :data="getPaginatedRoles()"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="code" label="角色代码" width="120" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column label="权限数量" width="100">
          <template #default="{ row }">
            <span>{{ getPermissionCount(row.permissions) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              class="view-btn"
              @click="viewRoleDetail(row.id)"
            >
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button
              type="warning"
              size="small"
              class="edit-btn"
              @click="editRole(row.id)"
            >
              <el-icon><Edit /></el-icon>
              编辑
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
.role-management-view {
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

.view-btn {
  margin-right: 8px;
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