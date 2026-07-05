import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '../../../store/mmkv';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  user: {
    id: string;
    userId: string;
    name: string;
    role: string;
    employeeId?: string | null;
    territory?: string | null;
    managerName?: string | null;
  } | null;
}

const savedUser = storage.getString('user');

const initialState: AuthState = {
  token: storage.getString('token') || null,
  isAuthenticated: !!storage.getString('token'),
  user: savedUser ? JSON.parse(savedUser) : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ token: string; user: AuthState['user'] }>) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      storage.set('token', action.payload.token);
      if (action.payload.user) {
        storage.set('user', JSON.stringify(action.payload.user));
      }
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      storage.clearAll();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
