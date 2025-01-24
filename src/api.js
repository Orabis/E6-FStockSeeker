import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 2500,
  withCredentials: true,
});

export const createUser = async (userData) => {
    const response = await api.post('/users', userData);
    const { access, refresh } = response.data;

    Cookies.set('refresh', refresh,{
        expires: 1,
        secure: true,
        sameSite: 'strict',
    });
    sessionStorage.setItem('access_token', access);
    return response.data
};

export const loginUser = async (userData) => {
    const response = await api.post('/token/', userData);
    const { access, refresh } = response.data;

    Cookies.set('refresh', refresh,{
        expires: 1,
        secure: true,
        sameSite: 'strict',
    });
    sessionStorage.setItem('access_token', access);
    return response.data;
};

export const updateUser = async (userData) => {
    const response = await api.put('/users/me/', userData, {
        headers: {Authorization: `Bearer ${sessionStorage.getItem('access_token')}`},
    });
    return response.data;
}
export const getuserinfo = async () => {
    const response = await api.get('/users/me/', {
        headers: {Authorization: `Bearer ${sessionStorage.getItem('access_token')}`},
    });
    return response.data;
};

export const createProduct = async (productData) => {
    const response = await api.post('/products/', productData, {
        headers: {Authorization: `Bearer ${sessionStorage.getItem('access_token')}`},
});
    return response.data;
};

export const  getProducts = async () => {
  const response = await api.get('/products/', {
      headers: {Authorization: `Bearer ${sessionStorage.getItem('access_token')}`},
});
  return response.data;
};

export const modifyProduct = async (productData, id) => {
  const response = await api.patch(`/products/${id}/`, productData, {
      headers: {Authorization: `Bearer ${sessionStorage.getItem('access_token')}`},
});
return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}/`, {
      headers: {Authorization: `Bearer ${sessionStorage.getItem('access_token')}`},
});
return response.data;
};

export const getWarehouses = async () => {
  const response = await api.get('/warehouses/', {
      headers: {Authorization: `Bearer ${sessionStorage.getItem('access_token')}`},
});
  return response.data;
};

export const createWarehouse = async (warehouseData) => {
  const response = await api.post('/warehouses/', warehouseData, {
      headers: {Authorization: `Bearer ${sessionStorage.getItem('access_token')}`},
});
  return response.data;
}

export const modifyWarehouse = async (warehouseData, id) => {
  const response = await api.patch(`/warehouses/${id}/`, warehouseData, {
      headers: {Authorization: `Bearer ${sessionStorage.getItem('access_token')}`},
});
  return response.data;
};

export const deleteWarehouse = async (id) => {
  const response = await api.delete(`/warehouses/${id}/`, {
      headers: {Authorization: `Bearer ${sessionStorage.getItem('access_token')}`},
});
  return response.data;
};
const refreshAccessToken = async () => {
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
  (response) => response, 
  async (error) => {
    if (error.response && error.response.status === 401) {
      const errorMessage = error.response.data.detail;
      if (errorMessage === "No active account found with the given credentials") {
        return Promise.reject(error);
      } else {
        const tokens = await refreshAccessToken();
        if (tokens) {
          const [newAccessToken, newRefreshToken] = tokens;
          Cookies.set('refresh', newRefreshToken, {
            expires: 1,
            secure: true,
            sameSite: 'strict',
          });
          error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(error.config);
        }
      }
    }
    return Promise.reject(error);
  }
);