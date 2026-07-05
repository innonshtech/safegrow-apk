import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Camera, useCameraDevice, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Button } from '../../../components/ui/Button';
import { theme } from '../../../config/theme';
import { RootState } from '../../../store';

export const CheckOutScreen = () => {
  const navigation = useNavigation<any>();
  const device = useCameraDevice('front');
  const camera = useRef<Camera>(null);
  const photoOutput = usePhotoOutput();

  const [hasPermission, setHasPermission] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);

  const { visitsCount, distanceKm, hoursTracked, checkInTimestamp } = useSelector((state: RootState) => state.attendance);

  const [liveHours, setLiveHours] = useState('0.0');
  const [liveDistance, setLiveDistance] = useState('0.0');

  useEffect(() => {
    let interval: any;
    if (checkInTimestamp) {
      const updateMetrics = async () => {
        const diffMs = Date.now() - new Date(checkInTimestamp).getTime();
        const hrs = diffMs / (1000 * 60 * 60);
        setLiveHours(hrs.toFixed(1));

        try {
          const BackgroundGeolocation = require('react-native-background-geolocation').default;
          const odometer = await BackgroundGeolocation.getOdometer();
          setLiveDistance((odometer / 1000).toFixed(1));
        } catch (e) {
          setLiveDistance(distanceKm.toString());
        }
      };

      updateMetrics();
      interval = setInterval(updateMetrics, 10000);
    } else {
      setLiveHours('0.0');
      setLiveDistance('0.0');
    }
    return () => clearInterval(interval);
  }, [checkInTimestamp, distanceKm]);

  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCameraPermission();

  useEffect(() => {
    let watchId: number | null = null;
    (async () => {
      let cameraStatus = hasCameraPermission;
      if (!cameraStatus) {
        cameraStatus = await requestCameraPermission();
      }
      
      const locationStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      
      if (cameraStatus && locationStatus === RESULTS.GRANTED) {
        setHasPermission(true);
        watchId = Geolocation.watchPosition(
          (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
          (error) => console.log('Location Error', error.message),
          { enableHighAccuracy: true, distanceFilter: 1, interval: 2000, fastestInterval: 1000 }
        );
      } else {
        Alert.alert('Permissions required', 'Camera and Location are strictly required for Check-Out.');
        navigation.goBack();
      }
    })();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    if (hasPermission && device) {
      setFaceDetected(false);
      const timer = setTimeout(() => {
        setFaceDetected(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasPermission, device]);

  const handleCapture = async () => {
    if (!location) {
      Alert.alert('Waiting for GPS', 'Acquiring high accuracy location...');
      return;
    }
    
    if (camera.current) {
      try {
        const photoFile = await photoOutput.capturePhotoToFile({}, {});
        const filePath = photoFile.filePath;     
        navigation.navigate('CheckOutConfirm', { 
          photoUri: `file://${filePath}`, 
          location 
        });
      } catch (error: any) {
        console.warn('Capture Error:', error);
        Alert.alert(
          'Camera Error Details', 
          `Error: ${error?.message || error?.toString()}\n\nCode: ${error?.code || 'Unknown'}\n\nPlease share this error so we can fix it!`
        );
      }
    }
  };

  if (!device || !hasPermission) {
    return <View style={styles.container}><Text>Initializing Hardware...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Check Out</Text>
      </View>

      <Text style={styles.subtitle}>One last selfie to end your day</Text>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Today's summary</Text>
          <Text style={styles.summaryDate}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
        </View>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Visits</Text>
            <Text style={styles.summaryValue}>{visitsCount}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Distance</Text>
            <Text style={styles.summaryValue}>{liveDistance} km</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Hours</Text>
            <Text style={styles.summaryValue}>{liveHours}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          outputs={[photoOutput]}
          isActive={true}
        />
        
        <View style={[styles.faceGuide, faceDetected && styles.faceGuideDetected]} />
        
        {location && (
          <View style={styles.metadataContainer}>
            <Text style={styles.metadataText}>{`${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° E`}</Text>
            <Text style={styles.metadataText}>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Button title="Capture & check out" onPress={handleCapture} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: 50,
  },
  backButton: {
    fontSize: 32,
    color: theme.colors.inkLight,
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.ink,
  },
  subtitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.inkLight,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  summaryCard: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    marginBottom: theme.spacing.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  summaryTitle: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.ink,
    fontSize: 16,
  },
  summaryDate: {
    fontFamily: theme.fonts.regular,
    color: theme.colors.inkLight,
    fontSize: 14,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingVertical: 20,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryLabel: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.inkLight,
    fontSize: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.ink,
    fontSize: 22,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: theme.colors.surfaceSecondary,
  },
  faceGuide: {
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    width: 200,
    height: 250,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  faceGuideDetected: {
    borderColor: theme.colors.success,
    borderWidth: 3,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  metadataContainer: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  metadataText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.surface,
    fontSize: 12,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
});
