// RBAC相关类型定义

// 权限类型
export interface Permission {
  id: string
  name: string
  code: string
  description: string
  type: 'menu' | 'button' | 'api'
  parentId?: string
  createdAt: string
  updatedAt: string
}

// 角色类型
export interface Role {
  id: string
  name: string
  code: string
  description: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

// 用户角色关联
export interface UserRole {
  userId: string
  roleId: string
}

// 权限菜单配置
export interface Menu {
  id: string
  name: string
  code: string
  path: string
  icon: string
  parentId?: string
  permissions: string[] // 权限code列表
  children?: Menu[]
}

// 权限常量
export const PermissionCodes = {
  // 设备管理
  DEVICE_VIEW: 'device:view',
  DEVICE_ADD: 'device:add',
  DEVICE_EDIT: 'device:edit',
  DEVICE_DELETE: 'device:delete',
  
  // 告警管理
  ALERT_VIEW: 'alert:view',
  ALERT_HANDLE: 'alert:handle',
  
  // 用户管理
  USER_VIEW: 'user:view',
  USER_ADD: 'user:add',
  USER_EDIT: 'user:edit',
  USER_DELETE: 'user:delete',
  
  // 角色管理
  ROLE_VIEW: 'role:view',
  ROLE_ADD: 'role:add',
  ROLE_EDIT: 'role:edit',
  ROLE_DELETE: 'role:delete',
  
  // 权限管理
  PERMISSION_VIEW: 'permission:view',
  PERMISSION_EDIT: 'permission:edit'
} as const

// 角色常量
export const RoleCodes = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  VIEWER: 'viewer'
} as const