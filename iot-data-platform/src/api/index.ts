import request from '../utils/request'

// ========== 登录相关接口 ==========

/**
 * 用户登录
 * @param data 登录参数 { username, password }
 */
export function login(data: { username: string; password: string }) {
  return request.post('/api/system/iot/login', data)
}

/**
 * 获取当前登录用户信息
 */
export function getCurrentUser() {
  return request.get('/api/system/iot/login/current')
}

// ========== 用户管理接口 ==========

/**
 * 分页查询用户列表
 * @param params 查询参数 { current, size, username }
 */
export function getUserList(params?: { current?: number; size?: number; username?: string }) {
  return request.get('/api/system/iot/user/list', { params })
}

/**
 * 根据 ID 获取用户
 * @param userId 用户 ID
 */
export function getUserById(userId: string) {
  return request.get(`/api/system/iot/user/${userId}`)
}

/**
 * 新增用户
 * @param data 用户信息
 */
export function addUser(data: any) {
  return request.post('/api/system/iot/user', data)
}

/**
 * 编辑用户
 * @param data 用户信息（包含 id）
 */
export function editUser(data: any) {
  return request.put('/api/system/iot/user', data)
}

/**
 * 删除用户
 * @param userId 用户 ID
 */
export function deleteUser(userId: number | string) {
  return request.delete(`/api/system/iot/user/${userId}`)
}

/**
 * 修改密码
 * @param params 参数 { userId, oldPassword, newPassword }
 */
export function changePassword(params: { userId: number | string; oldPassword: string; newPassword: string }) {
  return request.put('/api/system/iot/user/password', null, { params })
}

/**
 * 获取用户的角色 ID 列表
 * @param userId 用户 ID
 */
export function getRoleIdsByUserId(userId: string) {
  return request.get(`/api/system/iot/user/roles/${userId}`)
}

/**
 * 为用户分配角色
 * @param userId 用户 ID
 * @param roleIds 角色 ID 列表
 */
export function assignRolesToUser(userId: string, roleIds: string[]) {
  return request.post('/api/system/iot/user/roles', roleIds, { params: { userId } })
}

/**
 * 从用户中删除指定角色
 * @param params 参数 { userId, roleId }
 */
export function removeRoleFromUser(params: { userId: string; roleId: string }) {
  return request.delete('/api/system/iot/user/roles', { params })
}

// ========== 角色管理接口 ==========

/**
 * 分页查询角色列表
 * @param params 查询参数 { current, size, roleName }
 */
export function getRoleList(params?: { current?: number; size?: number; roleName?: string }) {
  return request.get('/api/system/iot/role/list', { params })
}

/**
 * 根据 ID 获取角色
 * @param roleId 角色 ID
 */
export function getRoleById(roleId: string) {
  return request.get(`/api/system/iot/role/${roleId}`)
}

/**
 * 新增角色
 * @param data 角色信息
 * @param permissionIds 权限 ID 列表（可选）
 */
export function addRole(data: any, permissionIds?: string[]) {
  return request.post('/api/system/iot/role', data, { params: { permissionIds } })
}

/**
 * 修改角色
 * @param data 角色信息（包含 id）
 * @param permissionIds 权限 ID 列表（可选）
 */
export function editRole(data: any, permissionIds?: string[]) {
  return request.put('/api/system/iot/role', data, { params: { permissionIds } })
}

/**
 * 删除角色
 * @param roleId 角色 ID
 */
export function deleteRole(roleId: string) {
  return request.delete(`/api/system/iot/role/${roleId}`)
}

/**
 * 获取角色的权限 ID 列表
 * @param roleId 角色 ID
 */
export function getPermissionIdsByRoleId(roleId: string) {
  return request.get(`/api/system/iot/role/permissions/list/${roleId}`)
}

/**
 * 获取角色的权限列表
 * @param roleId 角色 ID
 */
export function getPermissionsByRoleId(roleId: string) {
  return request.get(`/api/system/iot/role/permissions/${roleId}`)
}

/**
 * 为角色分配权限
 * @param roleId 角色 ID
 * @param permissionIds 权限 ID 列表
 */
export function assignPermissionsToRole(roleId: string, permissionIds: string[]) {
  return request.post('/api/system/iot/role/permissions', permissionIds, { params: { roleId } })
}

/**
 * 删除角色上的指定权限
 * @param params 参数 { roleId, permissionId }
 */
export function removePermissionFromRole(params: { roleId: string; permissionId: string }) {
  return request.delete('/api/system/iot/role/permissions', { params })
}

// ========== 权限管理接口 ==========

/**
 * 分页查询权限列表
 * @param params 查询参数 { current, size, permissionName }
 */
export function getPermissionList(params?: { current?: number; size?: number; permissionName?: string }) {
  return request.get('/api/system/iot/permission/list', { params })
}

