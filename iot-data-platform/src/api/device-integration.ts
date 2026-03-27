import request from '../utils/request'

// ========== 插件管理接口 ==========

/**
 * 分页查询插件列表
 * GET /integration-plugin/list
 */
export function getPluginList(params?: {
  current?: number
  size?: number
  pluginName?: string
}) {
  return request.get('/api/integration/iot/integration-plugin/list', { params })
}

/**
 * 查询插件列表（带状态过滤）
 * GET /integration-plugin/list-with-status
 */
export function getPluginListWithStatus(params?: {
  pluginName?: string
  pluginStatus?: number
}) {
  return request.get('/api/integration/iot/integration-plugin/list-with-status', { params })
}

/**
 * 查询已启用的插件列表
 * GET /integration-plugin/enabled
 */
export function getEnabledPlugins() {
  return request.get('/api/integration/iot/integration-plugin/enabled')
}

/**
 * 查询已加载的插件列表
 * GET /integration-plugin/loaded
 */
export function getLoadedPlugins() {
  return request.get('/api/integration/iot/integration-plugin/loaded')
}

/**
 * 新增插件
 * POST /integration-plugin
 */
export function addPlugin(data: any) {
  return request.post('/api/integration/iot/integration-plugin', data)
}

/**
 * 编辑插件
 * PUT /integration-plugin
 */
export function updatePlugin(data: any) {
  return request.put('/api/integration/iot/integration-plugin', data)
}

/**
 * 删除插件
 * DELETE /integration-plugin/{id}
 */
export function deletePlugin(id: string) {
  return request.delete(`/api/integration/iot/integration-plugin/${id}`)
}

/**
 * 启用插件
 * PUT /integration-plugin/{id}/enable
 */
export function enablePlugin(id: string) {
  return request.put(`/api/integration/iot/integration-plugin/${id}/enable`)
}

/**
 * 禁用插件
 * PUT /integration-plugin/{id}/disable
 */
export function disablePlugin(id: string) {
  return request.put(`/api/integration/iot/integration-plugin/${id}/disable`)
}

/**
 * 启用插件（热加载）
 * POST /integration-plugin/{id}/enable-plugin
 */
export function hotEnablePlugin(id: string) {
  return request.post(`/api/integration/iot/integration-plugin/${id}/enable-plugin`)
}

/**
 * 禁用插件（热卸载）
 * POST /integration-plugin/{id}/disable-plugin
 */
export function hotDisablePlugin(id: string) {
  return request.post(`/api/integration/iot/integration-plugin/${id}/disable-plugin`)
}

/**
 * 上传插件文件
 * POST /integration-plugin/upload
 * @param file 插件文件（binary body）
 * @param pluginName 插件名称（query，可选，默认使用文件名）
 * @param description 插件描述（query，可选）
 * @param pluginType 插件类型（query，可选，默认从文件扩展名获取）
 */
export function uploadPlugin(file: File, params?: {
  pluginName?: string
  description?: string
  pluginType?: string
}) {
  const formData = new FormData()
  formData.append('file', file)
  const query: Record<string, string> = {}
  if (params?.pluginName) query.pluginName = params.pluginName
  if (params?.description) query.description = params.description
  if (params?.pluginType) query.pluginType = params.pluginType
  return request.post('/api/integration/iot/integration-plugin/upload', formData, {
    params: Object.keys(query).length ? query : undefined
  })
}

/**
 * 调用插件方法
 * POST /integration-plugin/{id}/invoke
 */
export function invokePlugin(id: string, methodName: string, args?: any[]) {
  return request.post(`/api/integration/iot/integration-plugin/${id}/invoke`, args || [], {
    params: { methodName }
  })
}

// ========== 集成配置接口 ==========

/**
 * 分页查询集成配置列表
 * GET /integration-config/list
 */
export function getIntegrationList(params?: {
  current?: number
  size?: number
  integrationName?: string
  pluginId?: string
}) {
  return request.get('/api/integration/iot/integration-config/list', { params })
}

/**
 * 查询单个集成配置及参数
 * GET /integration-config/{id}
 */
export function getIntegrationById(id: string) {
  return request.get(`/api/integration/iot/integration-config/${id}`)
}

/**
 * 根据插件 ID 查询集成配置列表
 * GET /integration-config/by-plugin/{pluginId}
 */
export function getIntegrationsByPlugin(pluginId: string) {
  return request.get(`/api/integration/iot/integration-config/by-plugin/${pluginId}`)
}

/**
 * 新增集成配置
 * POST /integration-config
 */
export function addIntegration(data: any) {
  return request.post('/api/integration/iot/integration-config', data)
}

/**
 * 编辑集成配置
 * PUT /integration-config
 */
export function updateIntegration(data: any) {
  return request.put('/api/integration/iot/integration-config', data)
}

/**
 * 删除集成配置
 * DELETE /integration-config/{id}
 */
export function deleteIntegration(id: string) {
  return request.delete(`/api/integration/iot/integration-config/${id}`)
}

/**
 * 启动集成配置
 * PUT /integration-config/{id}/start
 */
export function startIntegration(id: string) {
  return request.put(`/api/integration/iot/integration-config/${id}/start`)
}

/**
 * 暂停集成配置
 * PUT /integration-config/{id}/pause
 */
export function stopIntegration(id: string) {
  return request.put(`/api/integration/iot/integration-config/${id}/pause`)
}

// ========== 数据映射接口 ==========

/**
 * 分页查询数据映射列表
 * GET /integration-data-mapping/list
 */
export function getDataMappingList(params?: {
  current?: number
  size?: number
  integrationId?: string
}) {
  return request.get('/api/integration/iot/integration-data-mapping/list', { params })
}

/**
 * 根据集成配置 ID 查询数据映射列表
 * GET /integration-data-mapping/by-integration/{integrationId}
 */
export function getDataMappingByIntegration(integrationId: string) {
  return request.get(`/api/integration/iot/integration-data-mapping/by-integration/${integrationId}`)
}

/**
 * 新增数据映射
 * POST /integration-data-mapping
 */
export function addDataMapping(data: any) {
  return request.post('/api/integration/iot/integration-data-mapping', data)
}

/**
 * 编辑数据映射
 * PUT /integration-data-mapping
 */
export function updateDataMapping(data: any) {
  return request.put('/api/integration/iot/integration-data-mapping', data)
}

/**
 * 删除数据映射
 * DELETE /integration-data-mapping/{id}
 */
export function deleteDataMapping(id: string) {
  return request.delete(`/api/integration/iot/integration-data-mapping/${id}`)
}
