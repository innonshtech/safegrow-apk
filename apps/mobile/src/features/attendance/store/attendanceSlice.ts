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

const initialState: AttendanceState = {
  isCheckedIn: storage.getBoolean('isCheckedIn') || false,
  checkInTime: storage.getString('checkInTime') || null,
  checkInTimestamp: storage.getString('checkInTimestamp') || null,
  attendanceId: storage.getString('attendanceId') || null,
  visitsCount: storage.getNumber('visitsCount') || 0,
  distanceKm: storage.getNumber('distanceKm') || 0,
  hoursTracked: storage.getNumber('hoursTracked') || 0,
};

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

export const { checkIn, checkOut, incrementVisit } = attendanceSlice.actions;
export default attendanceSlice.reducer;
