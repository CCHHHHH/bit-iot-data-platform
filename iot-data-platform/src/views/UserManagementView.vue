<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { useRoleStore } from '../stores/role'
import { ElMessage, ElMessageBox, ElDialog, ElForm, ElFormItem, ElInput, ElSelect, ElOption, ElButton, ElCol, ElRow, ElRadioGroup } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import * as userApi from '../api'

const loading = ref(true)
const searchQuery = ref('')
const roleStore = useRoleStore()
const userFormRef = ref<FormInstance>()

// 用户数据
const users = ref<any[]>([])

onMounted(async () => {
  try {
    // 初始化角色数据
    await roleStore.initializeRoles()
    // 加载用户列表
    await loadUsers()
  } catch (error) {
    console.error('初始化失败:', error)
    ElMessage.error('初始化失败')
  } finally {
    loading.value = false
  }
})

// 分页状态
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 分页方法
const handleSizeChange = async (size: number) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
  await loadUsers()
}

const handleCurrentChange = async (current: number) => {
  pagination.value.currentPage = current
  await loadUsers()
}

// 直接使用 users 数据（API 已返回分页数据）
const getPaginatedUsers = () => {
  return users.value
}



// 获取角色名称
const getRoleName = (roleId: string) => {
  const role = roleStore.getRoleById(roleId)
  return role ? role.name : '未知角色'
}

// 角色样式
const getRoleClass = (roleId: string) => {
  const role = roleStore.getRoleById(roleId)
  if (!role) return ''
  
  switch (role.code) {
    case 'admin':
      return 'role-admin'
    case 'operator':
      return 'role-operator'
    case 'viewer':
      return 'role-viewer'
    default:
      return ''
  }
}

// 角色文本
const getRoleText = (roleId: string) => {
  return getRoleName(roleId)
}

// 状态样式
const getStatusClass = (status: number | string) => {
  const statusNum = typeof status === 'string' ? parseInt(status) : status
  return statusNum === 1 ? 'status-active' : 'status-inactive'
}

// 状态文本
const getStatusText = (status: number | string) => {
  const statusNum = typeof status === 'string' ? parseInt(status) : status
  return statusNum === 1 ? '活跃' : '禁用'
}

// 获取用户的角色 ID
const getUserRoleId = (row: any) => {
  // 如果 row 有 roleId 字段，直接返回
  if (row.roleId) {
    return row.roleId
  }
  // 否则从 roles 数组中获取第一个角色的 ID
  if (row.roles && Array.isArray(row.roles) && row.roles.length > 0) {
    return row.roles[0].id || row.roles[0].roleId
  }
  return ''
}

// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const currentUserId = ref('')

interface UserForm {
  username: string
  name: string
  email: string
  phone: string
  roleId: string
  status: 'active' | 'inactive'
  password: string
  confirmPassword: string
}

// 表单状态
const userForm = ref<UserForm>({
  username: '',
  name: '',
  email: '',
  phone: '',
  roleId: '',
  status: 'active',
  password: '',
  confirmPassword: ''
})

