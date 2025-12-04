import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import Goals from '../views/Goals.vue';
import Login from '../components/Login.vue';
import Transactions from '../views/Transactions.vue';
import Settings from '../views/Settings.vue';

// Guard sederhana: Cek token sebelum masuk
const requireAuth = (to, from, next) => {
  const token = localStorage.getItem('token');
  if (!token) next('/login');
  else next();
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/settings',
      name: 'settings',
      component: Settings,
      beforeEnter: requireAuth,
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: Transactions,
      beforeEnter: requireAuth,
    },

    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard,
      beforeEnter: requireAuth,
    },
    {
      path: '/goals',
      name: 'goals',
      component: Goals,
      beforeEnter: requireAuth,
    },
  ],
});

export default router;
