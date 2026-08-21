import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '../../../store/mmkv';
import { logout } from '../../auth/store/authSlice';

interface AttendanceState {
  isCheckedIn: boolean;
  checkInTime: string | null;
  checkInTimestamp: string | null;
  attendanceId: string | null;
  visitsCount: number;
  distanceKm: number;
  hoursTracked: number;
}

const storedTimestamp = storage.getString('checkInTimestamp') || null;
const isSameDay = storedTimestamp
  ? new Date(storedTimestamp).toDateString() === new Date().toDateString()
  : false;

const initialState: AttendanceState = {
  isCheckedIn: isSameDay ? (storage.getBoolean('isCheckedIn') || false) : false,
  checkInTime: isSameDay ? (storage.getString('checkInTime') || null) : null,
  checkInTimestamp: isSameDay ? storedTimestamp : null,
  attendanceId: isSameDay ? (storage.getString('attendanceId') || null) : null,
  visitsCount: isSameDay ? (storage.getNumber('visitsCount') || 0) : 0,
  distanceKm: isSameDay ? (storage.getNumber('distanceKm') || 0) : 0,
  hoursTracked: isSameDay ? (storage.getNumber('hoursTracked') || 0) : 0,
};

if (!isSameDay && storedTimestamp) {
  storage.remove('isCheckedIn');
  storage.remove('checkInTime');
  storage.remove('checkInTimestamp');
  storage.remove('attendanceId');
  storage.remove('visitsCount');
  storage.remove('distanceKm');
  storage.remove('hoursTracked');
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    checkIn(state, action: PayloadAction<{ time: string, timestamp: string, attendanceId: string }>) {
      state.isCheckedIn = true;
      state.checkInTime = action.payload.time;
      state.checkInTimestamp = action.payload.timestamp;
      state.attendanceId = action.payload.attendanceId;
      storage.set('isCheckedIn', true);
      storage.set('checkInTime', action.payload.time);
      storage.set('checkInTimestamp', action.payload.timestamp);
      storage.set('attendanceId', action.payload.attendanceId);
    },
    checkOut(state) {
      state.isCheckedIn = false;
      state.checkInTime = null;
      state.checkInTimestamp = null;
      state.attendanceId = null;
      state.visitsCount = 0;
      state.distanceKm = 0;
      state.hoursTracked = 0;
      storage.remove('isCheckedIn');
      storage.remove('checkInTime');
      storage.remove('checkInTimestamp');
      storage.remove('attendanceId');
      storage.remove('visitsCount');
      storage.remove('distanceKm');
      storage.remove('hoursTracked');
    },
    syncAttendanceStatus(state, action: PayloadAction<{ isCheckedIn: boolean; attendanceId?: string | null; time?: string | null; timestamp?: string | null; todayVisitsCount?: number }>) {
      if (action.payload.isCheckedIn && action.payload.attendanceId) {
        state.isCheckedIn = true;
        state.attendanceId = action.payload.attendanceId;
        if (action.payload.time) state.checkInTime = action.payload.time;
        if (action.payload.timestamp) state.checkInTimestamp = action.payload.timestamp;
        if (action.payload.todayVisitsCount !== undefined) state.visitsCount = action.payload.todayVisitsCount;
        storage.set('isCheckedIn', true);
        if (action.payload.attendanceId) storage.set('attendanceId', action.payload.attendanceId);
        if (action.payload.time) storage.set('checkInTime', action.payload.time);
        if (action.payload.timestamp) storage.set('checkInTimestamp', action.payload.timestamp);
        if (action.payload.todayVisitsCount !== undefined) storage.set('visitsCount', action.payload.todayVisitsCount);
      } else {
        state.isCheckedIn = false;
        state.checkInTime = null;
        state.checkInTimestamp = null;
        state.attendanceId = null;
        state.visitsCount = action.payload.todayVisitsCount || 0;
        state.distanceKm = 0;
        state.hoursTracked = 0;
        storage.remove('isCheckedIn');
        storage.remove('checkInTime');
        storage.remove('checkInTimestamp');
        storage.remove('attendanceId');
        storage.remove('visitsCount');
        storage.remove('distanceKm');
        storage.remove('hoursTracked');
      }
    },
    incrementVisit(state) {
      state.visitsCount += 1;
      storage.set('visitsCount', state.visitsCount);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.isCheckedIn = false;
      state.checkInTime = null;
      state.checkInTimestamp = null;
      state.attendanceId = null;
      state.visitsCount = 0;
      state.distanceKm = 0;
      state.hoursTracked = 0;
    });
  },
});

export const { checkIn, checkOut, syncAttendanceStatus, incrementVisit } = attendanceSlice.actions;
export default attendanceSlice.reducer;
