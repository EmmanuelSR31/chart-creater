import Vue from 'vue'
import Router from 'vue-router'
import iView from 'iview'
import {routers} from './router'

Vue.use(Router)

// 路由配置
const RouterConfig = {
  routes: routers
}

export const router = new Router(RouterConfig)

router.beforeEach((to, from, next) => {
  next()
})

router.afterEach((to) => {
  iView.LoadingBar.finish()
  window.scrollTo(0, 0)
})
