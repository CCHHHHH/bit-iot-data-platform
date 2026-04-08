<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '../api'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const form = ref({
  username: '',
  password: ''
})

const loginHandle = async () => {
  if (!form.value.username) { ElMessage.error('请输入用户名'); return }
  if (!form.value.password) { ElMessage.error('请输入密码');  return }

  loading.value = true
  try {
    const response = await login({ username: form.value.username, password: form.value.password })
    if (response.data?.code === 200 && response.data?.data) {
      const { token } = response.data.data
      if (token) localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(response.data.data))
      ElMessage.success('登录成功')
      const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/dashboard'
      router.push(redirect)
    } else {
      ElMessage.error(response.data?.message || '登录失败')
    }
  } catch (error: any) {
    console.error('登录失败:', error)
    ElMessage.error('网络异常，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <!-- Background decoration -->
    <div class="login-bg">
      <div class="bg-circle bg-circle--1"></div>
      <div class="bg-circle bg-circle--2"></div>
      <div class="bg-circle bg-circle--3"></div>
      <!-- Grid dots -->
      <div class="bg-grid"></div>
    </div>

    <!-- Left panel - brand -->
    <div class="login-brand">
      <div class="brand-content">
        <div class="brand-logo">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="28" cy="28" r="26" stroke="url(#lg1)" stroke-width="2" opacity="0.5"/>
            <circle cx="28" cy="28" r="18" stroke="url(#lg1)" stroke-width="1.5" stroke-dasharray="5 3" opacity="0.3"/>
            <circle cx="28" cy="10" r="5" fill="url(#lg2)"/>
            <circle cx="44" cy="38" r="5" fill="url(#lg2)"/>
            <circle cx="12" cy="38" r="5" fill="url(#lg2)"/>
            <circle cx="28" cy="28" r="7" fill="url(#lg3)"/>
            <line x1="28" y1="15" x2="28" y2="21" stroke="#06B6D4" stroke-width="1.5"/>
            <line x1="40" y1="35" x2="34" y2="31" stroke="#06B6D4" stroke-width="1.5"/>
            <line x1="16" y1="35" x2="22" y2="31" stroke="#06B6D4" stroke-width="1.5"/>
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop stop-color="#1668DC"/><stop offset="1" stop-color="#06B6D4"/>
              </linearGradient>
              <linearGradient id="lg2" x1="0" y1="0" x2="10" y2="10" gradientUnits="userSpaceOnUse">
                <stop stop-color="#4096FF"/><stop offset="1" stop-color="#06B6D4"/>
              </linearGradient>
              <linearGradient id="lg3" x1="21" y1="21" x2="35" y2="35" gradientUnits="userSpaceOnUse">
                <stop stop-color="#1668DC"/><stop offset="1" stop-color="#22D3EE"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h1 class="brand-title">物联网数据中台</h1>
        <p class="brand-subtitle">IoT Data Command Center</p>
        <div class="brand-features">
          <div class="brand-feature">
            <span class="feature-dot"></span>
            实时设备监控与数据采集
          </div>
          <div class="brand-feature">
            <span class="feature-dot"></span>
            智能告警与规则引擎
          </div>
          <div class="brand-feature">
            <span class="feature-dot"></span>
            统一权限与用户管理
          </div>
        </div>
      </div>
    </div>

    <!-- Right panel - form -->
    <div class="login-form-panel">
      <div class="login-card">
        <div class="login-card__header">
          <h2 class="login-card__title">欢迎登录</h2>
          <p class="login-card__desc">请输入您的账号信息</p>
        </div>

        <el-form :model="form" class="login-form" @submit.prevent="loginHandle">
          <el-form-item>
            <div class="form-field">
              <label class="form-label">用户名</label>
              <el-input
                v-model="form.username"
                placeholder="请输入用户名"
                prefix-icon="User"
                size="large"
                @keyup.enter="loginHandle"
              />
            </div>
          </el-form-item>
          <el-form-item>
            <div class="form-field">
              <label class="form-label">密码</label>
              <el-input
                v-model="form.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                size="large"
                show-password
                @keyup.enter="loginHandle"
              />
            </div>
          </el-form-item>
          <el-form-item style="margin-bottom: 0;">
            <el-button
              type="primary"
              class="login-submit"
              :loading="loading"
              @click="loginHandle"
            >
              {{ loading ? '登录中...' : '立即登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <div class="login-hint">
          <span>默认账号：admin</span>
          <span class="hint-sep">·</span>
          <span>默认密码：123456</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Page layout ──────────────────────────────────────────────── */
.login-page {
  min-height: 100vh;
  display: flex;
  overflow: hidden;
  position: relative;
  background: #0B1F3A;
}

/* ── Background decoration ────────────────────────────────────── */
.login-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
}
.bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.12;
}
.bg-circle--1 {
  width: 600px; height: 600px;
  background: #1668DC;
  top: -200px; left: -100px;
  animation: float-a 8s ease-in-out infinite;
}
.bg-circle--2 {
  width: 400px; height: 400px;
  background: #06B6D4;
  bottom: -100px; left: 200px;
  animation: float-b 10s ease-in-out infinite;
}
.bg-circle--3 {
  width: 300px; height: 300px;
  background: #6366F1;
  top: 100px; right: 100px;
  animation: float-a 12s ease-in-out infinite reverse;
}
@keyframes float-a {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(20px, -30px); }
}
@keyframes float-b {
  0%, 100% { transform: translate(0, 0); }
  50%       { transform: translate(-25px, 20px); }
}

/* ── Brand panel (left) ───────────────────────────────────────── */
.login-brand {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
  z-index: 1;
}
.brand-content {
  max-width: 380px;
  animation: slide-in-left 0.6s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
}
.brand-logo {
  width: 72px; height: 72px;
  background: rgba(6,182,212,0.10);
  border: 1px solid rgba(6,182,212,0.25);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  animation: logo-breathe 3s ease-in-out infinite;
}
@keyframes logo-breathe {
  0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.3); }
  50%       { box-shadow: 0 0 0 10px rgba(6,182,212,0); }
}
.brand-title {
  font-size: 32px;
  font-weight: 800;
  color: #F0F9FF;
  letter-spacing: -0.5px;
  margin-bottom: 8px;
  line-height: 1.2;
}
.brand-subtitle {
  font-size: 14px;
  color: rgba(255,255,255,0.40);
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 40px;
}
.brand-features { display: flex; flex-direction: column; gap: 14px; }
.brand-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255,255,255,0.55);
}
.feature-dot {
  width: 6px; height: 6px;
  background: #06B6D4;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 6px rgba(6,182,212,0.6);
}

