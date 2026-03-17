/**
 * 设备服务 API 接口模块
 * 
 * 基于网关访问模式，所有接口使用 /api/device 前缀
 * 网关地址：http://localhost:9000
 * 服务前缀：/api/device/iot
 * 
 * 包含以下模块：
 * 1. 设备目录管理接口 (/device-catalogue)
 * 2. 设备管理接口 (/device)
 * 3. 设备测点管理接口 (/device-station-code)
 * 4. 设备事件管理接口 (/device-event)
 */

import request from '../utils/request'

// ==================== 设备目录管理接口 ====================

/**
 * 查询树形结构的设备目录
 * @description GET /api/device/iot/device-catalogue/tree
 * @returns 目录树结构
 */
export function getDeviceCatalogueTree() {
  return request.get('/api/device/iot/device-catalogue/tree')
}

/**
 * 分页查询设备目录列表
 * @description GET /api/device/iot/device-catalogue/list
 * @param params 查询参数 { current, size, catalogueName }
 */
export function getDeviceCatalogueList(params?: {
  current?: number
  size?: number
  catalogueName?: string
}) {
  return request.get('/api/device/iot/device-catalogue/list', { params })
}

/**
 * 新增设备目录
 * @description POST /api/device/iot/device-catalogue
 * @param data 目录信息 { id, parentId, catalogueName, children, deviceCount }
 */
export function addDeviceCatalogue(data: {
  id?: string
  parentId?: string
  catalogueName: string
  children?: any[]
  deviceCount?: number
}) {
  return request.post('/api/device/iot/device-catalogue', data)
}

/**
 * 编辑设备目录
 * @description PUT /api/device/iot/device-catalogue
 * @param data 目录信息 { id, parentId, catalogueName }
 */
export function editDeviceCatalogue(data: {
  id: string
  parentId?: string
  catalogueName?: string
}) {
  return request.put('/api/device/iot/device-catalogue', data)
}

/**
 * 删除设备目录
 * @description DELETE /api/device/iot/device-catalogue/{id}
 * @param id 目录 ID
 */
export function deleteDeviceCatalogue(id: string) {
  return request.delete(`/api/device/iot/device-catalogue/${id}`)
}

// ==================== 设备管理接口 ====================

/**
 * 分页查询设备列表
 * @description GET /api/device/iot/device/list
 * @param params 查询参数 { current, size, deviceName, catalogueId }
 */
export function getDeviceList(params?: {
  current?: number
  size?: number
  deviceName?: string
  catalogueId?: string
}) {
  return request.get('/api/device/iot/device/list', { params })
}

/**
 * 根据设备目录 ID 查询设备列表
 * @description GET /api/device/iot/device/by-catalogue/{catalogueId}
 * @param catalogueId 目录 ID
 */
export function getDevicesByCatalogueId(catalogueId: string) {
  return request.get(`/api/device/iot/device/by-catalogue/${catalogueId}`)
}

/**
 * 新增设备
 * @description POST /api/device/iot/device
 * @param data 设备信息 { id, deviceName, deviceCode, status, deviceType, catalogueId }
 */
export function addDevice(data: {
  id?: string
  deviceName: string
  deviceCode?: string
  status?: string
  deviceType?: string
  catalogueId?: string
}) {
  return request.post('/api/device/iot/device', data)
}

/**
 * 编辑设备
 * @description PUT /api/device/iot/device
 * @param data 设备信息 { id, deviceName, deviceCode, status, deviceType, catalogueId }
 */
export function editDevice(data: {
  id: string
  deviceName?: string
  deviceCode?: string
  status?: string
  deviceType?: string
  catalogueId?: string
}) {
  return request.put('/api/device/iot/device', data)
}

/**
 * 删除设备
 * @description DELETE /api/device/iot/device/{id}
 * @param id 设备 ID
 */
export function deleteDevice(id: string) {
  return request.delete(`/api/device/iot/device/${id}`)
}

// ==================== 设备测点管理接口 ====================

