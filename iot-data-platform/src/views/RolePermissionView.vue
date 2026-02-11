<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRoleStore } from '../stores/role'
import { usePermissionStore } from '../stores/permission'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const roleStore = useRoleStore()
const permissionStore = usePermissionStore()
const loading = ref(true)
const roleId = computed(() => route.params.id as string)

const selectedPermissions = ref<string[]>([])
const role = computed(() => roleStore.getRoleById(roleId.value))

onMounted(async () => {
  // 初始化数据
  loading.value = true
  try {
    await roleStore.initializeRoles()
    // 获取角色当前权限
    if (role.value) {
      selectedPermissions.value = role.value.permissions.map(p => p.id)
    }
  } finally {
    loading.value = false
  }
})

// 保存权限分配
const savePermissions = () => {
  if (roleId.value) {
    roleStore.assignPermissionsToRole(roleId.value, selectedPermissions.value)
    console.log('保存权限分配:', roleId.value, selectedPermissions.value)
    router.push('/roles')
  }
}

// 取消操作
const cancel = () => {
  router.push('/roles')
}

// 权限分类
const menuPermissions = computed(() => {
  return permissionStore.menuPermissions
})

const buttonPermissions = computed(() => {
  return permissionStore.buttonPermissions
})

// 全选/取消全选
const selectAll = (value: boolean) => {
  if (value) {
    selectedPermissions.value = permissionStore.permissions.map(p => p.id)
  } else {
    selectedPermissions.value = []
  }
}

// 检查是否全选
const isAllSelected = computed(() => {
  return selectedPermissions.value.length === permissionStore.permissions.length
})

// 检查权限是否被选中（预留）
// const isPermissionSelected = (id: string) => {
//   return selectedPermissions.value.includes(id)
// }
</script>

<template>
  <div class="role-permission-view">
    <div class="page-header">
      <el-button type="text" class="back-btn" @click="cancel">
        <el-icon><ArrowLeft /></el-icon>
        返回角色列表
      </el-button>
      <h1 class="page-title">{{ role?.name || '角色权限分配' }}</h1>
      <div class="header-actions">
        <el-button class="cancel-btn" @click="cancel">取消</el-button>
        <el-button type="primary" class="save-btn" @click="savePermissions">保存</el-button>
      </div>
    </div>

    <!-- 权限分配 -->
    <div class="permission-assignment card" v-loading="loading">
      <!-- 全选 -->
      <div class="permission-header">
        <el-checkbox v-model="isAllSelected" @change="selectAll">全选</el-checkbox>
      </div>

      <!-- 菜单权限 -->
      <div class="permission-section">
        <h3 class="section-title">菜单权限</h3>
        <el-checkbox-group v-model="selectedPermissions">
          <el-checkbox
            v-for="permission in menuPermissions"
            :key="permission.id"
            :label="permission.id"
            class="permission-item"
          >
            {{ permission.name }} ({{ permission.code }})
          </el-checkbox>
        </el-checkbox-group>
      </div>

      <!-- 按钮权限 -->
      <div class="permission-section">
        <h3 class="section-title">按钮权限</h3>
        <el-checkbox-group v-model="selectedPermissions">
          <el-checkbox
            v-for="permission in buttonPermissions"
            :key="permission.id"
            :label="permission.id"
            class="permission-item"
          >
            {{ permission.name }} ({{ permission.code }})
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>
  </div>
</template>

<style scoped>
.role-permission-view {
  padding: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  gap: 10px;
  margin-left: auto;
}

.permission-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eaeaea;
}

.permission-section {
  margin-bottom: 30px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #303133;
}

.permission-item {
  display: block;
  margin-bottom: 10px;
  width: 100%;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .header-actions {
    margin-left: 0;
    width: 100%;
    justify-content: space-between;
  }
}
</style>