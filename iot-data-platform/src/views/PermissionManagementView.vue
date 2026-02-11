<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Edit, View, Search } from '@element-plus/icons-vue'
import { usePermissionStore } from '../stores/permission'
import { ElMessage } from 'element-plus'


const permissionStore = usePermissionStore()
const loading = ref(true)
const searchQuery = ref('')

// 分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

onMounted(() => {
  // 权限数据已在store初始化时加载
  pagination.value.total = permissionStore.permissions.length
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
const paginatedPermissions = computed(() => {
  const permissions = permissionStore.permissions
  const { currentPage, pageSize } = pagination.value
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  return permissions.slice(start, end)
})

// 编辑权限
const editPermission = (id: string) => {
  // 编辑权限逻辑
  console.log('编辑权限:', id)
  ElMessage.info(`编辑权限: ${id}`)
}

// 查看权限详情
const viewPermissionDetail = (id: string) => {
  // 查看权限详情逻辑
  console.log('查看权限详情:', id)
  ElMessage.info(`查看权限详情: ${id}`)
}

// 权限类型文本
const getPermissionTypeText = (type: string) => {
  switch (type) {
    case 'menu':
      return '菜单'
    case 'button':
      return '按钮'
    case 'api':
      return 'API'
    default:
      return type
  }
}

// 权限类型样式
const getPermissionTypeClass = (type: string) => {
  switch (type) {
    case 'menu':
      return 'permission-menu'
    case 'button':
      return 'permission-button'
    case 'api':
      return 'permission-api'
    default:
      return ''
  }
}

// 获取父权限名称
const getParentPermissionName = (parentId: string | undefined) => {
  if (!parentId) return '无'
  const parent = permissionStore.getPermissionById(parentId)
  return parent ? parent.name : '未知'
}

// 搜索权限
const searchPermissions = () => {
  // 搜索权限逻辑
  console.log('搜索权限:', searchQuery.value)
  // 这里可以添加实际的搜索逻辑
  // 例如：根据searchQuery过滤权限数据
}

// 处理回车搜索
const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    searchPermissions()
  }
}
</script>

<template>
  <div class="permission-management-view">
    <div class="page-header">
      <h1 class="page-title">权限管理</h1>
    </div>

    <!-- 搜索 -->
    <div class="search-bar">
      <el-input
        v-model="searchQuery"
        placeholder="搜索权限名称或代码"
        clearable
        style="width: 400px;"
        @keydown.enter="searchPermissions"
      >
        <template #append>
          <el-button @click="searchPermissions">
            <el-icon><Search /></el-icon>
          </el-button>
        </template>
      </el-input>
    </div>

    <!-- 权限列表 -->
    <div class="permission-list card" v-loading="loading">
      <el-table
        :data="paginatedPermissions"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="name" label="权限名称" min-width="150" />
        <el-table-column prop="code" label="权限代码" min-width="150" />
        <el-table-column prop="type" label="权限类型" width="100">
          <template #default="{ row }">
            <span class="permission-type" :class="getPermissionTypeClass(row.type)">
              {{ getPermissionTypeText(row.type) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="父权限" width="150">
          <template #default="{ row }">
            {{ getParentPermissionName(row.parentId) }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="权限描述" />
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              class="view-btn"
              @click="viewPermissionDetail(row.id)"
            >
              <el-icon><View /></el-icon>
              详情
            </el-button>
            <el-button
              type="warning"
              size="small"
              class="edit-btn"
              @click="editPermission(row.id)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
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
</template>

<style scoped>
.permission-management-view {
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

.permission-type {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.permission-menu {
  background-color: #ecf5ff;
  color: #409eff;
}

.permission-button {
  background-color: #f0f9eb;
  color: #67c23a;
}

.permission-api {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.view-btn {
  margin-right: 8px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
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

  .pagination-container {
    justify-content: center;
  }
}
</style>