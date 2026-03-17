<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { HomeFilled, Monitor, Warning, Menu, DataAnalysis, Connection, User, UserFilled, Key } from '@element-plus/icons-vue'

const router = useRouter()
const isCollapse = ref(false)

const menuItems = [
  {
    path: '/dashboard',
    icon: HomeFilled,
    title: '数据仪表盘'
  },
  {
    path: '/devices',
    icon: Monitor,
    title: '设备管理'
  },
  {
    path: '/alerts',
    icon: Warning,
    title: '告警管理'
  },
  {
    path: '/rules',
    icon: DataAnalysis,
    title: '规则引擎'
  },
  {
    path: '/integrations',
    icon: Connection,
    title: '设备集成'
  },
  {
    path: '/users',
    icon: User,
    title: '用户管理'
  },
  {
    path: '/roles',
    icon: UserFilled,
    title: '角色管理'
  },
  {
    path: '/permissions',
    icon: Key,
    title: '权限管理'
  }
]
</script>

<template>
  <!-- 登录页面 -->
  <template v-if="router.currentRoute.value.path === '/login'">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </template>
  
  <!-- 主应用 -->
  <div v-else class="app-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="sidebar" :class="{ 'collapsed': isCollapse }">
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" stroke="url(#logo-gradient)" stroke-width="2"/>
              <path d="M8 16H24" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
              <path d="M16 8V24" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
              <circle cx="16" cy="16" r="4" fill="#0066cc"/>
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#0066cc"/>
                  <stop offset="1" stop-color="#00b386"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 class="logo">物联网数据中台</h1>
        </div>
      </div>
      <el-menu
        :default-active="router.currentRoute.value.path"
        class="sidebar-menu"
        @select="(key: string) => router.push(key)"
      >
        <template v-for="item in menuItems" :key="item.path">
          <!-- 所有项都是无子菜单的顶级项 -->
          <el-menu-item :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header height="60px" class="header">
        <el-button 
          type="text" 
          class="collapse-btn" 
          @click="isCollapse = !isCollapse"
        >
          <el-icon><Menu /></el-icon>
        </el-button>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar size="small">Admin</el-avatar>
              <span>管理员</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>个人中心</el-dropdown-item>
                <el-dropdown-item>设置</el-dropdown-item>
                <el-dropdown-item>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区 -->
      <el-main class="content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #0a1929;
  color: #1e00ffff;
  transition: width 0.3s;
  background-image: linear-gradient(180deg, #0a1929 0%, #0f2a44 100%);
}

.sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  padding: 24px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 102, 204, 0.2);
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 102, 204, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 102, 204, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 102, 204, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 102, 204, 0);
  }
}

.logo {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  color: #ffffff;
  text-shadow: 0 0 10px rgba(0, 102, 204, 0.3);
  letter-spacing: 1px;
}

.sidebar.collapsed .logo {
  font-size: 0;
}

.sidebar.collapsed .logo-container {
  gap: 0;
}

.sidebar-menu {
  border-right: none;
  background-color: transparent;
}

.sidebar-menu .el-menu-item {
  height: 64px;
  line-height: 64px;
  margin: 8px 12px;
  border-radius: 10px;
  color: #e6f1ff;
  transition: all 0.3s ease;
  font-size: 14px;
}

.sidebar-menu .el-menu-item:hover {
  color: #ffffff;
  background-color: rgba(0, 102, 204, 0.2);
}

.sidebar-menu .el-menu-item.is-active {
  background-color: rgba(0, 102, 204, 0.3);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
}

.sidebar-menu .el-sub-menu__title {
  height: 64px;
  line-height: 64px;
  margin: 8px 12px;
  border-radius: 10px;
  color: #e6f1ff;
  transition: all 0.3s ease;
  font-size: 14px;
}

.sidebar-menu .el-sub-menu__title:hover {
  color: #ffffff;
  background-color: rgba(0, 102, 204, 0.2);
}



.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--background-light);
}

.header {
  background-color: var(--background-white);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-color);
}

.collapse-btn {
  margin-right: 24px;
  color: var(--text-primary);
  font-size: 18px;
}

.collapse-btn:hover {
  color: var(--primary-color);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  background-color: rgba(0, 102, 204, 0.05);
}

.user-info:hover {
  background-color: rgba(0, 102, 204, 0.1);
}

.user-info span {
  margin-left: 12px;
  color: var(--text-primary);
  font-weight: 500;
}

.content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>