/**
 * 分页查询设备测点列表
 * @description GET /api/device/iot/device-station-code/list
 * @param params 查询参数 { current, size, deviceId }
 */
export function getStationCodeList(params?: {
  current?: number
  size?: number
  deviceId?: string
}) {
  return request.get('/api/device/iot/device-station-code/list', { params })
}

/**
 * 根据设备 ID 查询测点列表
 * @description GET /api/device/iot/device-station-code/by-device/{deviceId}
 * @param deviceId 设备 ID
 */
export function getStationCodesByDeviceId(deviceId: string) {
  return request.get(`/api/device/iot/device-station-code/by-device/${deviceId}`)
}

/**
 * 新增设备测点
 * @description POST /api/device/iot/device-station-code
 * @param data 测点信息 { id, deviceId, stationCode, stationName, standardStationCode, stationDesc }
 */
export function addStationCode(data: {
  id?: string
  deviceId: string
  stationCode: string
  stationName?: string
  standardStationCode?: string
  stationDesc?: string
}) {
  return request.post('/api/device/iot/device-station-code', data)
}

/**
 * 编辑设备测点
 * @description PUT /api/device/iot/device-station-code
 * @param data 测点信息 { id, deviceId, stationCode, stationName, standardStationCode, stationDesc }
 */
export function editStationCode(data: {
  id: string
  deviceId?: string
  stationCode?: string
  stationName?: string
  standardStationCode?: string
  stationDesc?: string
}) {
  return request.put('/api/device/iot/device-station-code', data)
}

/**
 * 删除设备测点
 * @description DELETE /api/device/iot/device-station-code/{id}
 * @param id 测点 ID
 */
export function deleteStationCode(id: string) {
  return request.delete(`/api/device/iot/device-station-code/${id}`)
}

// ==================== 设备事件管理接口 ====================

/**
 * 分页查询设备事件列表
 * @description GET /api/device/iot/device-event/list
 * @param params 查询参数 { current, size, deviceId }
 */
export function getEventList(params?: {
  current?: number
  size?: number
  deviceId?: string
}) {
  return request.get('/api/device/iot/device-event/list', { params })
}

/**
 * 根据设备 ID 查询事件列表
 * @description GET /api/device/iot/device-event/by-device/{deviceId}
 * @param deviceId 设备 ID
 */
export function getEventsByDeviceId(deviceId: string) {
  return request.get(`/api/device/iot/device-event/by-device/${deviceId}`)
}

/**
 * 新增设备事件
 * @description POST /api/device/iot/device-event
 * @param data 事件信息 { id, deviceId, eventTime, eventMessage }
 */
export function addEvent(data: {
  id?: string
  deviceId: string
  eventTime?: string
  eventMessage?: string
}) {
  return request.post('/api/device/iot/device-event', data)
}

/**
 * 编辑设备事件
 * @description PUT /api/device/iot/device-event
 * @param data 事件信息 { id, deviceId, eventTime, eventMessage }
 */
export function editEvent(data: {
  id: string
  deviceId?: string
  eventTime?: string
  eventMessage?: string
}) {
  return request.put('/api/device/iot/device-event', data)
}

/**
 * 删除设备事件
 * @description DELETE /api/device/iot/device-event/{id}
 * @param id 事件 ID
 */
export function deleteEvent(id: string) {
  return request.delete(`/api/device/iot/device-event/${id}`)
}

/**
 * 确认设备事件
 * @description PUT /api/device/iot/device-event/{id}/confirm
 * @param id 事件 ID
 * @param operator 确认人
 */
export function confirmEvent(id: string, operator: string) {
  return request.put(`/api/device/iot/device-event/${id}/confirm`, { operator })
}

/**
 * 解决设备事件
 * @description PUT /api/device/iot/device-event/{id}/resolve
 * @param id 事件 ID
 * @param solution 解决方案
 * @param resolver 解决人
 */
export function resolveEvent(id: string, solution: string, resolver: string) {
  return request.put(`/api/device/iot/device-event/${id}/resolve`, { solution, resolver })
}
