import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Button } from '../../../components/ui/Button';
import { theme } from '../../../config/theme';

export const CheckInScreen = () => {
  const navigation = useNavigation<any>();
  const device = useCameraDevice('front');
  const camera = useRef<Camera>(null);
  const photoOutput = usePhotoOutput();
  const [hasPermission, setHasPermission] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);

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
        Alert.alert('Permissions required', 'Camera and Location are strictly required for Check-In.');
        navigation.goBack();
      }
    })();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Mock face detection for UI experience
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
        
        navigation.navigate('CheckInConfirm', { 
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
        <Text style={styles.headerTitle}>Check in</Text>
      </View>

      <Text style={styles.subtitle}>Take a selfie to start your day</Text>

      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          outputs={[photoOutput]}
          isActive={true}
        />
        
        {/* Face Guide UI Overlay */}
        <View style={[styles.faceGuide, faceDetected && styles.faceGuideDetected]} />
        
        {/* Metadata Overlays */}
        {location && (
          <View style={styles.metadataContainer}>
            <Text style={styles.metadataText}>{`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}</Text>
            <Text style={styles.metadataText}>{new Date().toLocaleTimeString()}</Text>
          </View>
        )}
      </View>

      <Text style={styles.footerNote}>Tracking runs only while you're checked in.</Text>

      <View style={styles.footer}>
        <Button title="Capture & check in" onPress={handleCapture} />
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
    marginBottom: theme.spacing.lg,
  },
  cameraContainer: {
    flex: 1,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
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
  footerNote: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.inkLighter,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
});
