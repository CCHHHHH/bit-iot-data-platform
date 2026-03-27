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
const deviceStatusChart = ref<HTMLElement>()
const alertLevelChart = ref<HTMLElement>()
const deviceTypeChart = ref<HTMLElement>()
const alertTrendChart = ref<HTMLElement>()
const deviceHealthChart = ref<HTMLElement>()

// 图表实例
let temperatureChartInstance: echarts.ECharts | null = null
let humidityChartInstance: echarts.ECharts | null = null
let pressureChartInstance: echarts.ECharts | null = null
let deviceStatusChartInstance: echarts.ECharts | null = null
let alertLevelChartInstance: echarts.ECharts | null = null
let deviceTypeChartInstance: echarts.ECharts | null = null
let alertTrendChartInstance: echarts.ECharts | null = null
let deviceHealthChartInstance: echarts.ECharts | null = null

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

// 设备类型数据
const mockDeviceTypeData = [
  { name: '温湿度传感器', value: 45 },
  { name: '气压传感器', value: 25 },
  { name: '光照传感器', value: 20 },
  { name: '烟雾传感器', value: 18 }
]

// 设备状态数据
const mockDeviceStatusData = [
  { name: '在线', value: 112 },
  { name: '离线', value: 12 },
  { name: '异常', value: 4 }
]

// 告警级别数据
const mockAlertLevelData = [
  { name: '错误', value: 3 },
  { name: '警告', value: 4 },
  { name: '信息', value: 1 }
]

// 告警趋势数据
const mockAlertTrendData = Array.from({ length: 7 }, (_, i) => ({
  date: `2月${i+25}日`,
  error: Math.floor(Math.random() * 5),
  warning: Math.floor(Math.random() * 8),
  info: Math.floor(Math.random() * 10)
}))

// 设备健康状态数据
const mockDeviceHealthData = [
  { name: '优秀', value: 85 },
  { name: '良好', value: 30 },
  { name: '一般', value: 10 },
  { name: '差', value: 3 }
]

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
  if (deviceStatusChart.value) {
    deviceStatusChartInstance = echarts.init(deviceStatusChart.value)
  }
  if (alertLevelChart.value) {
    alertLevelChartInstance = echarts.init(alertLevelChart.value)
  }
  if (deviceTypeChart.value) {
    deviceTypeChartInstance = echarts.init(deviceTypeChart.value)
  }
  if (alertTrendChart.value) {
    alertTrendChartInstance = echarts.init(alertTrendChart.value)
  }
  if (deviceHealthChart.value) {
    deviceHealthChartInstance = echarts.init(deviceHealthChart.value)
  }
}

// 更新图表
const updateCharts = () => {
  updateTemperatureChart()
  updateHumidityChart()
  updatePressureChart()
  updateDeviceStatusChart()
  updateAlertLevelChart()
  updateDeviceTypeChart()
  updateAlertTrendChart()
  updateDeviceHealthChart()
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

// 更新设备状态分布图表
const updateDeviceStatusChart = () => {
  if (deviceStatusChartInstance) {
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: ['在线', '离线', '异常']
      },
      series: [
        {
          name: '设备状态',
          type: 'pie',
          radius: '70%',
          center: ['50%', '50%'],
          data: mockDeviceStatusData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          },
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          }
        }
      ],
      color: ['#00b386', '#909399', '#ff9933']
    }
    deviceStatusChartInstance.setOption(option)
  }
}

// 更新告警级别分布图表
const updateAlertLevelChart = () => {
  if (alertLevelChartInstance) {
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: mockAlertLevelData.map(item => item.name),
        axisLabel: {
          color: '#4a5568'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#4a5568'
        }
      },
      series: [
        {
          name: '告警数量',
          type: 'bar',
          data: mockAlertLevelData.map(item => item.value),
          itemStyle: {
            borderRadius: [4, 4, 0, 0]
          }
        }
      ],
      color: ['#f56c6c', '#e6a23c', '#409eff']
    }
    alertLevelChartInstance.setOption(option)
  }
}

// 更新设备类型分布图表
const updateDeviceTypeChart = () => {
  if (deviceTypeChartInstance) {
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: mockDeviceTypeData.map(item => item.name)
      },
      series: [
        {
          name: '设备类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '18',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: mockDeviceTypeData
        }
      ],
      color: ['#0066cc', '#00b386', '#ff9933', '#f56c6c']
    }
    deviceTypeChartInstance.setOption(option)
  }
}

// 更新告警趋势图表
const updateAlertTrendChart = () => {
  if (alertTrendChartInstance) {
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['错误', '警告', '信息'],
        top: 0
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
        data: mockAlertTrendData.map(item => item.date),
        axisLabel: {
          color: '#4a5568'
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#4a5568'
        }
      },
      series: [
        {
          name: '错误',
          type: 'line',
          stack: 'Total',
          data: mockAlertTrendData.map(item => item.error),
          itemStyle: {
            color: '#f56c6c'
          }
        },
        {
          name: '警告',
          type: 'line',
          stack: 'Total',
          data: mockAlertTrendData.map(item => item.warning),
          itemStyle: {
            color: '#e6a23c'
          }
        },
        {
          name: '信息',
          type: 'line',
          stack: 'Total',
          data: mockAlertTrendData.map(item => item.info),
          itemStyle: {
            color: '#409eff'
          }
        }
      ]
    }
    alertTrendChartInstance.setOption(option)
  }
}

