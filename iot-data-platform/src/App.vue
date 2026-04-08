<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  HomeFilled, Monitor, Warning, DataAnalysis, Connection,
  User, UserFilled, Key, Expand, Fold, ArrowDown
} from '@element-plus/icons-vue'
import { logout } from './api/index'
import ThemeToggle from './components/ThemeToggle.vue'

const router = useRouter()
const route  = useRoute()
const isCollapse = ref(false)

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '退出确认', {
      confirmButtonText: '退出',
      cancelButtonText: '取消',
      type: 'warning'
    })
    try {
      await logout()
    } catch {
      // 即使接口失败也继续执行本地退出
    }
    localStorage.removeItem('token')
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {
    // 用户点取消，不做任何处理
  }
}

/* ── Menu structure with groups ── */
const menuGroups = [
  {
    label: '概览',
    items: [
      { path: '/dashboard',    icon: HomeFilled,   title: '数据仪表盘' }
    ]
  },
  {
    label: '设备中心',
    items: [
      { path: '/devices',      icon: Monitor,      title: '设备管理'   },
      { path: '/integrations', icon: Connection,   title: '设备集成'   }
    ]
  },
  {
    label: '监控告警',
    items: [
      { path: '/alerts',       icon: Warning,      title: '告警管理'   },
      { path: '/rules',        icon: DataAnalysis, title: '规则引擎'   }
    ]
  },
  {
    label: '系统管理',
    items: [
      { path: '/users',        icon: User,         title: '用户管理'   },
      { path: '/roles',        icon: UserFilled,   title: '角色管理'   },
      { path: '/permissions',  icon: Key,          title: '权限管理'   }
    ]
  }
]

/* ── Page title computed from route ── */
const titleMap: Record<string, string> = {
  '/dashboard':    '数据仪表盘',
  '/devices':      '设备管理',
  '/alerts':       '告警管理',
  '/rules':        '规则引擎',
  '/integrations': '设备集成',
  '/users':        '用户管理',
  '/roles':        '角色管理',
  '/permissions':  '权限管理',
  '/device-catalogs': '设备目录'
}
const currentPageTitle = computed(() => {
  const p = route.path
  if (p.startsWith('/device/')) return '设备详情'
  return titleMap[p] || '物联网数据中台'
})
</script>

<template>
  <!-- 登录页 -->
  <template v-if="route.path === '/login'">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </template>

  <!-- 主布局 -->
  <div v-else class="app-container">

    <!-- ── 侧边栏 ── -->
    <aside class="sidebar" :class="{ collapsed: isCollapse }">

      <!-- Logo -->
      <div class="sidebar-logo">
        <div class="sidebar-logo__icon">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <!-- Outer ring -->
            <circle cx="14" cy="14" r="12.5" stroke="url(#sg1)" stroke-width="1.5" opacity="0.6"/>
            <!-- Inner nodes -->
            <circle cx="14" cy="6"  r="2.5" fill="#06B6D4"/>
            <circle cx="22" cy="20" r="2.5" fill="#06B6D4"/>
            <circle cx="6"  cy="20" r="2.5" fill="#06B6D4"/>
            <!-- Hub -->
            <circle cx="14" cy="14" r="3.5" fill="url(#sg2)"/>
            <!-- Connection lines -->
            <line x1="14" y1="8.5"  x2="14" y2="11"  stroke="#06B6D4" stroke-width="1.2" opacity="0.8"/>
            <line x1="20" y1="18.5" x2="16.5" y2="16" stroke="#06B6D4" stroke-width="1.2" opacity="0.8"/>
            <line x1="8"  y1="18.5" x2="11.5" y2="16" stroke="#06B6D4" stroke-width="1.2" opacity="0.8"/>
            <defs>
              <linearGradient id="sg1" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stop-color="#1668DC"/><stop offset="1" stop-color="#06B6D4"/>
              </linearGradient>
              <linearGradient id="sg2" x1="14" y1="10.5" x2="14" y2="17.5" gradientUnits="userSpaceOnUse">
                <stop stop-color="#4096FF"/><stop offset="1" stop-color="#06B6D4"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <transition name="logo-fade">
          <div v-show="!isCollapse" class="sidebar-logo__text">
            <span class="logo-title">IoT 数据中台</span>
            <span class="logo-sub">Command Center</span>
          </div>
        </transition>
      </div>

      <!-- Navigation -->
      <nav class="sidebar-nav">
        <el-menu
          :default-active="route.path"
          :collapse="isCollapse"
          :collapse-transition="false"
          class="sidebar-menu"
          @select="(key: string) => router.push(key)"
        >
          <template v-for="group in menuGroups" :key="group.label">
            <!-- Group label (hidden when collapsed) -->
            <div v-show="!isCollapse" class="menu-group-label">{{ group.label }}</div>

            <el-menu-item
              v-for="item in group.items"
              :key="item.path"
              :index="item.path"
              class="sidebar-item"
            >
              <el-icon class="sidebar-item__icon"><component :is="item.icon" /></el-icon>
              <template #title>
                <span class="sidebar-item__label">{{ item.title }}</span>
              </template>
            </el-menu-item>
          </template>
        </el-menu>
      </nav>

      <!-- System status badge at bottom -->
      <div v-show="!isCollapse" class="sidebar-footer">
        <div class="sys-status">
          <span class="status-dot online"></span>
          <span class="sys-status__text">系统运行正常</span>
        </div>
      </div>
    </aside>

    <!-- ── 主内容 ── -->
    <div class="main-wrapper">

      <!-- Header -->
      <header class="app-header">
        <div class="header-left">
          <button class="collapse-btn" @click="isCollapse = !isCollapse" :title="isCollapse ? '展开菜单' : '收起菜单'">
            <el-icon :size="17"><Expand v-if="isCollapse" /><Fold v-else /></el-icon>
          </button>
          <div class="header-divider"></div>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>物联网数据中台</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentPageTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <div class="header-sys-status">
            <span class="status-dot online" style="margin-right:6px;"></span>
            <span class="header-sys-text">运行正常</span>
          </div>

          <ThemeToggle />

          <div class="header-divider"></div>

          <el-dropdown placement="bottom-end">
            <div class="user-trigger">
              <el-avatar :size="30" class="user-avatar">A</el-avatar>
              <span class="user-name">管理员</span>
              <el-icon class="user-arrow" :size="13"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>系统设置</el-dropdown-item>
                <el-dropdown-item divided style="color:#EF4444" @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- Page content -->
      <main class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ── App Layout ───────────────────────────────────────────────── */
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: var(--clr-page-bg);
}

