import { defineStore } from 'pinia'
import type { Role } from '../types/rbac'
import { RoleCodes } from '../types/rbac'
import { usePermissionStore } from './permission'

// 模拟角色数据
const mockRoles: Role[] = [
  {
    id: '1',
    name: '管理员',
    code: RoleCodes.ADMIN,
    description: '系统管理员，拥有所有权限',
    permissions: [], // 权限将在初始化时从权限store获取
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: '2',
    name: '操作员',
    code: RoleCodes.OPERATOR,
    description: '设备操作员，拥有设备管理和告警处理权限',
    permissions: [], // 权限将在初始化时从权限store获取
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  },
  {
    id: '3',
    name: '查看员',
    code: RoleCodes.VIEWER,
    description: '只读权限，只能查看数据',
    permissions: [], // 权限将在初始化时从权限store获取
    createdAt: '2026-02-01 10:00:00',
    updatedAt: '2026-02-01 10:00:00'
  }
]

export const useRoleStore = defineStore('role', {
  state: () => ({
    roles: [] as Role[],
    loading: false,
    currentRole: null as Role | null
  }),
  getters: {
    getRoleById: (state) => (id: string) => {
      return state.roles.find(role => role.id === id)
    },
    getRoleByCode: (state) => (code: string) => {
      return state.roles.find(role => role.code === code)
    }
  },
  actions: {
    async initializeRoles() {
      this.loading = true
      try {
        // 模拟异步加载
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const permissionStore = usePermissionStore()
        const allPermissions = permissionStore.permissions
        
        // 为角色分配权限
        const rolesWithPermissions = mockRoles.map(role => {
          let rolePermissions: typeof allPermissions = []
          
          switch (role.code) {
            case RoleCodes.ADMIN:
              // 管理员拥有所有权限
              rolePermissions = allPermissions
              break
            case RoleCodes.OPERATOR:
              // 操作员拥有设备管理和告警处理权限
              rolePermissions = allPermissions.filter(permission => 
                permission.code.startsWith('device:') || 
                permission.code.startsWith('alert:')
              )
              break
            case RoleCodes.VIEWER:
              // 查看员只有查看权限
              rolePermissions = allPermissions.filter(permission => 
                permission.code.endsWith(':view')
              )
              break
          }
          
          return {
            ...role,
            permissions: rolePermissions
          }
        })
        
        this.roles = rolesWithPermissions
      } finally {
        this.loading = false
      }
    },
    setRoles(roles: Role[]) {
      this.roles = roles
    },
    setCurrentRole(role: Role | null) {
      this.currentRole = role
    },
    setLoading(loading: boolean) {
      this.loading = loading
    },
    addRole(role: Role) {
      this.roles.push(role)
    },
    updateRole(role: Role) {
      const index = this.roles.findIndex(r => r.id === role.id)
      if (index !== -1) {
        this.roles[index] = role
      }
    },
    deleteRole(id: string) {
      this.roles = this.roles.filter(role => role.id !== id)
    },
    assignPermissionsToRole(roleId: string, permissionIds: string[]) {
      const role = this.roles.find(r => r.id === roleId)
      if (role) {
        const permissionStore = usePermissionStore()
        role.permissions = permissionIds
          .map(id => permissionStore.getPermissionById(id))
          .filter((permission): permission is typeof permissionStore.permissions[0] => permission !== undefined)
        role.updatedAt = new Date().toISOString()
      }
    }
  }
})