// 更新设备健康状态图表
const updateDeviceHealthChart = () => {
  if (deviceHealthChartInstance) {
    const option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        top: '5%',
        left: 'center'
      },
      series: [
        {
          name: '健康状态',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: mockDeviceHealthData
        }
      ],
      color: ['#00b386', '#409eff', '#ff9933', '#f56c6c']
    }
    deviceHealthChartInstance.setOption(option)
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
}
</script>

<template>
  <div class="dashboard-view">
    <h1 class="page-title">数据仪表盘</h1>

    <!-- 实时指标卡片 -->
    <div class="metrics-grid" v-loading="loading">
      <div class="metric-card">
        <div class="metric-icon total">
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

    <!-- 设备状态和告警分布 -->
    <div class="charts-grid">
      <div class="chart-card card">
        <h3 class="chart-title">设备状态分布</h3>
        <div ref="deviceStatusChart" class="chart-container" style="height: 300px;"></div>
      </div>
      <div class="chart-card card">
        <h3 class="chart-title">告警级别分布</h3>
        <div ref="alertLevelChart" class="chart-container" style="height: 300px;"></div>
      </div>
    </div>

    <!-- 设备类型和告警趋势 -->
    <div class="charts-grid">
      <div class="chart-card card">
        <h3 class="chart-title">设备类型分布</h3>
        <div ref="deviceTypeChart" class="chart-container" style="height: 300px;"></div>
      </div>
      <div class="chart-card card">
        <h3 class="chart-title">告警趋势</h3>
        <div ref="alertTrendChart" class="chart-container" style="height: 300px;"></div>
      </div>
    </div>

    <!-- 设备健康状态 -->
    <div class="charts-grid">
      <div class="chart-card card">
        <h3 class="chart-title">设备健康状态</h3>
        <div ref="deviceHealthChart" class="chart-container" style="height: 300px;"></div>
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
.dashboard-view { padding: 0; }

/* ── Metric Cards ─────────────────────────────────────────────── */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 22px;
}

.metric-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--clr-border-light);
  box-shadow: var(--shadow-sm);
  transition: all 0.22s ease;
  position: relative;
  overflow: hidden;
}
.metric-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  opacity: 0;
  transition: opacity 0.22s ease;
  border-radius: 0 0 14px 14px;
}
.metric-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}
.metric-card:hover::after { opacity: 1; }
.metric-card:nth-child(1)::after { background: linear-gradient(90deg, #1668DC, #4096FF); }
.metric-card:nth-child(2)::after { background: linear-gradient(90deg, #10B981, #34D399); }
.metric-card:nth-child(3)::after { background: linear-gradient(90deg, #9CA3AF, #D1D5DB); }
.metric-card:nth-child(4)::after { background: linear-gradient(90deg, #F59E0B, #FCD34D); }
.metric-card:nth-child(5)::after { background: linear-gradient(90deg, #EF4444, #F87171); }

.metric-icon {
  width: 52px; height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}
.metric-icon.total   { background: #EFF6FF; color: #1668DC; }
.metric-icon.online  { background: #ECFDF5; color: #10B981; }
.metric-icon.offline { background: #F9FAFB; color: #9CA3AF; }
.metric-icon.warning { background: #FFFBEB; color: #F59E0B; }
.metric-icon.alert   { background: #FEF2F2; color: #EF4444; }

.metric-info { min-width: 0; }
.metric-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--clr-text-primary);
  line-height: 1;
  letter-spacing: -1px;
}
.metric-label {
  font-size: 12px;
  color: var(--clr-text-secondary);
  margin-top: 6px;
  font-weight: 500;
  white-space: nowrap;
}

/* ── Charts ───────────────────────────────────────────────────── */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(440px, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--clr-text-primary);
  display: flex;
  align-items: center;
  letter-spacing: 0.1px;
}
.chart-title::before {
  content: '';
  display: inline-block;
  width: 3px; height: 14px;
  background: linear-gradient(180deg, var(--clr-primary) 0%, var(--clr-accent) 100%);
  border-radius: 9999px;
  margin-right: 8px;
  flex-shrink: 0;
}

.chart-container { height: 280px; }

/* ── Alerts section ───────────────────────────────────────────── */
.alert-level, .alert-status {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}
.alert-error   { background: #FEF2F2; color: #DC2626; }
.alert-warning { background: #FFFBEB; color: #D97706; }
.alert-info    { background: #EFF6FF; color: #1668DC; }
.status-active   { background: #FEF2F2; color: #DC2626; }
.status-resolved { background: #ECFDF5; color: #059669; }

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 1200px) {
  .metrics-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 992px) {
  .metrics-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-grid  { grid-template-columns: 1fr; }
}
@media (max-width: 576px) {
  .metrics-grid { grid-template-columns: 1fr 1fr; }
  .metric-value { font-size: 22px; }
  .chart-container { height: 220px !important; }
}
</style>