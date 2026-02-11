<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import * as echarts from 'echarts'
import { Monitor, Check, Close, Warning, Bell, Search } from '@element-plus/icons-vue'

const dashboardStore = useDashboardStore()
const loading = ref(true)
const searchQuery = ref('')

// 图表引用
const temperatureChart = ref<HTMLElement>()
const humidityChart = ref<HTMLElement>()
const pressureChart = ref<HTMLElement>()

// 图表实例
let temperatureChartInstance: echarts.ECharts | null = null
let humidityChartInstance: echarts.ECharts | null = null
let pressureChartInstance: echarts.ECharts | null = null

// 模拟数据
const mockRealTimeMetrics = {
  totalDevices: 128,
  onlineDevices: 112,
  offlineDevices: 12,
  warningDevices: 4,
  totalAlerts: 8
}

const mockTemperatureData = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${i}:00`,
  value: 20 + Math.random() * 10
}))

const mockHumidityData = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${i}:00`,
  value: 40 + Math.random() * 30
}))

const mockPressureData = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${i}:00`,
  value: 1000 + Math.random() * 20
}))

const mockAlerts = [
  {
    id: '1',
    deviceId: 'dev-001',
    deviceName: '温湿度传感器',
    type: 'temperature',
    message: '温度超出阈值',
    level: 'error' as const,
    timestamp: '2026-02-04 10:30:00',
    status: 'active' as const
  },
  {
    id: '2',
    deviceId: 'dev-002',
    deviceName: '气压传感器',
    type: 'pressure',
    message: '气压异常',
    level: 'warning' as const,
    timestamp: '2026-02-04 09:15:00',
    status: 'active' as const
  },
  {
    id: '3',
    deviceId: 'dev-003',
    deviceName: '光照传感器',
    type: 'light',
    message: '光照强度不足',
    level: 'info' as const,
    timestamp: '2026-02-04 08:45:00',
    status: 'active' as const
  },
  {
    id: '4',
    deviceId: 'dev-004',
    deviceName: '烟雾传感器',
    type: 'smoke',
    message: '烟雾浓度过高',
    level: 'error' as const,
    timestamp: '2026-02-04 07:20:00',
    status: 'resolved' as const
  }
]

onMounted(() => {
  // 模拟加载
  setTimeout(() => {
    dashboardStore.setRealTimeMetrics(mockRealTimeMetrics)
    dashboardStore.setTemperatureData(mockTemperatureData)
    dashboardStore.setHumidityData(mockHumidityData)
    dashboardStore.setPressureData(mockPressureData)
    dashboardStore.setAlerts(mockAlerts)
    loading.value = false
    
    // 初始化图表
    initCharts()
    updateCharts()
  }, 1000)
})

// 分页状态
const alertPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: mockAlerts.length
})

// 分页方法
const handleAlertSizeChange = (size: number) => {
  alertPagination.value.pageSize = size
  alertPagination.value.currentPage = 1
}

const handleAlertCurrentChange = (current: number) => {
  alertPagination.value.currentPage = current
}

// 计算分页后的数据
const getPaginatedAlerts = () => {
  const { currentPage, pageSize } = alertPagination.value
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize
  return dashboardStore.alerts.slice(start, end)
}

// 初始化图表
const initCharts = () => {
  if (temperatureChart.value) {
    temperatureChartInstance = echarts.init(temperatureChart.value)
  }
  if (humidityChart.value) {
    humidityChartInstance = echarts.init(humidityChart.value)
  }
  if (pressureChart.value) {
    pressureChartInstance = echarts.init(pressureChart.value)
  }
}

// 更新图表
const updateCharts = () => {
  updateTemperatureChart()
  updateHumidityChart()
  updatePressureChart()
}

// 图表通用配置
const getChartBaseOption = (title: string, color: string) => {
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      borderRadius: 8,
      textStyle: {
        color: '#1a2b47'
      },
      formatter: function(params: any) {
        return `${params[0].name}<br/>${params[0].seriesName}: ${params[0].value.toFixed(2)}`
      }
    },
    legend: {
      data: [title],
      textStyle: {
        color: '#4a5568'
      },
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [] as string[],
      axisLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      axisLabel: {
        color: '#4a5568',
        fontSize: 12
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#4a5568',
        fontSize: 12
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: title,
        type: 'line',
        smooth: true,
        data: [] as number[],
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: {
          color: color,
          borderColor: '#ffffff',
          borderWidth: 2,
          shadowBlur: 10,
          shadowColor: color,
          shadowOffsetX: 0,
          shadowOffsetY: 2
        },
        lineStyle: {
          color: color,
          width: 3
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [{
              offset: 0, color: color + '40' // 40% opacity
            }, {
              offset: 1, color: color + '10' // 10% opacity
            }]
          }
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            symbolSize: 8,
            shadowBlur: 15
          }
        }
      }
    ]
  } as any
}

// 更新温度图表
const updateTemperatureChart = () => {
  if (temperatureChartInstance) {
    const option = getChartBaseOption('温度 (°C)', '#0066cc')
    option.xAxis!.data = dashboardStore.temperatureData.map(item => item.timestamp)
    option.series![0].data = dashboardStore.temperatureData.map(item => item.value)
    temperatureChartInstance.setOption(option)
  }
}

// 更新湿度图表
const updateHumidityChart = () => {
  if (humidityChartInstance) {
    const option = getChartBaseOption('湿度 (%)', '#00b386')
    option.xAxis!.data = dashboardStore.humidityData.map(item => item.timestamp)
    option.series![0].data = dashboardStore.humidityData.map(item => item.value)
    humidityChartInstance.setOption(option)
  }
}

// 更新气压图表
const updatePressureChart = () => {
  if (pressureChartInstance) {
    const option = getChartBaseOption('气压 (hPa)', '#ff9933')
    option.xAxis!.data = dashboardStore.pressureData.map(item => item.timestamp)
    option.series![0].data = dashboardStore.pressureData.map(item => item.value)
    pressureChartInstance.setOption(option)
  }
}

// 监听数据变化
watch(
  () => dashboardStore.temperatureData,
  () => {
    updateTemperatureChart()
  },
  { deep: true }
)

watch(
  () => dashboardStore.humidityData,
  () => {
    updateHumidityChart()
  },
  { deep: true }
)

watch(
  () => dashboardStore.pressureData,
  () => {
    updatePressureChart()
  },
  { deep: true }
)

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

// 状态样式
const getStatusClass = (status: string) => {
  return status === 'active' ? 'status-active' : 'status-resolved'
}

// 搜索告警
const searchAlerts = () => {
  // 搜索告警逻辑
  console.log('搜索告警:', searchQuery.value)
  // 这里可以添加实际的搜索逻辑
  // 例如：根据searchQuery过滤告警数据
}

// 处理回车搜索
const handleSearchKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    searchAlerts()
  }
}
</script>

<template>
  <div class="dashboard-view">
    <h1 class="page-title">数据仪表盘</h1>

    <!-- 实时指标卡片 -->
    <div class="metrics-grid" v-loading="loading">
      <div class="metric-card">
        <div class="metric-icon online">
          <el-icon><Monitor /></el-icon>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ dashboardStore.realTimeMetrics.totalDevices }}</div>
          <div class="metric-label">总设备数</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon online">
          <el-icon><Check /></el-icon>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ dashboardStore.realTimeMetrics.onlineDevices }}</div>
          <div class="metric-label">在线设备</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon offline">
          <el-icon><Close /></el-icon>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ dashboardStore.realTimeMetrics.offlineDevices }}</div>
          <div class="metric-label">离线设备</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon warning">
          <el-icon><Warning /></el-icon>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ dashboardStore.realTimeMetrics.warningDevices }}</div>
          <div class="metric-label">异常设备</div>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon alert">
          <el-icon><Bell /></el-icon>
        </div>
        <div class="metric-info">
          <div class="metric-value">{{ dashboardStore.realTimeMetrics.totalAlerts }}</div>
          <div class="metric-label">告警总数</div>
        </div>
      </div>
    </div>

    <!-- 数据趋势图表 -->
    <div class="charts-grid">
      <div class="chart-card card">
        <h3 class="chart-title">温度趋势</h3>
        <div ref="temperatureChart" class="chart-container" style="height: 300px;"></div>
      </div>
      <div class="chart-card card">
        <h3 class="chart-title">湿度趋势</h3>
        <div ref="humidityChart" class="chart-container" style="height: 300px;"></div>
      </div>
      <div class="chart-card card">
        <h3 class="chart-title">气压趋势</h3>
        <div ref="pressureChart" class="chart-container" style="height: 300px;"></div>
      </div>
    </div>

    <!-- 最近告警 -->
    <div class="alerts-section card" v-loading="loading">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 class="section-title">最近告警</h3>
        <div style="width: 300px;">
          <el-input
            v-model="searchQuery"
            placeholder="搜索告警信息"
            prefix-icon="Search"
            clearable
            @keydown.enter="searchAlerts"
          >
            <template #append>
              <el-button @click="searchAlerts">
                <el-icon><Search /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
      </div>
      <el-table :data="getPaginatedAlerts()" style="width: 100%">
        <el-table-column prop="deviceName" label="设备名称" width="200" />
        <el-table-column prop="message" label="告警信息" />
        <el-table-column prop="level" label="告警级别" width="120">
          <template #default="{ row }">
            <span class="alert-level" :class="getAlertLevelClass(row.level)">
              {{ row.level === 'error' ? '错误' : row.level === 'warning' ? '警告' : '信息' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="timestamp" label="发生时间" width="180" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <span class="alert-status" :class="getStatusClass(row.status)">
              {{ row.status === 'active' ? '活跃' : '已解决' }}
            </span>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-container" style="margin-top: 24px; padding: 0 16px;">
        <el-pagination
          v-model:current-page="alertPagination.currentPage"
          v-model:page-size="alertPagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="alertPagination.total"
          prev-text="上一页"
          next-text="下一页"
          @size-change="handleAlertSizeChange"
          @current-change="handleAlertCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-view {
  padding: 0;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.metric-card {
  background: var(--background-white);
  border-radius: 12px;
  box-shadow: var(--card-shadow);
  padding: 24px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: var(--primary-color);
}

.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  font-size: 24px;
  position: relative;
  overflow: hidden;
}

.metric-icon::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
}

.metric-icon.online {
  background-color: rgba(0, 102, 204, 0.1);
  color: var(--primary-color);
}

.metric-icon.online::before {
  background-color: var(--primary-color);
}

.metric-icon.offline {
  background-color: rgba(144, 147, 153, 0.1);
  color: #909399;
}

.metric-icon.offline::before {
  background-color: #909399;
}

.metric-icon.warning {
  background-color: rgba(255, 153, 51, 0.1);
  color: var(--warning-color);
}

.metric-icon.warning::before {
  background-color: var(--warning-color);
}

.metric-icon.alert {
  background-color: rgba(255, 77, 79, 0.1);
  color: var(--danger-color);
}

.metric-icon.alert::before {
  background-color: var(--danger-color);
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.metric-label {
  font-size: 14px;
  color: var(--text-secondary);
  margin-top: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

@media (max-width: 992px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 576px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 250px !important;
  }
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.chart-title::before {
  content: '';
  width: 3px;
  height: 16px;
  background-color: var(--primary-color);
  border-radius: 2px;
  margin-right: 10px;
}

.chart-container {
  height: 320px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 3px;
  height: 16px;
  background-color: var(--primary-color);
  border-radius: 2px;
  margin-right: 10px;
}

.alert-level {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.alert-error {
  background-color: rgba(255, 77, 79, 0.1) !important;
  color: var(--danger-color) !important;
}

.alert-warning {
  background-color: rgba(255, 153, 51, 0.1) !important;
  color: var(--warning-color) !important;
}

.alert-info {
  background-color: rgba(0, 102, 204, 0.1) !important;
  color: var(--primary-color) !important;
}

.alert-status {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-active {
  background-color: rgba(255, 77, 79, 0.1) !important;
  color: var(--danger-color) !important;
}

.status-resolved {
  background-color: rgba(0, 179, 134, 0.1) !important;
  color: var(--success-color) !important;
}
</style>