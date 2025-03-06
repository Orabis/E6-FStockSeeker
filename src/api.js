import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 2500,
  withCredentials: true,
});

export const createUser = async (userData) => {
    const response = await api.post('/users', userData);
    const accessToken = response.data.access;

    Cookies.set('access_token', accessToken,{
        expires: 1,
        secure: true,
        sameSite: 'lax',
    });
    return response.data
};

export const loginUser = async (userData) => {
    const response = await api.post('/token/', userData);
    const accessToken = response.data.access;
    Cookies.set('access_token', accessToken,{
        expires: 1,
        secure: true,
        sameSite: 'lax',
    });
    return response.data;
};

export const updateUser = async (userData) => {
    const cookie = verifyCookie();
    const response = await api.put('/users/me/', userData, {
        headers: {Authorization: `Bearer ${cookie}`},
    });
    return response.data;
}
export const getuserinfo = async () => {
    const cookie = verifyCookie();
    const response = await api.get('/users/me/', {
        headers: {Authorization: `Bearer ${cookie}`},
    });
    return response.data;
};

export const createProduct = async (productData) => {
    const cookie = verifyCookie();
    const response = await api.post('/products/', productData, {
        headers: {Authorization: `Bearer ${cookie}`},
});
    return response.data;
};

export const  getProducts = async () => {
  const cookie = verifyCookie();
  const response = await api.get('/products/', {
      headers: {Authorization: `Bearer ${cookie}`},
});
  return response.data;
};

export const modifyProduct = async (productData, id) => {
  const cookie = verifyCookie();
  const response = await api.patch(`/products/${id}/`, productData, {
      headers: {Authorization: `Bearer ${cookie}`},
});
return response.data;
};

export const deleteProduct = async (id) => {
  const cookie = verifyCookie();
  const response = await api.delete(`/products/${id}/`, {
      headers: {Authorization: `Bearer ${cookie}`},
});
return response.data;
};

export const getWarehouses = async () => {
  const cookie = verifyCookie();
  const response = await api.get('/warehouses/', {
      headers: {Authorization: `Bearer ${cookie}`},
});
  return response.data;
};

export const createWarehouse = async (warehouseData) => {
  const cookie = verifyCookie();
  const response = await api.post('/warehouses/', warehouseData, {
      headers: {Authorization: `Bearer ${cookie}`},
});
  return response.data;
}

export const modifyWarehouse = async (warehouseData, id) => {
  const cookie = verifyCookie();
  const response = await api.patch(`/warehouses/${id}/`, warehouseData, {
      headers: {Authorization: `Bearer ${cookie}`},
});
  return response.data;
};

export const deleteWarehouse = async (id) => {
  const cookie = verifyCookie();
  const response = await api.delete(`/warehouses/${id}/`, {
      headers: {Authorization: `Bearer ${cookie}`},
});
  return response.data;
};

export function verifyCookie() {
  const accessToken = Cookies.get("access_token");
  if (accessToken) {
    return accessToken
  } else {
    return null
  }
}
/* const refreshAccessToken = async () => {
  try {
    const response = await api.post('/token/refresh', {'refresh': Cookies.get('refresh')}, {
      withCredentials: true, 
    });

    const { access, refresh } = response.data;
    
    return [access, refresh];
  } catch (error) {
    console.error('Refresh token request failed:', error);
    return null;
  }
};


api.interceptors.response.use(
  (response) => {
    const cookie = Cookies.get('refresh');
    console.log(cookie);
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
*/