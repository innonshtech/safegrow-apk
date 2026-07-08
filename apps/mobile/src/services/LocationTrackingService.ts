import BackgroundGeolocation from "react-native-background-geolocation";
import { Platform } from "react-native";
import { apiClient } from "../api/client";
import { Config } from "react-native-config";

class LocationTrackingService {
  private isConfigured = false;

  async configureAndStart(attendanceId: string) {
    if (!this.isConfigured) {
      const intervalStr = Config.BACKGROUND_TRACKING_INTERVAL_MS || '900000';
      const intervalMs = parseInt(intervalStr, 10);
      const distanceFilter = intervalMs < 60000 ? 10 : 50;

      await BackgroundGeolocation.ready({
        desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
        distanceFilter: distanceFilter, // meters
        locationUpdateInterval: intervalMs, // only for Android
        fastestLocationUpdateInterval: intervalMs, // only for Android
        stopOnTerminate: false,
        startOnBoot: true,
        debug: false,
        logLevel: BackgroundGeolocation.LOG_LEVEL_OFF,
        backgroundPermissionRationale: {
          title: "Allow access to this device's location in the background?",
          message: "In order to track your route during your shift, we need background location access.",
          positiveAction: "Change to Allow all the time",
          negativeAction: "Cancel"
        }
      });
      
      BackgroundGeolocation.onLocation(async (location) => {
        try {
          console.log('[BackgroundGeolocation] Location:', location);
          
          await apiClient.post('/tracking/batch', {
            pings: [{
              attendanceId,
              time: location.timestamp,
              lat: location.coords.latitude,
              lng: location.coords.longitude,
              accuracy: location.coords.accuracy,
              speed: location.coords.speed
            }]
          });
        } catch (e) {
          console.error('[BackgroundGeolocation] Error uploading ping', e);
        }
      });

      this.isConfigured = true;
    }

    const state = await BackgroundGeolocation.getState();
    if (!state.enabled) {
      await BackgroundGeolocation.setOdometer(0);
      await BackgroundGeolocation.start();
    }
  }

  async stop() {
    await BackgroundGeolocation.stop();
    BackgroundGeolocation.removeAllListeners();
    this.isConfigured = false;
  }
}

export default new LocationTrackingService();
