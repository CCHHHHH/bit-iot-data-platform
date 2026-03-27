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

// ==================== 插件管理类型 ====================

/**
 * 插件实体
 */
export interface Plugin {
  id: string
  name: string
  version: string
  description: string
  fileSize: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

/**
 * 插件编辑表单
 */
export interface PluginEditForm {
  id: string
  name: string
  version: string
  description: string
  updateLog?: string
}

/**
 * 插件更新表单（包含文件上传）
 */
export interface PluginUpdateForm extends PluginEditForm {
  file?: File
}

// ==================== 集成管理类型 ====================

/**
 * 集成实例实体
 */
export interface Integration {
  id: string
  name: string
  pluginId: string
  pluginName: string
  type: string
  description: string
  endpoint: string
  status: 'connected' | 'disconnected' | 'error'
  config: Record<string, any>
  deviceMapping?: DeviceMapping
  timeSeriesMapping?: TimeSeriesMapping
  statusMapping?: StatusMapping
  scheduleConfig?: ScheduleConfig
  createdAt: string
  updatedAt: string
}

/**
 * 设备映射配置
 */
export interface DeviceMapping {
  mappings: FieldMapping[]
  transformRules?: TransformRule[]
}

/**
 * 字段映射
 */
export interface FieldMapping {
  sourceField: string
  targetField: string
  dataType: 'string' | 'number' | 'boolean' | 'date'
  defaultValue?: any
  transformFunction?: string
  required: boolean
}

/**
 * 转换规则
 */
export interface TransformRule {
  field: string
  ruleType: 'trim' | 'uppercase' | 'lowercase' | 'regex' | 'custom'
  ruleValue?: string
}

/**
 * 时序数据映射配置
 */
export interface TimeSeriesMapping {
  pointMappings: PointMapping[]
  aggregationRules?: AggregationRule[]
}

/**
 * 测点映射
 */
export interface PointMapping {
  sourcePointCode: string
  targetPointCode: string
  dataType: 'analog' | 'digital' | 'accumulated'
  unitConversion?: UnitConversion
  precision?: number
  expression?: string
}

/**
 * 单位转换
 */
export interface UnitConversion {
  fromUnit: string
  toUnit: string
  formula: string
}

/**
 * 聚合规则
 */
export interface AggregationRule {
  pointCode: string
  aggregationType: 'avg' | 'max' | 'min' | 'sum'
  interval: number
  intervalUnit: 'second' | 'minute' | 'hour'
}

/**
 * 设备状态映射配置
 */
export interface StatusMapping {
  statusMappings: StatusMappingItem[]
  compositeRules?: CompositeRule[]
}

/**
 * 状态映射项
 */
export interface StatusMappingItem {
  sourceStatusCode: string | number
  targetStatus: 'online' | 'offline' | 'warning' | 'error'
  sourceDescription?: string
  targetDescription: string
  priority?: number
}

/**
 * 复合规则
 */
export interface CompositeRule {
  sourceFields: string[]
  logic: 'AND' | 'OR'
  targetStatus: string
}

/**
 * 调度配置
 */
export interface ScheduleConfig {
  enabled: boolean
  interval: number
  intervalUnit: 'hour' | 'minute' | 'second'
  lastExecutionTime?: string
  nextExecutionTime?: string
  executionStatus: 'idle' | 'running' | 'success' | 'error'
  lastExecutionResult?: ExecutionResult
}

/**
 * 执行结果
 */
export interface ExecutionResult {
  success: boolean
  message?: string
  processedCount?: number
  errorCount?: number
  duration?: number
}

/**
 * 集成实例编辑表单
 */
export interface IntegrationForm {
  id?: string
  name: string
  pluginId: string
  type: string
  description: string
  endpoint: string
  config: Record<string, any>
}
