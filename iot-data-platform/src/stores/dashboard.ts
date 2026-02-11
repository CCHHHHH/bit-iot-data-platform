import { defineStore } from 'pinia'

interface MetricData {
  timestamp: string
  value: number
}

interface Alert {
  id: string
  deviceId: string
  deviceName: string
  type: string
  message: string
  level: 'info' | 'warning' | 'error'
  timestamp: string
  status: 'active' | 'resolved'
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    realTimeMetrics: {
      totalDevices: 0,
      onlineDevices: 0,
      offlineDevices: 0,
      warningDevices: 0,
      totalAlerts: 0
    },
    temperatureData: [] as MetricData[],
    humidityData: [] as MetricData[],
    pressureData: [] as MetricData[],
    alerts: [] as Alert[],
    loading: false
  }),
  getters: {
    activeAlerts: (state) => state.alerts.filter(alert => alert.status === 'active'),
    resolvedAlerts: (state) => state.alerts.filter(alert => alert.status === 'resolved'),
    errorAlerts: (state) => state.alerts.filter(alert => alert.level === 'error' && alert.status === 'active'),
    warningAlerts: (state) => state.alerts.filter(alert => alert.level === 'warning' && alert.status === 'active')
  },
  actions: {
    setRealTimeMetrics(metrics: any) {
      this.realTimeMetrics = metrics
    },
    setTemperatureData(data: MetricData[]) {
      this.temperatureData = data
    },
    setHumidityData(data: MetricData[]) {
      this.humidityData = data
    },
    setPressureData(data: MetricData[]) {
      this.pressureData = data
    },
    setAlerts(alerts: Alert[]) {
      this.alerts = alerts
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    addAlert(alert: Alert) {
      this.alerts.unshift(alert)
    },
    resolveAlert(id: string) {
      const alert = this.alerts.find(a => a.id === id)
      if (alert) {
        alert.status = 'resolved'
      }
    }
  }
})