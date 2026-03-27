<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus, Edit, Delete, VideoPlay, VideoPause, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(true)
const searchQuery = ref('')

// 分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 模拟规则数据
const mockRules = [
  {
    id: 'rule-001',
    name: '温度超限告警',
    description: '当设备温度超过30°C时触发告警',
    condition: 'temperature > 30',
    action: 'send_alert',
    status: 'active',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: 'rule-002',
    name: '湿度异常告警',
    description: '当设备湿度低于20%或高于80%时触发告警',
    condition: 'humidity < 20 || humidity > 80',
    action: 'send_alert',
    status: 'active',
    createdAt: '2026-02-01 10:30:00',
    updatedAt: '2026-02-01 10:30:00'
  },
  {
    id: 'rule-003',
    name: '气压异常告警',
    description: '当设备气压异常时触发告警',
    condition: 'pressure < 990 || pressure > 1020',
    action: 'send_alert',
    status: 'inactive',
    createdAt: '2026-02-01 11:00:00',
    updatedAt: '2026-02-01 11:00:00'
  }
]

const rules = ref(mockRules)

onMounted(() => {
  // 模拟加载
  setTimeout(() => {
    pagination.value.total = mockRules.length
    loading.value = false
  }, 1000)
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
const paginatedRules = computed(() => {
  const { currentPage, pageSize } = pagination.value
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  return rules.value.slice(start, end)
})

// 编辑规则
const editRule = (id: string) => {
  // 编辑规则逻辑
  console.log('编辑规则:', id)
  ElMessage.info(`编辑规则: ${id}`)
}

// 删除规则
const deleteRule = (id: string) => {
  // 删除规则逻辑
  console.log('删除规则:', id)
  ElMessageBox.confirm('确定要删除该规则吗？', {
    title: '删除确认',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'error'
  }).then(() => {
    // 执行删除操作
    const index = rules.value.findIndex(rule => rule.id === id)
    if (index !== -1) {
      rules.value.splice(index, 1)
      pagination.value.total = rules.value.length
    }
    ElMessage.success('删除成功')
  }).catch(() => {
    // 取消删除
    ElMessage.info('已取消删除')
  })
}

// 添加规则
const addRule = () => {
  // 添加规则逻辑
  console.log('添加规则')
  ElMessage.info('添加规则功能开发中')
}

// 启用/禁用规则
const toggleRuleStatus = (id: string) => {
  // 切换规则状态逻辑
  console.log('切换规则状态:', id)
  const rule = rules.value.find(r => r.id === id)
  if (rule) {
    rule.status = rule.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(`规则已${rule.status === 'active' ? '启用' : '禁用'}`)
  }
}

// 规则状态样式
const getStatusClass = (status: string) => {
  return status === 'active' ? 'status-active' : 'status-inactive'
}

// 规则状态文本
const getStatusText = (status: string) => {
  return status === 'active' ? '启用' : '禁用'
}

// 搜索规则
const searchRules = () => {
  // 搜索规则逻辑
  console.log('搜索规则:', searchQuery.value)
}
</script>

<template>
  <div class="rule-engine-view">
    <div class="page-header">
      <h1 class="page-title">规则引擎</h1>
    </div>

    <!-- 规则列表面板 -->
    <div class="list-panel" v-loading="loading">
      <div class="list-toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索规则名称或描述"
          prefix-icon="Search"
          clearable
          style="width: 320px;"
          @keydown.enter="searchRules"
        />
        <div class="toolbar-right">
          <el-button @click="searchRules">搜索</el-button>
          <el-button type="primary" @click="addRule">
            <el-icon><Plus /></el-icon>添加规则
          </el-button>
        </div>
      </div>
      <el-table
        :data="paginatedRules"
        style="width: 100%"
        size="small"
        :row-style="{ height: '48px' }"
      >
        <el-table-column prop="name" label="规则名称" show-overflow-tooltip />
        <el-table-column prop="description" label="规则描述" show-overflow-tooltip />
        <el-table-column prop="condition" label="触发条件" show-overflow-tooltip />
        <el-table-column prop="action" label="执行动作" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="rule-status" :class="getStatusClass(row.status)">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" class-name="table-action-column" width="320">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              class="toggle-btn"
              @click="toggleRuleStatus(row.id)"
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
              class="edit-btn"
              @click="editRule(row.id)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              class="delete-btn"
              @click="deleteRule(row.id)"
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
.rule-engine-view {
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


.rule-status {
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

.toggle-btn {
  margin-right: 8px;
}

.edit-btn {
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