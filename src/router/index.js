import { createRouter, createWebHistory } from 'vue-router';
import ProductsView from '../views/Products.vue';
import SwaggerView from '../views/Swagger.vue';
import LoginView from '../views/Login.vue';
import DashboardView from '../views/Dashboard.vue';
import WarehousesView from '../views/Warehouses.vue';
import { verifyCookie } from '../api.js';
const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      requireAuth: true,
    },
  },
  {
    path: '/products',
    name: 'products',
    component: ProductsView,
    meta: {
      requireAuth: true,
    },
  },
  {
    path: '/warehouses',
    name: 'warehouses',
    component: WarehousesView,
    meta: {
      requireAuth: true,
    },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/swagger',
    name: 'swagger',
    component: SwaggerView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to,from,next) => {
  const isAuthenticate = verifyCookie();
  if (to.meta.requireAuth && !isAuthenticate || isAuthenticate === 'undefined' || isAuthenticate === 'null') {
    next({name: 'login'});
  } else next();
  })
export default router;
