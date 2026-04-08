import request from '../utils/request'

const BASE = '/api/rule/iot'

// ========== 规则配置 ==========

export function getRuleList(params?: {
  current?: number
  size?: number
  ruleName?: string
  algorithmId?: string
}) {
  return request.get(`${BASE}/rule-config/list`, { params })
}

export function getRuleById(id: string) {
  return request.get(`${BASE}/rule-config/${id}`)
}

export function addRule(data: any) {
  return request.post(`${BASE}/rule-config`, data)
}

export function updateRule(data: any) {
  return request.put(`${BASE}/rule-config`, data)
}

export function deleteRule(id: string) {
  return request.delete(`${BASE}/rule-config/${id}`)
}

export function saveDataSources(ruleId: string, data: any[]) {
  return request.post(`${BASE}/rule-config/${ruleId}/data-sources`, data)
}

export function saveRuleParams(ruleId: string, data: any[]) {
  return request.post(`${BASE}/rule-config/${ruleId}/params`, data)
}

export function startRule(id: string) {
  return request.put(`${BASE}/rule-config/${id}/start`)
}

export function stopRule(id: string) {
  return request.put(`${BASE}/rule-config/${id}/stop`)
}

export function triggerRule(id: string) {
  return request.post(`${BASE}/rule-config/${id}/trigger`)
}

export function getFlinkStatus(id: string) {
  return request.get(`${BASE}/rule-config/${id}/flink-status`)
}

// ========== 算法管理 ==========

export function getAlgorithmList(params?: {
  current?: number
  size?: number
  algorithmName?: string
  algorithmType?: string
}) {
  return request.get(`${BASE}/rule-algorithm/list`, { params })
}

export function uploadAlgorithm(file: File, params?: {
  algorithmName?: string
  algorithmDesc?: string
  algorithmType?: string
  algorithmClass?: string
  algorithmVersion?: string
}) {
  const formData = new FormData()
  formData.append('file', file)
  if (params?.algorithmName) formData.append('algorithmName', params.algorithmName)
  if (params?.algorithmDesc) formData.append('algorithmDesc', params.algorithmDesc)
  if (params?.algorithmType) formData.append('algorithmType', params.algorithmType)
  if (params?.algorithmClass) formData.append('algorithmClass', params.algorithmClass)
  if (params?.algorithmVersion) formData.append('algorithmVersion', params.algorithmVersion)
  return request.post(`${BASE}/rule-algorithm/upload`, formData, {
    headers: { 'Content-Type': undefined }
  })
}

export function addAlgorithm(data: any) {
  return request.post(`${BASE}/rule-algorithm`, data)
}

export function updateAlgorithm(data: any) {
  return request.put(`${BASE}/rule-algorithm`, data)
}

export function deleteAlgorithm(id: string) {
  return request.delete(`${BASE}/rule-algorithm/${id}`)
}

export function enableAlgorithm(id: string) {
  return request.put(`${BASE}/rule-algorithm/${id}/enable`)
}

export function disableAlgorithm(id: string) {
  return request.put(`${BASE}/rule-algorithm/${id}/disable`)
}

// ========== 执行日志 ==========

export function getExecutionLogs(params?: {
  current?: number
  size?: number
  ruleId?: string
  execStatus?: number
}) {
  return request.get(`${BASE}/rule-execution-log/list`, { params })
}

export function clearExecutionLogs(ruleId: string) {
  return request.delete(`${BASE}/rule-execution-log/clear/${ruleId}`)
}

// ========== 告警管理 ==========

export function getAlarmList(params?: {
  current?: number
  size?: number
  keyword?: string
  alarmStatus?: string
  alarmLevel?: string
}) {
  return request.get(`${BASE}/alarm/list`, { params })
}

export function getAlarmDetail(id: string) {
  return request.get(`${BASE}/alarm/${id}`)
}

export function resolveAlarm(id: string) {
  return request.put(`${BASE}/alarm/${id}/resolve`)
}
