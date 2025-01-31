import { ref, onMounted } from 'vue';
import { getuserinfo, verifyCookie } from '../api.js';
import Cookies from 'js-cookie';
const isAuth = ref(false);
const userInfo = ref(null);

export function useAuth() {
  onMounted(async () => {
    const accessToken = verifyCookie();
    if (accessToken) {
      isAuth.value = true;
      try {
        userInfo.value = await getuserinfo();
      } catch (error) {
        if (error.response.status = 401){
          console.error('Expired access token logging out');
        } else {
          console.error('erreur inconnue déconnexion')
        }
        Cookies.remove('access_token');
        isAuth.value = false;
        userInfo.value = null;
      }
    }
  });

  const logout = () => {
    Cookies.remove('access_token');
    isAuth.value = false;
    userInfo.value = null;
  };

  return {
    isAuth,
    userInfo,
    logout,
  };
}