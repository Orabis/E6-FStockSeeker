import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/Home.vue';
import SwaggerView from '../views/Swagger.vue';
import LoginView from '../views/Login.vue';
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
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

export default router;
