import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Platform } from 'react-native';
import { apiClient } from '../api/client';

class PushNotificationService {
  async requestUserPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Notification permission denied');
        return false;
      }
    }
    
    // For iOS or older Androids, messaging.requestPermission() handles it
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      return true;
    }
    
    return false;
  }

  async getFcmToken() {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('Your Firebase Token is:', fcmToken);
        return fcmToken;
      } else {
        console.log('Failed to get FCM token');
      }
    } catch (error) {
      console.log('Error fetching token:', error);
    }
    return null;
  }

  async uploadFcmToken() {
    const hasPermission = await this.requestUserPermission();
    if (!hasPermission) return;

    const token = await this.getFcmToken();
    if (token) {
      try {
        await apiClient.post('/users/me/fcm', { fcmToken: token });
        console.log('FCM token uploaded to server');
      } catch (error) {
        console.error('Failed to upload FCM token', error);
      }
    }
  }

  setupMessageHandlers() {
    // Handle messages while the app is in the foreground
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived in the foreground!', JSON.stringify(remoteMessage));
      // In a real app, you might show an in-app toast here if you want
    });

    // Handle background notification opened app
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage.notification,
      );
      // Navigation logic could go here based on remoteMessage.data
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage.notification,
          );
          // Navigation logic could go here based on remoteMessage.data
        }
      });

    return unsubscribe;
  }
}

export const pushNotificationService = new PushNotificationService();
