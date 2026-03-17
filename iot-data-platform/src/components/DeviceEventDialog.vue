<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getEventsByDeviceId } from '../api/device'
import type { DeviceEvent } from '../types/device'

const props = defineProps<{
  deviceId: string
  deviceName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const dialogVisible = ref(true)
const loading = ref(false)
const events = ref<DeviceEvent[]>([])

// 加载设备事件
const loadDeviceEvents = async () => {
  loading.value = true
  try {
    const response = await getEventsByDeviceId(props.deviceId)
    
    if (response.data && response.data.data) {
      events.value = response.data.data || []
    }
  } catch (error: any) {
    console.error('加载设备事件失败:', error)
    ElMessage.error('加载设备事件失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false
  emit('close')
}

// 监听对话框显示状态
watch(dialogVisible, (val) => {
  if (!val) {
    emit('close')
  }
})

// 初始化加载
loadDeviceEvents()
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`设备事件 - ${deviceName || '加载中...'}`"
    width="1000px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-table
        :data="events"
        style="width: 100%"
        size="small"
        max-height="500"
      >
        <el-table-column prop="eventMessage" label="事件消息" min-width="200" show-overflow-tooltip />
        <el-table-column prop="eventTime" label="发生时间" width="160" />
      </el-table>
    </div>
    
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
:deep(.el-dialog__body) {
  padding: 20px;
}
</style>
