import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 2500,
});

export const createUser = async (userData) => {
    const response = await api.post('/users', userData);
    return response.data
}