/**
 * 根据 ID 获取权限
 * @param permissionId 权限 ID
 */
export function getPermissionById(permissionId: string) {
  return request.get(`/api/system/iot/permission/${permissionId}`)
}

/**
 * 新增权限
 * @param data 权限信息
 */
export function addPermission(data: any) {
  return request.post('/api/system/iot/permission', data)
}

/**
 * 编辑权限
 * @param data 权限信息（包含 id）
 */
export function editPermission(data: any) {
  return request.put('/api/system/iot/permission', data)
}

/**
 * 删除权限
 * @param permissionId 权限 ID
 */
export function deletePermission(permissionId: string) {
  return request.delete(`/api/system/iot/permission/${permissionId}`)
}

// ========== 用户角色绑定接口 ==========

/**
 * 批量为用户绑定角色
 * @param userIds 用户 ID 列表
 * @param roleIds 角色 ID 列表
 */
export function batchBindUserRoles(userIds: string[], roleIds: string[]) {
  return request.post('/api/system/iot/user/roles', roleIds, { 
    params: { userId: userIds[0] } // 接口只支持单个用户
  })
}

/**
 * 批量取消用户角色绑定
 * @param userIds 用户 ID 列表
 * @param roleIds 角色 ID 列表
 */
export function batchUnbindUserRoles(userIds: string[], roleIds: string[]) {
  // 如果没有批量删除接口，就逐个删除
  const deletePromises = roleIds.map(roleId => 
    request.delete('/api/system/iot/user/roles', { 
      params: { userId: userIds[0], roleId } 
    })
  )
  return Promise.all(deletePromises)
}

/**
 * 获取用户的角色列表
 * @param userId 用户 ID
 */
export function getUserRoles(userId: string) {
  return request.get(`/api/system/iot/user/roles/${userId}`)
}

// ========== 角色权限绑定接口 ==========

/**
 * 批量为角色绑定权限
 * @param roleId 角色 ID
 * @param permissionIds 权限 ID 列表
 */
export function bindRolePermissions(roleId: string, permissionIds: string[]) {
  return request.post('/api/system/iot/role/permissions', permissionIds, { params: { roleId } })
}

/**
 * 获取角色的权限列表
 * @param roleId 角色 ID
 */
export function getRolePermissions(roleId: string) {
  return request.get(`/api/system/iot/role/permissions/${roleId}`)
}

/**
 * 获取所有权限树
 */
export function getPermissionTree() {
  return request.get('/api/system/iot/permission/tree')
}

// ========== 设备目录管理接口 ==========

/**
 * 获取设备目录树
 * @param params 查询参数 { name }
 */
export function getDeviceCatalogTree(params?: { name?: string }) {
  return request.get('/api/system/iot/device/catalog/tree', { params })
}

/**
 * 根据 ID 获取设备目录详情
 * @param catalogId 目录 ID
 */
export function getDeviceCatalogById(catalogId: string) {
  return request.get(`/api/system/iot/device/catalog/${catalogId}`)
}

/**
 * 创建设备目录
 * @param data 目录信息 { name, parentId, description }
 */
export function createDeviceCatalog(data: any) {
  return request.post('/api/system/iot/device/catalog', data)
}

/**
 * 更新设备目录
 * @param data 目录信息（包含 id）
 */
export function updateDeviceCatalog(data: any) {
  return request.put('/api/system/iot/device/catalog', data)
}

/**
 * 删除设备目录
 * @param catalogId 目录 ID
 */
export function deleteDeviceCatalog(catalogId: string) {
  return request.delete(`/api/system/iot/device/catalog/${catalogId}`)
}

/**
 * 获取目录下的设备列表
 * @param catalogId 目录 ID
 * @param params 查询参数 { current, size }
 */
export function getDevicesByCatalogId(catalogId: string, params?: { current?: number; size?: number }) {
  return request.get(`/api/system/iot/device/catalog/${catalogId}/devices`, { params })
}

/**
 * 为目录添加设备
 * @param catalogId 目录 ID
 * @param deviceIds 设备 ID 列表
 */
export function addDevicesToCatalog(catalogId: string, deviceIds: string[]) {
  return request.post(`/api/system/iot/device/catalog/${catalogId}/devices`, deviceIds)
}

/**
 * 从目录移除设备
 * @param catalogId 目录 ID
 * @param deviceId 设备 ID
 */
export function removeDeviceFromCatalog(catalogId: string, deviceId: string) {
  return request.delete(`/api/system/iot/device/catalog/${catalogId}/devices/${deviceId}`)
}

/**
 * 移动目录到新的父节点
 * @param catalogId 目录 ID
 * @param newParentId 新的父节点 ID（null 表示移动到根节点）
 */
export function moveCatalog(catalogId: string, newParentId: string | null) {
  return request.put(`/api/system/iot/device/catalog/${catalogId}/move`, { newParentId })
}
