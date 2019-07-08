import Main from '@/page/main.vue'

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
  path: '/login',
  name: 'login',
  meta: {
    title: 'Login - 登录'
  },
  component: resolve => { require(['@/page/login.vue'], resolve) }
}

export const page404 = {
  path: '/*',
  name: 'error-404',
  meta: {
    title: '404-页面不存在'
  },
  component: resolve => { require(['@/page/error-page/404.vue'], resolve) }
}

export const page403 = {
  path: '/403',
  meta: {
    title: '403-权限不足'
  },
  name: 'error-403',
  component: resolve => { require(['@/page/error-page/403.vue'], resolve) }
}

export const page500 = {
  path: '/500',
  meta: {
    title: '500-服务端错误'
  },
  name: 'error-500',
  component: resolve => { require(['@/page/error-page/500.vue'], resolve) }
}

// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
  path: '/',
  name: 'otherRouter',
  redirect: '/home',
  component: Main,
  children: [
    { path: 'home', title: {i18n: 'home'}, name: 'home', component: resolve => { require(['@/page/home/home.vue'], resolve) } },
    { path: 'ownspace', title: '个人中心', name: 'ownspace', component: resolve => { require(['@/page/own-space/own-space.vue'], resolve) } }
  ]
}

// 作为Main组件的子页面展示并且在左侧菜单显示的路由写在appRouter里
export const appRouter = [
  {
    path: '/chartsManage',
    icon: 'md-cog',
    name: 'chartsManage',
    title: '系统管理',
    component: Main,
    children: [
      {
        path: '/chartsManage',
        icon: 'compose',
        name: 'chartsManage',
        title: '图表管理',
        component: resolve => { require(['@/page/chartsManage/chartsManage.vue'], resolve) }
      },
      {
        path: '/editDash',
        icon: 'compose',
        name: 'editDash',
        title: '看板管理',
        component: resolve => { require(['@/page/chartsManage/editDash.vue'], resolve) }
      }
    ]
  }
]

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
  loginRouter,
  otherRouter,
  ...appRouter,
  page500,
  page403,
  page404
]
