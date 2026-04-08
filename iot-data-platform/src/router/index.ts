import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginView.vue'),
      meta: {
        title: '登录'
      }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: {
        title: '数据仪表盘'
      }
    },
    {
      path: '/devices',
      name: 'Devices',
      component: () => import('../views/DeviceManagementView.vue'),
      meta: {
        title: '设备管理'
      }
    },
    {
      path: '/device/:id',
      name: 'DeviceDetail',
      component: () => import('../views/DeviceDetailView.vue'),
      meta: {
        title: '设备详情'
      }
    },
    {
      path: '/alerts',
      name: 'Alerts',
      component: () => import('../views/AlertManagementView.vue'),
      meta: {
        title: '告警管理'
      }
    },
    {
      path: '/users',
      name: 'Users',
      component: () => import('../views/UserManagementView.vue'),
      meta: {
        title: '用户管理'
      }
    },
    {
      path: '/roles',
      name: 'Roles',
      component: () => import('../views/RoleManagementView.vue'),
      meta: {
        title: '角色管理'
      }
    },
    {
      path: '/permissions',
      name: 'Permissions',
      component: () => import('../views/PermissionManagementView.vue'),
      meta: {
        title: '权限管理'
      }
    },
    {
      path: '/role/:id/permission',
      name: 'RolePermission',
      component: () => import('../views/RolePermissionView.vue'),
      meta: {
        title: '角色权限分配'
      }
    },
    {
      path: '/rules',
      name: 'Rules',
      component: () => import('../views/RuleEngineView.vue'),
      meta: {
        title: '规则引擎'
      }
    },
    {
      path: '/rules/:id',
      name: 'RuleDetail',
      component: () => import('../views/RuleDetailView.vue'),
      meta: {
        title: '规则详情'
      }
    },
    {
      path: '/integrations',
      name: 'Integrations',
      component: () => import('../views/DeviceIntegrationView.vue'),
      meta: {
        title: '设备集成'
      }
    },
    {
      path: '/device-catalogs',
      name: 'DeviceCatalogs',
      component: () => import('../views/DeviceCatalogView.vue'),
      meta: {
        title: '设备目录管理'
      }
    }
  ]
})

router.beforeEach((to, _from, next) => {
  document.title = to.meta.title as string || '物联网数据中台'

  const token = localStorage.getItem('token')
  const isLoginRoute = to.path === '/login'
  const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : '/dashboard'

  if (isLoginRoute) {
    if (token) {
      next(redirect)
    } else {
      next()
    }
    return
  }

  if (!token) {
    next({
      path: '/login',
      query: {
        redirect: to.fullPath
      }
    })
    return
  }

  next()
})

export default router
