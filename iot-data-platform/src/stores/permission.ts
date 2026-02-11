import { defineStore } from 'pinia'
import type { Permission } from '../types/rbac'
import { PermissionCodes } from '../types/rbac'

// 模拟权限数据
const mockPermissions: Permission[] = [
  // 设备管理权限
  {
    id: '1',
    name: '查看设备',
    code: PermissionCodes.DEVICE_VIEW,
    description: '查看设备列表和详情',
    type: 'menu',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: '2',
    name: '添加设备',
    code: PermissionCodes.DEVICE_ADD,
    description: '添加新设备',
    type: 'button',
    parentId: '1',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: '3',
    name: '编辑设备',
    code: PermissionCodes.DEVICE_EDIT,
    description: '编辑设备信息',
    type: 'button',
    parentId: '1',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: '4',
    name: '删除设备',
    code: PermissionCodes.DEVICE_DELETE,
    description: '删除设备',
    type: 'button',
    parentId: '1',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  
  // 告警管理权限
  {
    id: '5',
    name: '查看告警',
    code: PermissionCodes.ALERT_VIEW,
    description: '查看告警列表',
    type: 'menu',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: '6',
    name: '处理告警',
    code: PermissionCodes.ALERT_HANDLE,
    description: '处理告警',
    type: 'button',
    parentId: '5',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  
  // 用户管理权限
  {
    id: '7',
    name: '查看用户',
    code: PermissionCodes.USER_VIEW,
    description: '查看用户列表',
    type: 'menu',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: '8',
    name: '添加用户',
    code: PermissionCodes.USER_ADD,
    description: '添加新用户',
    type: 'button',
    parentId: '7',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: '9',
    name: '编辑用户',
    code: PermissionCodes.USER_EDIT,
    description: '编辑用户信息',
    type: 'button',
    parentId: '7',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: '10',
    name: '删除用户',
    code: PermissionCodes.USER_DELETE,
    description: '删除用户',
    type: 'button',
    parentId: '7',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  
  // 角色管理权限
  {
    id: '11',
    name: '查看角色',
    code: PermissionCodes.ROLE_VIEW,
    description: '查看角色列表',
    type: 'menu',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: '12',
    name: '添加角色',
    code: PermissionCodes.ROLE_ADD,
    description: '添加新角色',
    type: 'button',
    parentId: '11',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: '13',
    name: '编辑角色',
    code: PermissionCodes.ROLE_EDIT,
    description: '编辑角色信息',
    type: 'button',
    parentId: '11',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: '14',
    name: '删除角色',
    code: PermissionCodes.ROLE_DELETE,
    description: '删除角色',
    type: 'button',
    parentId: '11',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  
  // 权限管理权限
  {
    id: '15',
    name: '查看权限',
    code: PermissionCodes.PERMISSION_VIEW,
    description: '查看权限列表',
    type: 'menu',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: '16',
    name: '编辑权限',
    code: PermissionCodes.PERMISSION_EDIT,
    description: '编辑权限信息',
    type: 'button',
    parentId: '15',
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  }
]

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    permissions: mockPermissions as Permission[],
    loading: false,
    currentPermission: null as Permission | null
  }),
  getters: {
    menuPermissions: (state) => state.permissions.filter(permission => permission.type === 'menu'),
    buttonPermissions: (state) => state.permissions.filter(permission => permission.type === 'button'),
    apiPermissions: (state) => state.permissions.filter(permission => permission.type === 'api'),
    getPermissionById: (state) => (id: string) => {
      return state.permissions.find(permission => permission.id === id)
    },
    getPermissionsByParentId: (state) => (parentId: string) => {
      return state.permissions.filter(permission => permission.parentId === parentId)
    }
  },
  actions: {
    setPermissions(permissions: Permission[]) {
      this.permissions = permissions
    },
    setCurrentPermission(permission: Permission | null) {
      this.currentPermission = permission
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    addPermission(permission: Permission) {
      this.permissions.push(permission)
    },
    updatePermission(permission: Permission) {
      const index = this.permissions.findIndex(p => p.id === permission.id)
      if (index !== -1) {
        this.permissions[index] = permission
      }
    },
    deletePermission(id: string) {
      this.permissions = this.permissions.filter(permission => permission.id !== id)
    }
  }
})