import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../components/Layout.vue'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import DataStatistics from '../views/statistics/DataStatistics.vue'
import AIPrediction from '../views/prediction/AIPrediction.vue'
import NewDataPrediction from '../views/prediction/NewDataPrediction.vue'
import PredictionLayout from '../views/prediction/PredictionLayout.vue'
import ImageDataPrediction from '../views/prediction/ImageDataPrediction.vue'
import DataManagementLayout from '../views/management/DataManagementLayout.vue'
import IntegratedPage from '../views/integrated/IntegratedPage.vue'
import AddPatientData from '../views/management/AddPatientData.vue'
import EditPatientData from '../views/management/EditPatientData.vue'
import DeletePatientData from '../views/management/DeletePatientData.vue'



const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/old-home',
    name: 'OldHome',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    redirect: '/statistics',
    children: [
      {
        path: 'statistics',
        name: 'DataStatistics',
        component: DataStatistics,
        meta: { requiresAuth: true }
      },
      {
        path: 'prediction',
        name: 'PredictionLayout',
        component: PredictionLayout,
        redirect: '/prediction/existing',
        meta: { requiresAuth: true },
        children: [
          {
            path: 'new',
            name: 'NewDataPrediction',
            component: NewDataPrediction,
            meta: { requiresAuth: true }
          },
          {
            path: 'existing',
            name: 'ExistingDataPrediction',
            component: AIPrediction,
            meta: { requiresAuth: true }
          },
          { path: 'image', name: 'ImageDataPrediction', component: ImageDataPrediction, meta: { requiresAuth: true } }
        ]
      },
      {
        path: 'management',
        name: 'DataManagementLayout',
        component: DataManagementLayout,
        meta: { requiresAuth: true },
        children: [
          {
            path: 'add',
            name: 'AddPatientData',
            component: AddPatientData,
            meta: { requiresAuth: true }
          },
          {
            path: 'edit',
            name: 'EditPatientData',
            component: EditPatientData,
            meta: { requiresAuth: true }
          },
          {
            path: 'delete',
            name: 'DeletePatientData',
            component: DeletePatientData,
            meta: { requiresAuth: true }
          }
        ]
      },
      {
        path: 'integrated',
        name: 'IntegratedPage',
        component: IntegratedPage,
        meta: { requiresAuth: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user')
  if (to.meta.requiresAuth && !user) {
    next('/login')
  } else {
    next()
  }
})

export default router
