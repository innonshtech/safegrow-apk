import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Camera, useCameraDevice, useCameraPermission, usePhotoOutput } from 'react-native-vision-camera';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { theme } from '../../../config/theme';

export const VisitCameraScreen = () => {
  const navigation = useNavigation<any>();
  // Use the rear camera for visits
  const device = useCameraDevice('back');

  const { hasPermission: hasCameraPermission, requestPermission: requestCameraPermission } = useCameraPermission();
  const camera = useRef<Camera>(null);
  const photoOutput = usePhotoOutput();
  const [hasPermission, setHasPermission] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    (async () => {
      let cameraStatus = hasCameraPermission;
      if (!cameraStatus) {
        cameraStatus = await requestCameraPermission();
      }
      const locationStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      
      if (cameraStatus && locationStatus === RESULTS.GRANTED) {
        setHasPermission(true);
        Geolocation.getCurrentPosition(
          (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
          (error) => Alert.alert('Location Error', error.message),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        Alert.alert('Permissions required', 'Camera and Location are strictly required.');
        navigation.goBack();
      }
    })();
  }, []);

  const handleCapture = async () => {
    if (!location) {
      Alert.alert('Waiting for GPS', 'Acquiring high accuracy location...');
      return;
    }
    
    try {
      const photoFile = await photoOutput.capturePhotoToFile({}, {});
      const filePath = photoFile.filePath;
      
      navigation.navigate('VisitConfirm', { 
        photoUri: `file://${filePath}`, 
        location 
      });
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Camera Error Details', 
        `Error: ${error?.message || error?.toString()}\n\nCode: ${error?.code || 'Unknown'}\n\nPlease share this error so we can fix it!`
      );
    }
  };

  if (!device || !hasPermission) {
    return <View style={styles.container}><Text>Initializing Hardware...</Text></View>;
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cameraContainer}>
        <Camera
          ref={camera}
          style={StyleSheet.absoluteFill}
          device={device}
          outputs={[photoOutput]}
          isActive={true}
        />
        
        {/* Metadata Overlay (Burn-in) */}
        {location && (
          <View style={styles.metadataContainer}>
            <Text style={styles.metadataText}>{`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}</Text>
            <Text style={styles.metadataText}>{new Date().toLocaleDateString()} · {new Date().toLocaleTimeString()} · GPS</Text>
          </View>
        )}
      </View>

      {/* Footer Controls */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.captureButtonOuter} onPress={handleCapture}>
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingTop: 50,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 28,
    color: theme.colors.surface,
    lineHeight: 30,
  },
  cameraContainer: {
    flex: 1,
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
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
  },
});
