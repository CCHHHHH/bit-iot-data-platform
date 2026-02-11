<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDeviceStore } from '../stores/device'
import * as echarts from 'echarts'
import { ArrowLeft, Refresh, Edit, Delete, Warning, Check } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const deviceStore = useDeviceStore()
const loading = ref(true)
const deviceId = route.params.id as string

// 图表引用
const temperatureChart = ref<HTMLElement>()
const humidityChart = ref<HTMLElement>()

// 图表实例
let temperatureChartInstance: echarts.ECharts | null = null
let humidityChartInstance: echarts.ECharts | null = null

// 模拟设备详情数据
const mockDeviceDetail = {
  id: deviceId,
  name: '温湿度传感器-001',
  type: '温湿度传感器',
  status: 'online' as const,
  lastActive: '2026-02-04 10:30:00',
  location: '办公楼1楼',
  ipAddress: '192.168.1.100',
  macAddress: '00:11:22:33:44:55',
  firmwareVersion: 'v1.2.3',
  battery: 85,
  signalStrength: 90,
  metrics: {
    temperature: 25.5,
    humidity: 60.2,
    pressure: 1013.2,
    battery: 85
  },
  historicalData: {
    temperature: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      value: 20 + Math.random() * 10
    })),
    humidity: Array.from({ length: 24 }, (_, i) => ({
      timestamp: `${i}:00`,
      value: 40 + Math.random() * 30
    }))
  },
  alerts: [
    {
      id: 'alert-001',
      type: 'temperature',
      message: '温度超出阈值',
      level: 'warning' as const,
      timestamp: '2026-02-04 09:15:00',
      status: 'resolved' as const
    },
    {
      id: 'alert-002',
      type: 'humidity',
      message: '湿度异常',
      level: 'info' as const,
      timestamp: '2026-02-04 08:45:00',
      status: 'resolved' as const
    }
  ]
}

onMounted(() => {
  // 模拟加载
  setTimeout(() => {
    deviceStore.setCurrentDevice(mockDeviceDetail)
    loading.value = false
    
    // 初始化图表
    initCharts()
    updateCharts()
  }, 1000)
})

// 初始化图表
const initCharts = () => {
  if (temperatureChart.value) {
    temperatureChartInstance = echarts.init(temperatureChart.value)
  }
  if (humidityChart.value) {
    humidityChartInstance = echarts.init(humidityChart.value)
  }
}

// 更新图表
const updateCharts = () => {
  updateTemperatureChart()
  updateHumidityChart()
}

// 更新温度图表
const updateTemperatureChart = () => {
  if (temperatureChartInstance && deviceStore.currentDevice && deviceStore.currentDevice.historicalData) {
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['温度 (°C)']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: deviceStore.currentDevice.historicalData.temperature.map(item => item.timestamp)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '温度 (°C)',
          type: 'line',
          smooth: true,
          data: deviceStore.currentDevice.historicalData.temperature.map(item => item.value),
          itemStyle: {
            color: '#409EFF'
          }
        }
      ]
    }
    temperatureChartInstance.setOption(option)
  }
}

// 更新湿度图表
const updateHumidityChart = () => {
  if (humidityChartInstance && deviceStore.currentDevice && deviceStore.currentDevice.historicalData) {
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['湿度 (%)']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: deviceStore.currentDevice.historicalData.humidity.map(item => item.timestamp)
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '湿度 (%)',
          type: 'line',
          smooth: true,
          data: deviceStore.currentDevice.historicalData.humidity.map(item => item.value),
          itemStyle: {
            color: '#67C23A'
          }
        }
      ]
    }
    humidityChartInstance.setOption(option)
  }
}

// 状态样式
const getStatusClass = (status: string) => {
  switch (status) {
    case 'online':
      return 'status-online'
    case 'offline':
      return 'status-offline'
    case 'warning':
      return 'status-warning'
    default:
      return ''
  }
}

// 状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'online':
      return '在线'
    case 'offline':
      return '离线'
    case 'warning':
      return '警告'
    default:
      return status
  }
}

// 告警级别样式
const getAlertLevelClass = (level: string) => {
  switch (level) {
    case 'error':
      return 'alert-error'
    case 'warning':
      return 'alert-warning'
    case 'info':
      return 'alert-info'
    default:
      return ''
  }
}

// 告警状态样式
const getAlertStatusClass = (status: string) => {
  return status === 'active' ? 'alert-active' : 'alert-resolved'
}

// 返回设备列表
const goBack = () => {
  router.push('/devices')
}

// 编辑设备
const editDevice = () => {
  // 编辑设备逻辑
  console.log('编辑设备:', deviceId)
}

// 删除设备
const deleteDevice = () => {
  // 删除设备逻辑
  console.log('删除设备:', deviceId)
}

// 刷新数据
const refreshData = () => {
  // 刷新数据逻辑
  console.log('刷新数据:', deviceId)
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}
</script>

