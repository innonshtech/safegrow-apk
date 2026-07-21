import axios from 'axios';
import Config from 'react-native-config';
import { storage } from '../store/mmkv';
import { store } from '../store';
import { logout } from '../features/auth/store/authSlice';
import { globalToast } from '../components/ui/ToastProvider';

// Use Amplify API as default fallback
const baseURL = Config.API_URL || 'https://main.dsdfc7hjrjp5f.amplifyapp.com/api/v1';

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = storage.getString('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      if (error.response.status === 401) {
        // Clear token and force logout on 401
        storage.delete('token');
        store.dispatch(logout());
        globalToast.show({ message: 'Session expired. Please log in again.', type: 'error' });
      } else if (error.response.status >= 500) {
        globalToast.show({ message: 'Server error. Please try again later.', type: 'error' });
      }
      // Note: We deliberately DO NOT show global toasts for 400/403 
      // so individual screens can handle validation & auth errors inline.
    } else if (error.request) {
      // The request was made but no response was received (Network error)
      globalToast.show({ message: 'Network error. Please check your connection.', type: 'error' });
    } else {
      // Something happened in setting up the request
      globalToast.show({ message: 'An unexpected error occurred.', type: 'error' });
    }
    return Promise.reject(error);
  }
);
