import { messaging } from './firebaseAdmin';
import { prisma } from '@safegrow/db';

export type NotificationType = 
  | 'CHECK_IN' 
  | 'CHECK_OUT' 
  | 'TRACKING_STOPPED' 
  | 'SYNC_ISSUE' 
  | 'MANAGER_MESSAGE';

interface SendNotificationParams {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, string>;
}

export const sendNotification = async ({ userId, title, body, type, data }: SendNotificationParams) => {
  if (!messaging) {
    console.warn('Firebase Messaging is not initialized. Skipping notification.');
    return false;
  }

  try {
    // 1. Fetch user and preferences
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        fcmToken: true,
        pushEnabled: true,
        notifyCheckIn: true,
        notifyTrackingStopped: true,
        notifySyncIssues: true,
        notifyManagerMessages: true,
      }
    });

    // 2. Check if user exists and has a token
    if (!user || !user.fcmToken) {
      console.log(`User ${userId} does not have an FCM token.`);
      return false;
    }

    // 3. Check master push toggle
    if (!user.pushEnabled) {
      console.log(`User ${userId} has push notifications disabled.`);
      return false;
    }

    // 4. Check specific preference based on type
    let shouldSend = true;
    switch (type) {
      case 'CHECK_IN':
      case 'CHECK_OUT':
        shouldSend = user.notifyCheckIn;
        break;
      case 'TRACKING_STOPPED':
        shouldSend = user.notifyTrackingStopped;
        break;
      case 'SYNC_ISSUE':
        shouldSend = user.notifySyncIssues;
        break;
      case 'MANAGER_MESSAGE':
        shouldSend = user.notifyManagerMessages;
        break;
    }

    if (!shouldSend) {
      console.log(`User ${userId} has notifications disabled for type ${type}.`);
      return false;
    }

    // 5. Send payload via FCM
    const message = {
      token: user.fcmToken,
      notification: {
        title,
        body,
      },
      data: {
        type,
        ...data,
      },
      android: {
        priority: 'high' as const,
      },
    };

    const response = await messaging.send(message);
    console.log(`Successfully sent message to user ${userId}:`, response);
    return true;

  } catch (error) {
    console.error(`Error sending notification to user ${userId}:`, error);
    return false;
  }
};