<template>
  <div class="device-detail-view">
    <div class="page-header">
      <el-button type="text" class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回设备列表
      </el-button>
      <h1 class="page-title">{{ deviceStore.currentDevice?.name || '设备详情' }}</h1>
      <div class="header-actions">
        <el-button type="text" class="refresh-btn" @click="refreshData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
        <el-button type="warning" class="edit-btn" @click="editDevice">
          <el-icon><Edit /></el-icon>
          编辑
        </el-button>
        <el-button type="danger" class="delete-btn" @click="deleteDevice">
          <el-icon><Delete /></el-icon>
          删除
        </el-button>
      </div>
    </div>

    <!-- 设备基本信息 -->
    <div class="device-info-card card" v-loading="loading">
      <h2 class="section-title">基本信息</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">设备ID</div>
          <div class="info-value">{{ deviceStore.currentDevice?.id }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">设备类型</div>
          <div class="info-value">{{ deviceStore.currentDevice?.type }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">状态</div>
          <div class="info-value">
            <span class="device-status" :class="getStatusClass(deviceStore.currentDevice?.status || '')">
              {{ getStatusText(deviceStore.currentDevice?.status || '') }}
            </span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">位置</div>
          <div class="info-value">{{ deviceStore.currentDevice?.location }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">IP地址</div>
          <div class="info-value">{{ deviceStore.currentDevice?.ipAddress }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">MAC地址</div>
          <div class="info-value">{{ deviceStore.currentDevice?.macAddress }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">固件版本</div>
          <div class="info-value">{{ deviceStore.currentDevice?.firmwareVersion }}</div>
        </div>
        <div class="info-item">
          <div class="info-label">最后活跃</div>
          <div class="info-value">{{ deviceStore.currentDevice?.lastActive }}</div>
        </div>
      </div>
    </div>

    <!-- 实时数据 -->
    <div class="real-time-data card">
      <h2 class="section-title">实时数据</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-icon temperature">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ deviceStore.currentDevice?.metrics.temperature }} °C</div>
            <div class="metric-label">温度</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon humidity">
            <el-icon><Alert /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ deviceStore.currentDevice?.metrics.humidity }} %</div>
            <div class="metric-label">湿度</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon pressure">
            <el-icon><Check /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ deviceStore.currentDevice?.metrics.pressure }} hPa</div>
            <div class="metric-label">气压</div>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-icon battery">
            <el-icon><Alert /></el-icon>
          </div>
          <div class="metric-info">
            <div class="metric-value">{{ deviceStore.currentDevice?.metrics.battery }} %</div>
            <div class="metric-label">电池电量</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史数据趋势 -->
    <div class="historical-data card">
      <h2 class="section-title">历史数据趋势</h2>
      <div class="charts-grid">
        <div class="chart-card">
          <h3 class="chart-title">温度趋势</h3>
          <div ref="temperatureChart" class="chart-container" style="height: 300px;"></div>
        </div>
        <div class="chart-card">
          <h3 class="chart-title">湿度趋势</h3>
          <div ref="humidityChart" class="chart-container" style="height: 300px;"></div>
        </div>
      </div>
    </div>

    <!-- 设备告警 -->
    <div class="device-alerts card">
      <h2 class="section-title">设备告警</h2>
      <el-table :data="deviceStore.currentDevice?.alerts" style="width: 100%">
        <el-table-column prop="type" label="告警类型" width="120" />
        <el-table-column prop="message" label="告警信息" />
        <el-table-column prop="level" label="告警级别" width="100">
          <template #default="{ row }">
            <span class="alert-level" :class="getAlertLevelClass(row.level)">
              {{ row.level }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="发生时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="alert-status" :class="getAlertStatusClass(row.status)">
              {{ row.status === 'active' ? '活跃' : '已解决' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.device-detail-view {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 14px;
  color: #606266;
}

.info-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.metric-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.metric-card:hover {
  transform: translateY(-5px);
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  font-size: 20px;
}

.metric-icon.temperature {
  background-color: #ecf5ff;
  color: #409EFF;
}

.metric-icon.humidity {
  background-color: #f0f9eb;
  color: #67c23a;
}

.metric-icon.pressure {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.metric-icon.battery {
  background-color: #fef0f0;
  color: #f56c6c;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.metric-label {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

@media (max-width: 992px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #303133;
}

.device-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.status-online {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-offline {
  background-color: #f5f7fa;
  color: #909399;
}

.status-warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.alert-level {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.alert-error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.alert-warning {
  background-color: #fdf6ec;
  color: #e6a23c;
}

.alert-info {
  background-color: #ecf5ff;
  color: #409eff;
}

.alert-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.alert-active {
  background-color: #fef0f0;
  color: #f56c6c;
}

.alert-resolved {
  background-color: #f0f9eb;
  color: #67c23a;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-actions {
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>