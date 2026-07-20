import React, { useEffect } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { theme } from '../config/theme';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen';
import { VerifyCodeScreen } from '../features/auth/screens/VerifyCodeScreen';
import { NewPasswordScreen } from '../features/auth/screens/NewPasswordScreen';
import { PasswordResetSuccessScreen } from '../features/auth/screens/PasswordResetSuccessScreen';
import { HomeScreen } from '../features/home/screens/HomeScreen';

import { CheckInScreen } from '../features/attendance/screens/CheckInScreen';
import { CheckInConfirmScreen } from '../features/attendance/screens/CheckInConfirmScreen';
import { CheckOutScreen } from '../features/attendance/screens/CheckOutScreen';
import { CheckOutConfirmScreen } from '../features/attendance/screens/CheckOutConfirmScreen';
import { VisitCameraScreen } from '../features/visit/screens/VisitCameraScreen';
import { VisitConfirmScreen } from '../features/visit/screens/VisitConfirmScreen';
import { ProfileScreen } from '../features/profile/screens/ProfileScreen';
import { MyAttendanceScreen } from '../features/profile/screens/MyAttendanceScreen';
import { ManualAttendanceRequestScreen } from '../features/attendance/screens/ManualAttendanceRequestScreen';
import { MyVisitsScreen } from '../features/profile/screens/MyVisitsScreen';
import { NotificationsScreen } from '../features/profile/screens/NotificationsScreen';
import { ChangePasswordScreen } from '../features/profile/screens/ChangePasswordScreen';
import { LocationTrackingScreen } from '../features/profile/screens/LocationTrackingScreen';
import { LeaveHistoryScreen } from '../features/leaves/screens/LeaveHistoryScreen';
import { LeaveApplicationScreen } from '../features/leaves/screens/LeaveApplicationScreen';

import { MyTeamScreen } from '../features/team/screens/MyTeamScreen';
import { TeamMemberDayScreen } from '../features/team/screens/TeamMemberDayScreen';
import { TeamMemberVisitDetailScreen } from '../features/team/screens/TeamMemberVisitDetailScreen';
import { pushNotificationService } from '../services/PushNotificationService';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primaryDark,
        tabBarInactiveTintColor: theme.colors.inkLighter,
        tabBarStyle: (user?.role === 'MANAGER' || user?.role === 'ADMIN') ? {
          borderTopWidth: 1,
          borderTopColor: theme.colors.line,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        } : { display: 'none' },
        tabBarLabelStyle: {
          fontFamily: theme.fonts.medium,
          fontSize: 12,
        }
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>
        }} 
      />
      
      {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
        <Tab.Screen 
          name="MyTeam" 
          component={MyTeamScreen} 
          options={{ 
            title: 'My team',
            tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👥</Text>
          }} 
        />
      )}

      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>
        }} 
      />
    </Tab.Navigator>
  );
};

export const RootNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  useEffect(() => {
    let unsubscribe: any;
    if (isAuthenticated) {
      pushNotificationService.uploadFcmToken();
      unsubscribe = pushNotificationService.setupMessageHandlers();
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated]);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
            <Stack.Screen name="NewPassword" component={NewPasswordScreen} />
            <Stack.Screen name="PasswordResetSuccess" component={PasswordResetSuccessScreen} />
          </>
        ) : (
          <>
            {/* The root for authenticated users is the TabNavigator */}
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            
            {/* Screens that should hide the bottom tab bar go here */}
            <Stack.Screen name="CheckIn" component={CheckInScreen} />
            <Stack.Screen name="CheckInConfirm" component={CheckInConfirmScreen} />
            <Stack.Screen name="CheckOut" component={CheckOutScreen} />
            <Stack.Screen name="CheckOutConfirm" component={CheckOutConfirmScreen} />
            <Stack.Screen name="VisitCamera" component={VisitCameraScreen} />
            <Stack.Screen name="VisitConfirm" component={VisitConfirmScreen} />
            
            <Stack.Screen name="MyAttendance" component={MyAttendanceScreen} />
            <Stack.Screen name="ManualAttendanceRequest" component={ManualAttendanceRequestScreen} />
            <Stack.Screen name="MyVisits" component={MyVisitsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
            <Stack.Screen name="LocationTracking" component={LocationTrackingScreen} />
            <Stack.Screen name="LeaveHistory" component={LeaveHistoryScreen} />
            <Stack.Screen name="LeaveApplication" component={LeaveApplicationScreen} />
            
            <Stack.Screen name="TeamMemberDay" component={TeamMemberDayScreen} />
            <Stack.Screen name="TeamMemberVisitDetail" component={TeamMemberVisitDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