/* ── Form panel (right) ───────────────────────────────────────── */
.login-form-panel {
  width: 440px;
  min-width: 400px;
  background: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  position: relative;
  z-index: 1;
  box-shadow: -20px 0 60px rgba(0,0,0,0.20);
  animation: slide-in-right 0.5s cubic-bezier(0.34,1.56,0.64,1);
}
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
}
.login-card { width: 100%; max-width: 340px; }
.login-card__header { margin-bottom: 32px; }
.login-card__title {
  font-size: 26px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
  letter-spacing: -0.5px;
}
.login-card__desc { font-size: 14px; color: #6B7280; }

/* Form fields */
.login-form :deep(.el-form-item) { margin-bottom: 18px !important; }
.form-field { width: 100%; }
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 7px;
}
.login-form :deep(.el-input__wrapper) {
  border-radius: 10px !important;
  padding: 0 14px !important;
  height: 46px !important;
}
.login-form :deep(.el-input__inner) { font-size: 14px !important; }

.login-submit {
  width: 100%;
  height: 46px !important;
  font-size: 15px !important;
  font-weight: 600 !important;
  border-radius: 10px !important;
  background: linear-gradient(135deg, #1668DC 0%, #06B6D4 100%) !important;
  border: none !important;
  letter-spacing: 0.5px;
  margin-top: 4px;
  box-shadow: 0 4px 20px rgba(22,104,220,0.35) !important;
  transition: all 0.25s ease !important;
}
.login-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(22,104,220,0.45) !important;
}

.login-hint {
  text-align: center;
  margin-top: 24px;
  font-size: 12px;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.hint-sep { color: #D1D5DB; }

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 768px) {
  .login-page     { flex-direction: column; }
  .login-brand    { display: none; }
  .login-form-panel {
    width: 100%; min-width: unset;
    box-shadow: none;
    background: #0B1F3A;
  }
  .login-card__title { color: #F0F9FF; }
  .login-card__desc  { color: rgba(255,255,255,0.5); }
  .form-label        { color: rgba(255,255,255,0.7); }
  .login-hint        { color: rgba(255,255,255,0.35); }
}
</style>
