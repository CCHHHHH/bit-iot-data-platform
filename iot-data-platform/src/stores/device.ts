import { defineStore } from 'pinia'

interface MetricData {
  timestamp: string
  value: number
}

interface Alert {
  id: string
  type: string
  message: string
  level: 'error' | 'warning' | 'info'
  timestamp: string
  status: 'active' | 'resolved'
}

interface Device {
  id: string
  name: string
  type: string
  status: 'online' | 'offline' | 'warning'
  lastActive: string
  location: string
  ipAddress?: string
  macAddress?: string
  firmwareVersion?: string
  battery?: number
  signalStrength?: number
  metrics: {
    temperature: number
    humidity: number
    pressure: number
    battery: number
  }
  historicalData?: {
    temperature: MetricData[]
    humidity: MetricData[]
  }
  alerts?: Alert[]
}

export const useDeviceStore = defineStore('device', {
  state: () => ({
    devices: [] as Device[],
    loading: false,
    currentDevice: null as Device | null
  }),
  getters: {
    onlineDevices: (state) => state.devices.filter(device => device.status === 'online'),
    offlineDevices: (state) => state.devices.filter(device => device.status === 'offline'),
    warningDevices: (state) => state.devices.filter(device => device.status === 'warning'),
    totalDevices: (state) => state.devices.length
  },
  actions: {
    setDevices(devices: Device[]) {
      this.devices = devices
    },
    setCurrentDevice(device: Device | null) {
      this.currentDevice = device
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    updateDeviceStatus(id: string, status: 'online' | 'offline' | 'warning') {
      const device = this.devices.find(d => d.id === id)
      if (device) {
        device.status = status
      }
    }
  }
})