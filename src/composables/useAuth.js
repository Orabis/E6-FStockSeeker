import { ref, onMounted } from 'vue';
import { getuserinfo } from '../api.js';
import Cookies from 'js-cookie';

const isAuth = ref(false);
const userInfo = ref(null);

export function useAuth() {
  onMounted(async () => {
    const accessToken = sessionStorage.getItem('access_token');
    if (accessToken) {
      isAuth.value = true;
      try {
        userInfo.value = await getuserinfo();
      } catch (error) {
        console.error('Erreur de récupération des informations utilisateur :', error);
        isAuth.value = false;
        userInfo.value = null;
      }
    }
  });

  const logout = () => {
    sessionStorage.removeItem('access_token');
    Cookies.remove('refresh');
    isAuth.value = false;
    userInfo.value = null;
  };

  return {
    isAuth,
    userInfo,
    logout,
  };
}