/* ── Sidebar ──────────────────────────────────────────────────── */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: var(--clr-sidebar);
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  transition: width var(--ease-md), min-width var(--ease-md);
  position: relative;
  z-index: 100;
  /* Subtle top-right glow */
  box-shadow: 2px 0 20px rgba(0,0,0,0.18);
}
.sidebar.collapsed {
  width: 64px;
  min-width: 64px;
}
.sidebar.collapsed .menu-group-label { display: none; }

/* Logo area */
.sidebar-logo {
  padding: 20px 16px 16px;
  display: flex;
  align-items: center;
  gap: 11px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.sidebar-logo__icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(6,182,212,0.12);
  border: 1px solid rgba(6,182,212,0.25);
  border-radius: 10px;
  flex-shrink: 0;
  animation: logo-breathe 3s ease-in-out infinite;
}
@keyframes logo-breathe {
  0%, 100% { box-shadow: 0 0 0 0 rgba(6,182,212,0.3); }
  50%       { box-shadow: 0 0 0 6px rgba(6,182,212,0); }
}
.sidebar-logo__text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.logo-title {
  font-size: 14px;
  font-weight: 700;
  color: #F0F9FF;
  white-space: nowrap;
  letter-spacing: 0.3px;
}
.logo-sub {
  font-size: 10px;
  color: rgba(255,255,255,0.35);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  white-space: nowrap;
  margin-top: 1px;
}

/* Collapse animation for logo text */
.logo-fade-enter-active, .logo-fade-leave-active { transition: opacity 0.15s ease, width 0.2s ease; overflow: hidden; }
.logo-fade-enter-from, .logo-fade-leave-to { opacity: 0; }

/* Navigation */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 0 8px;
}
.sidebar-nav::-webkit-scrollbar { width: 3px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }

/* Override el-menu styling */
.sidebar-menu {
  border-right: none !important;
  background: transparent !important;
  width: 100% !important;
}
:deep(.el-menu--collapse) { width: 64px !important; }

/* Group labels */
.menu-group-label {
  font-size: 10px;
  font-weight: 600;
  color: rgba(255,255,255,0.25);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  padding: 14px 18px 4px;
  user-select: none;
}

/* Menu items */
:deep(.el-menu-item) {
  height: 42px !important;
  line-height: 42px !important;
  margin: 1px 10px !important;
  border-radius: 8px !important;
  color: rgba(255,255,255,0.60) !important;
  transition: all var(--ease) !important;
  padding: 0 14px !important;
  position: relative;
  overflow: hidden;
}
:deep(.el-menu-item:hover) {
  background: rgba(255,255,255,0.06) !important;
  color: rgba(255,255,255,0.90) !important;
}
:deep(.el-menu-item.is-active) {
  background: rgba(22,104,220,0.18) !important;
  color: #93C5FD !important;
}
:deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  background: var(--clr-accent);
  border-radius: 0 3px 3px 0;
}
:deep(.el-menu-item .el-icon) {
  font-size: 16px !important;
  margin-right: 10px !important;
  width: 16px !important;
}

/* Collapsed tooltip */
:deep(.el-menu--collapse .el-menu-item) {
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
:deep(.el-menu--collapse .el-menu-item .el-icon) {
  margin-right: 0 !important;
  font-size: 18px !important;
}

/* Sidebar footer */
.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}
.sys-status {
  display: flex;
  align-items: center;
  gap: 7px;
}
.sys-status__text {
  font-size: 12px;
  color: rgba(255,255,255,0.40);
}

/* ── Header ───────────────────────────────────────────────────── */
.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.app-header {
  height: 56px;
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--clr-border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
  box-shadow: var(--shadow-xs);
  z-index: 50;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--clr-text-secondary);
  transition: all var(--ease);
  flex-shrink: 0;
}
.collapse-btn:hover {
  background: var(--clr-primary-bg);
  color: var(--clr-primary);
}

.header-divider {
  width: 1px;
  height: 20px;
  background: var(--clr-border);
  flex-shrink: 0;
}

.header-sys-status {
  display: flex;
  align-items: center;
}
.header-sys-text {
  font-size: 12px;
  color: var(--clr-text-muted);
}

/* User dropdown trigger */
.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 10px 5px 4px;
  border-radius: 22px;
  transition: background var(--ease);
  user-select: none;
}
.user-trigger:hover { background: var(--clr-primary-bg); }
.user-avatar {
  background: linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-accent) 100%) !important;
  font-size: 12px !important;
  font-weight: 700 !important;
  flex-shrink: 0;
}
.user-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--clr-text-primary);
}
.user-arrow { color: var(--clr-text-muted); }

/* ── Content ──────────────────────────────────────────────────── */
.app-content {
  flex: 1;
  overflow-y: auto;
  padding: 22px 24px;
  min-height: 0;
  background: var(--clr-page-bg);
}
</style>
