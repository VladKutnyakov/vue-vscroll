import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      name: 'home',
      component: () => import ('@/pages/HomePage.vue'),
    },
    {
      path: '/examples',
      children: [
        {
          path: 'composable',
          children: [
            {
              path: 'vertical',
              name: 'examplesComposableVertical',
              component: () => import('@/pages/examples/composable/ComposableVertical.vue')
            },
            {
              
              path: 'horizontal',
              name: 'examplesComposableHorizontal',
              component: () => import('@/pages/examples/composable/ComposableHorizontal.vue')
            }
          ]
        }
      ]
    }
  ],
})

export default router