// 表单验证规则
const rules: FormRules<UserForm> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在 2-20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2-20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  password: [
    { required: false, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6-20 个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: false, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== userForm.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 角色选项
const roleOptions = computed(() => {
  return roleStore.roles.map(role => ({
    value: role.id,
    label: role.name
  }))
})

// 重置表单
const resetForm = () => {
  userForm.value = {
    username: '',
    name: '',
    email: '',
    phone: '',
    roleId: '',
    status: 'active',
    password: '',
    confirmPassword: ''
  }
  currentUserId.value = ''
  isEdit.value = false
}

// 打开添加用户对话框
const addUser = () => {
  resetForm()
  dialogTitle.value = '添加用户'
  isEdit.value = false
  dialogVisible.value = true
}

// 打开编辑用户对话框
const editUser = (row: any) => {
  // 直接使用列表中的数据回显
  const userData = row
  userForm.value = {
    username: userData.username || '',
    name: userData.nameCn || '',  // 后端字段是 nameCn
    email: userData.email || '',
    phone: userData.phoneNumber || '',  // 后端字段是 phoneNumber
    roleId: getUserRoleId(userData),  // 从 roles 数组或 roleId 获取
    status: userData.status === 1 ? 'active' : 'inactive',  // 后端是数字 1/0
    password: '',
    confirmPassword: ''
  }
  currentUserId.value = userData.id
  dialogTitle.value = '编辑用户'
  isEdit.value = true
  dialogVisible.value = true
}

// 保存用户
const saveUser = async () => {
  try {
    // 构建符合后端接口要求的参数
    const submitData: any = {
      username: userForm.value.username,
      nameCn: userForm.value.name,
      email: userForm.value.email,
      phoneNumber: userForm.value.phone,
      status: userForm.value.status === 'active' ? 1 : 0
    }
    
    // 处理角色 ID
    if (userForm.value.roleId) {
      submitData.roleId = userForm.value.roleId
    }
    
    // 只在新增时传递密码
    if (!isEdit.value && userForm.value.password) {
      submitData.password = userForm.value.password
    }
    
    console.log('提交的数据:', submitData)
    
    loading.value = true
    let response
    
    if (isEdit.value) {
      // 编辑用户，需要传递 id
      response = await userApi.editUser({
        id: currentUserId.value,
        ...submitData
      })
    } else {
      // 新增用户
      response = await userApi.addUser(submitData)
    }
    
    if (response.data && response.data.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '添加成功')
      dialogVisible.value = false
      // 重新加载用户列表
      await loadUsers()
    } else {
      ElMessage.error(response.data.message || (isEdit.value ? '编辑失败' : '添加失败'))
    }
  } catch (error) {
    console.error('保存用户失败:', error)
    ElMessage.error('保存用户失败')
  } finally {
    loading.value = false
  }
}

// 加载用户列表
const loadUsers = async () => {
  try {
    loading.value = true
    const response = await userApi.getUserList({
      current: pagination.value.currentPage,
      size: pagination.value.pageSize,
      username: searchQuery.value
    })
    
    console.log('用户列表响应:', response)
    console.log('响应数据:', response.data)
    
    if (response.data && response.data.code === 200) {
      // 数据结构：{ code: 200, message: 'xxx', data: [用户数组], total: 1 }
      const dataList = response.data.data
      const total = response.data.total || 0
      
      console.log('解析数据:', dataList)
      console.log('总数:', total)
      
      // data 直接是数组
      if (Array.isArray(dataList)) {
        users.value = dataList
        pagination.value.total = total
      } else {
        console.warn('数据不是数组格式:', dataList)
        users.value = []
        pagination.value.total = 0
      }
      
      console.log('最终用户数据:', users.value)
      console.log('分页总数:', pagination.value.total)
    } else {
      ElMessage.error(response.data?.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('加载用户列表失败:', error)
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

// 删除用户
const deleteUser = async (id: string) => {
  try {
    await ElMessageBox.confirm('确定要删除该用户吗？', {
      title: '删除确认',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'error'
    })
    
    loading.value = true
    const response = await userApi.deleteUser(id)
    
    if (response.data && response.data.code === 200) {
      ElMessage.success('删除成功')
      await loadUsers()
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败')
    }
  } finally {
    loading.value = false
  }
}

// 搜索用户
const searchUsers = () => {
  pagination.value.currentPage = 1
  loadUsers()
}
</script>

<template>
  <div class="user-management-view">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
    </div>

    <!-- 用户列表面板 -->
    <div class="list-panel" v-loading="loading">
      <div class="list-toolbar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索用户名或姓名"
          prefix-icon="Search"
          clearable
          style="width: 320px;"
          @keydown.enter="searchUsers"
        />
        <div class="toolbar-right">
          <el-button @click="searchUsers">搜索</el-button>
          <el-button type="primary" @click="addUser">
            <el-icon><Plus /></el-icon>添加用户
          </el-button>
        </div>
      </div>
      <el-table
        :data="getPaginatedUsers()"
        style="width: 100%"
        border
        stripe
      >
        <el-table-column prop="username" label="用户名" width="150" show-overflow-tooltip />
        <el-table-column prop="nameCn" label="姓名" width="120" show-overflow-tooltip />
        <el-table-column prop="email" label="邮箱" min-width="200" show-overflow-tooltip />
        <el-table-column prop="phoneNumber" label="手机号" width="150" show-overflow-tooltip />
        <el-table-column prop="roleId" label="角色" width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="user-role" :class="getRoleClass(getUserRoleId(row))">
              {{ getRoleText(getUserRoleId(row)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="user-status" :class="getStatusClass(row.status)">
              {{ getStatusText(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right" class-name="table-action-column">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              class="edit-btn"
              @click="editUser(row)"
            >
              <el-icon><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              class="delete-btn"
              @click="deleteUser(row.id)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="list-footer">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          prev-text="上一页"
          next-text="下一页"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 用户编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form
        :model="userForm"
        :rules="rules"
        ref="userFormRef"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input 
                v-model="userForm.username" 
                placeholder="请输入用户名" 
                :disabled="isEdit"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="userForm.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="角色" prop="roleId">
              <el-select v-model="userForm.roleId" placeholder="请选择角色" style="width: 100%">
                <el-option
                  v-for="option in roleOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="userForm.status">
                <el-radio-button label="active">活跃</el-radio-button>
                <el-radio-button label="inactive">禁用</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="userForm.password"
                type="password"
                placeholder="请输入密码"
                :disabled="isEdit"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="userForm.confirmPassword"
                type="password"
                placeholder="请确认密码"
                :disabled="isEdit"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveUser">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-management-view {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}


.user-role {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.role-admin {
  background-color: #ecf5ff;
  color: #409eff;
}

.role-operator {
  background-color: #f0f9eb;
  color: #67c23a;
}

.role-viewer {
  background-color: #f5f7fa;
  color: #909399;
}

.user-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #f0f9eb;
  color: #67c23a;
}

.status-inactive {
  background-color: #f5f7fa;
  color: #909399;
}

.edit-btn {
  margin-right: 8px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .search-bar {
    width: 100%;
  }

  .el-input {
    width: 100% !important;
  }
}

/* 对话框样式 */
:deep(.el-dialog__header) {
  border-bottom: 1px solid #e8e8e8;
  padding: 16px 20px;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 12px;
}

:deep(.el-radio-button) {
  margin-right: 0;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-input) {
  width: 100%;
}

:deep(.el-dialog__footer) {
  border-top: 1px solid #e8e8e8;
  padding: 12px 20px;
}

.dialog-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
