<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Plus, 
  Edit, 
  Delete, 
  View,
  ArrowLeft
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Device } from '../types/device'

// Props
const props = defineProps<{
  deviceId: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'back'): void
}>()

// Refs
const device = ref<Device | null>(null)
const measurementPoints = ref<any[]>([])
const loading = ref(false)
const pointDialogVisible = ref(false)
const pointFormRef = ref()
const pointForm = ref({
  id: '',
  deviceId: props.deviceId,
  name: '',
  code: '',
  type: 'analog' as const,
  unit: '',
  description: '',
  minRange: undefined as number | undefined,
  maxRange: undefined as number | undefined,
  precision: undefined as number | undefined
})
const pointDialogLoading = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')

// 分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 模拟数据
const mockMeasurementPoints = [
  {
    id: '1',
    deviceId: props.deviceId,
    name: '温度测量点',
    code: 'TEMP_001',
    type: 'analog' as const,
    unit: '°C',
    description: '环境温度测量',
    currentValue: 25.5,
    lastUpdateTime: new Date().toISOString()
  },
  {
    id: '2',
    deviceId: props.deviceId,
    name: '湿度测量点',
    code: 'HUMI_001',
    type: 'analog' as const,
    unit: '%',
    description: '环境湿度测量',
    currentValue: 60.2,
    lastUpdateTime: new Date().toISOString()
  }
]

// 打开创建测量点对话框
const openCreatePointDialog = () => {
  dialogMode.value = 'create'
  pointForm.value = {
    id: '',
    deviceId: props.deviceId,
    name: '',
    code: '',
    type: 'analog',
    unit: '',
    description: '',
    minRange: undefined,
    maxRange: undefined,
    precision: undefined
  }
  pointDialogVisible.value = true
}

// 打开编辑测量点对话框
const openEditPointDialog = (point: any) => {
  dialogMode.value = 'edit'
  pointForm.value = {
    id: point.id,
    deviceId: point.deviceId,
    name: point.name || '',
    code: point.code || '',
    type: point.type || 'analog',
    unit: point.unit || '',
    description: point.description || '',
    minRange: point.minRange,
    maxRange: point.maxRange,
    precision: point.precision
  }
  pointDialogVisible.value = true
}

// 提交测量点表单
const submitPointForm = async () => {
  if (!pointFormRef.value) return
  
  await pointFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    pointDialogLoading.value = true
    try {
      if (dialogMode.value === 'create') {
        ElMessage.success('创建测量点成功 (模拟)')
      } else {
        ElMessage.success('更新测量点成功 (模拟)')
      }
      
      pointDialogVisible.value = false
      // 模拟刷新列表
      measurementPoints.value = mockMeasurementPoints
    } catch (error: any) {
      console.error('保存测量点失败:', error)
      ElMessage.error('保存测量点失败')
    } finally {
      pointDialogLoading.value = false
    }
  })
}

// 删除测量点
const deletePoint = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该测量点吗？此操作不可恢复！',
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    ElMessage.success('删除测量点成功 (模拟)')
    // 模拟刷新列表
    measurementPoints.value = mockMeasurementPoints.filter((p: any) => p.id !== id)
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除测量点失败:', error)
      ElMessage.error('删除测量点失败')
    }
  }
}


// 测量点类型文本
const getPointTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
    analog: '模拟量',
    digital: '数字量',
    counter: '计数器',
    pulse: '脉冲'
  }
  return typeMap[type] || type
}

// 查看最新数据
const getLatestData = async () => {
  ElMessage.info('查看测量点最新数据功能开发中')
}

// 返回设备列表
const goBack = () => {
  emit('back')
}

onMounted(async () => {
  // 模拟获取设备信息
  device.value = {
    id: props.deviceId,
    deviceName: '测试设备',
    deviceCode: 'DEV001',
    status: 'online',
    deviceType: 'sensor',
    createTime: new Date().toISOString(),
    updateTime: new Date().toISOString()
  }
  
  // 模拟获取测量点
  measurementPoints.value = mockMeasurementPoints
})
</script>

