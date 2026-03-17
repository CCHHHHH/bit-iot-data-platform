// 设备目录相关类型定义

/**
 * 设备目录节点
 */
export interface DeviceCatalog {
  id: string
  name: string
  parentId: string | null
  description?: string
  order: number
  deviceCount?: number
  createdAt: string
  updatedAt: string
  children?: DeviceCatalog[]
}

/**
 * 设备目录树节点（用于前端展示）
 */
export interface DeviceCatalogTreeNode extends DeviceCatalog {
  label: string
  isLeaf?: boolean
  expanded?: boolean
  disabled?: boolean
}

/**
 * 设备信息
 */
export interface DeviceInfo {
  id: string
  name: string
  sn: string
  model?: string
  status?: 'online' | 'offline' | 'error'
  createdAt: string
  updatedAt: string
}

/**
 * 目录设备关联信息
 */
export interface CatalogDeviceRelation {
  catalogId: string
  deviceId: string
  createdAt: string
}

/**
 * 创建设备目录参数
 */
export interface CreateCatalogParams {
  name: string
  parentId?: string | null
  description?: string
  order?: number
}

/**
 * 更新设备目录参数
 */
export interface UpdateCatalogParams {
  id: string
  name?: string
  parentId?: string | null
  description?: string
  order?: number
}

/**
 * 移动目录参数
 */
export interface MoveCatalogParams {
  catalogId: string
  newParentId: string | null
}

/**
 * 目录操作类型
 */
export type CatalogOperation = 'create' | 'edit' | 'delete' | 'move' | 'add_device' | 'remove_device'

/**
 * 目录权限控制
 */
export interface CatalogPermissions {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canMove: boolean
  canAddDevice: boolean
  canRemoveDevice: boolean
  canViewDevice: boolean
}
