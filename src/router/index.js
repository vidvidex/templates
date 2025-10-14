import { createRouter, createWebHistory } from 'vue-router'
import AXI_lite from '../views/AXI_Lite.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/axi-lite',
    },
    {
      path: '/axi-lite',
      name: 'axi-lite',
      component: AXI_lite,
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

export default router
