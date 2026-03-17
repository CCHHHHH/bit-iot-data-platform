/**
 * 设备服务相关类型定义（基于真实 Swagger 文档）
 * 
 * Swagger 地址：http://127.0.0.1:9001/iot/doc.html
 */

// ==================== 设备目录类型 ====================

/**
 * 设备目录实体（对应 Swagger 中的 DeviceCatalogue）
 */
export interface DeviceCatalogue {
  id: string
  parentId?: string
  catalogueName: string
  children?: DeviceCatalogue[]
  deviceCount?: number
  createTime?: string
  updateTime?: string
}

// ==================== 设备类型 ====================

/**
 * 设备实体（对应 Swagger 中的 Device）
 */
export interface Device {
  id: string
  deviceName: string
  deviceCode?: string
  status?: string
  deviceType?: string
  catalogueId?: string
  createTime?: string
  updateTime?: string
}

// ==================== 设备测点类型 ====================

/**
 * 设备测点实体（对应 Swagger 中的 DeviceStationCode）
 */
export interface DeviceStationCode {
  id: string
  deviceId: string
  stationCode: string
  stationName?: string
  standardStationCode?: string
  stationDesc?: string
}

// ==================== 设备事件类型 ====================

/**
 * 设备事件实体（对应 Swagger 中的 DeviceEvent）
 */
export interface DeviceEvent {
  id: string
  deviceId: string
  eventTime?: string
  eventMessage?: string
}

// ==================== 通用响应类型 ====================

/**
 * 统一响应结果（对应 Swagger 中的 Result）
 */
export interface Result<T = any> {
  code: number
  message: string
  data?: T
  total?: number
}

/**
 * 空响应结果
 */
export type ResultVoid = Result<null>

// ==================== 查询参数 ====================

/**
 * 设备目录查询参数
 */
export interface DeviceCatalogueQueryParams {
  current?: number
  size?: number
  catalogueName?: string
}

/**
 * 设备查询参数
 */
export interface DeviceQueryParams {
  current?: number
  size?: number
  deviceName?: string
  catalogueId?: string
}

/**
 * 设备测点查询参数
 */
export interface DeviceStationCodeQueryParams {
  current?: number
  size?: number
  deviceId?: string
}

/**
 * 设备事件查询参数
 */
export interface DeviceEventQueryParams {
  current?: number
  size?: number
  deviceId?: string
}
