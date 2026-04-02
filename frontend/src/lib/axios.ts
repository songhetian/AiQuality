import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

type WrappedApiResponse<T = unknown> = {
  code: number;
  message: string;
  data: T;
  timestamp: number;
};

function isWrappedApiResponse(value: unknown): value is WrappedApiResponse {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Record<string, unknown>;
  return (
    typeof payload.code === 'number' &&
    typeof payload.message === 'string' &&
    'data' in payload &&
    typeof payload.timestamp === 'number'
  );
}

// 创建 axios 实例
const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
});

// 请求拦截器：自动注入 JWT Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理 401 自动登出
api.interceptors.response.use(
  (response) => {
    if (isWrappedApiResponse(response.data)) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        error.userMessage = '请求超时，请检查后端、数据库或 Redis 服务状态';
      } else {
        error.userMessage = '无法连接到服务端，请确认后端服务已启动';
      }
    } else if (!error.response?.data?.message && error.response?.status >= 500) {
      error.userMessage = '服务暂时不可用，请稍后重试';
    }

    return Promise.reject(error);
  }
);

export default api;