<template>
  <div class="measurement-point-management-view">
    <div class="page-header">
      <el-button type="default" @click="goBack" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
        返回设备列表
      </el-button>
      <h1 class="page-title">
        <el-icon :size="24" style="margin-right: 8px;"><View /></el-icon>
        设备测量点管理 - {{ device?.deviceName }}
      </h1>
      <el-button type="primary" @click="openCreatePointDialog">
        <el-icon><Plus /></el-icon>
        添加测量点
      </el-button>
    </div>

    <!-- 测量点列表 -->
    <div class="point-list card" v-loading="loading">
      <el-table
        :data="measurementPoints"
        style="width: 100%"
        size="small"
      >
        <el-table-column prop="name" label="测量点名称" min-width="150" show-overflow-tooltip />
        <el-table-column prop="code" label="编码" width="120" show-overflow-tooltip />
        <el-table-column prop="type" label="类型" width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <el-tag size="small">{{ getPointTypeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="80" show-overflow-tooltip />
        <el-table-column prop="currentValue" label="当前值" width="120" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.currentValue || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="lastUpdateTime" label="最后更新" width="160" show-overflow-tooltip />
        <el-table-column label="操作" fixed="right" width="200" class-name="table-action-column">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="getLatestData"
            >
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="openEditPointDialog(row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deletePoint(row.id)"
            >
              <el-icon><Delete /></el-icon>
              删除
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
          @size-change="measurementPoints = mockMeasurementPoints"
          @current-change="measurementPoints = mockMeasurementPoints"
        />
      </div>
    </div>

    <!-- 测量点编辑对话框 -->
    <el-dialog
      v-model="pointDialogVisible"
      :title="dialogMode === 'create' ? '创建测量点' : '编辑测量点'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="pointFormRef"
        :model="pointForm"
        label-width="100px"
        label-position="left"
      >
        <el-form-item
          label="测量点名称"
          prop="name"
          :rules="[{ required: true, message: '请输入测量点名称', trigger: 'blur' }]"
        >
          <el-input v-model="pointForm.name" placeholder="请输入测量点名称" />
        </el-form-item>
        <el-form-item
          label="测量点编码"
          prop="code"
          :rules="[{ required: true, message: '请输入测量点编码', trigger: 'blur' }]"
        >
          <el-input v-model="pointForm.code" placeholder="请输入测量点编码" />
        </el-form-item>
        <el-form-item
          label="类型"
          prop="type"
        >
          <el-select v-model="pointForm.type" placeholder="请选择类型">
            <el-option label="模拟量" value="analog" />
            <el-option label="数字量" value="digital" />
            <el-option label="计数器" value="counter" />
            <el-option label="脉冲" value="pulse" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="单位"
          prop="unit"
        >
          <el-input v-model="pointForm.unit" placeholder="请输入单位" />
        </el-form-item>
        <el-form-item
          label="最小范围"
          prop="minRange"
        >
          <el-input-number v-model="pointForm.minRange" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item
          label="最大范围"
          prop="maxRange"
        >
          <el-input-number v-model="pointForm.maxRange" :precision="2" style="width: 100%;" />
        </el-form-item>
        <el-form-item
          label="精度"
          prop="precision"
        >
          <el-input-number v-model="pointForm.precision" :precision="0" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item
          label="描述"
          prop="description"
        >
          <el-input
            v-model="pointForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pointDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPointForm" :loading="pointDialogLoading">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.measurement-point-management-view {
  padding: 20px;
  height: calc(100vh - 84px);
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-shrink: 0;
}

.back-btn {
  margin-right: 16px;
}

.page-title {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  display: flex;
  align-items: center;
}

.point-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:deep(.el-table) {
  flex: 1;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

.pagination-container {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .page-title {
    justify-content: center;
  }
  
  .back-btn {
    margin-right: 0;
  }
}
</style>