import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/Home.vue';
import SwaggerView from '../views/Swagger.vue';
import LoginView from '../views/Login.vue';
const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
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
  const isAuthenticate = sessionStorage.getItem('access_token');
  if (to.meta.requireAuth && !isAuthenticate || isAuthenticate === 'undefined' || isAuthenticate === 'null') {
    next({name: 'login'});
  } else next();
  })
export default router;
