<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { setLoggedIn } from '../router'
import { login } from '../api'

const router = useRouter()
const loading = ref(false)
const form = ref({
  username: '',
  password: ''
})

const loginHandle = async () => {
  if (!form.value.username) {
    ElMessage.error('请输入用户名')
    return
  }
  if (!form.value.password) {
    ElMessage.error('请输入密码')
    return
  }
  
  loading.value = true
  
  try {
    const response = await login({
      username: form.value.username,
      password: form.value.password
    })
    
    console.log('登录响应:', response.data)
    
    // 登录成功返回 { code: 200, message: '操作成功', data: { token, userId, username, roles, permissions } }
    if (response.data && response.data.code === 200 && response.data.data) {
      // 保存 token 到 localStorage
      const token = response.data.data.token
      if (token) {
        localStorage.setItem('token', token)
      }
      
      // 保存用户信息
      localStorage.setItem('userInfo', JSON.stringify(response.data.data))
      
      // 设置登录状态
      setLoggedIn(true)
      ElMessage.success('登录成功')
      router.push('/dashboard')
    } else {
      ElMessage.error(response.data.message || '登录失败')
    }
  } catch (error: any) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-form-card">
      <div class="login-header">
        <h1 class="login-title">物联网数据中台</h1>
        <p class="login-subtitle">请登录以访问系统</p>
      </div>
      
      <el-form :model="form" class="login-form">
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="用户名"
            prefix-icon="User"
            @keyup.enter="loginHandle"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="loginHandle"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            :loading="loading"
            @click="loginHandle"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="login-footer">
        <p>默认用户名: admin</p>
        <p>默认密码: admin</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0066cc 0%, #00b386 100%);
  padding: 20px;
}

.login-form-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  padding: 40px 30px;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a2b47;
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.login-form {
  margin-bottom: 20px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
}

.login-footer {
  text-align: center;
  font-size: 12px;
  color: #9ca3af;
  margin-top: 20px;
}

.login-footer p {
  margin: 4px 0;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-form-card {
    padding: 30px 20px;
  }
  
  .login-title {
    font-size: 20px;
  }
  
  .login-button {
    height: 44px;
    font-size: 14px;
  }
}
</style>