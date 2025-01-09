import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/Home.vue';
import SwaggerView from '../views/Swagger.vue';
import LoginView from '../views/Login.vue';
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
  },
  {
    path: '/swagger',
    name: 'Swagger',
    component: SwaggerView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
