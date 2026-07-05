import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { checkOut } from '../store/attendanceSlice';
import { Button } from '../../../components/ui/Button';
import { theme } from '../../../config/theme';
import { apiClient } from '../../../api/client';
import { RootState } from '../../../store';
import LocationTrackingService from '../../../services/LocationTrackingService';
import { globalToast } from '../../../components/ui/ToastProvider';

export const CheckOutConfirmScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  const { location, photoUri } = route.params || {};
  const { visitsCount, distanceKm, checkInTimestamp } = useSelector((state: RootState) => state.attendance);

  const [liveHours, setLiveHours] = useState('0.0');
  const [liveDistance, setLiveDistance] = useState('0.0');

  React.useEffect(() => {
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

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const isoTime = new Date().toISOString();
      
      if (!photoUri) {
        throw new Error('No photo was captured.');
      }

      let finalPhotoUrl = '';
      const presignedRes = await apiClient.post('/upload/presigned-url', {
        contentType: 'image/jpeg',
        fileExtension: 'jpg'
      });
      
      const { presignedUrl, publicUrl } = presignedRes.data;

      const fetchRes = await fetch(photoUri);
      const blob = await fetchRes.blob();
      
      await fetch(presignedUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'image/jpeg'
        }
      });
      
      finalPhotoUrl = publicUrl;

      await apiClient.post('/attendance/check-out', {
        time: isoTime,
        lat: location?.lat || 0,
        lng: location?.lng || 0,
        photoUrl: finalPhotoUrl
      });

      dispatch(checkOut());
      
      await LocationTrackingService.stop();
      
      globalToast.show({ message: 'Successfully checked out!', type: 'success' });
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || 'Failed to check out';
      globalToast.show({ message: errorMessage, type: 'error' });
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Checkout</Text>
      </View>

      <View style={styles.photoContainer}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={styles.photoMock}>
            <Text style={styles.mockText}>No Photo</Text>
          </View>
        )}

        {/* Burn-in Simulation */}
        <View style={styles.burnInOverlay}>
          <Text style={styles.burnInText}>{location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}</Text>
          <Text style={styles.burnInText}>{new Date().toLocaleDateString()} · {new Date().toLocaleTimeString()} · GPS Verified</Text>
        </View>
      </View>

      <View style={styles.summaryBox}>
        <Text style={styles.summaryLabel}>Ending your day</Text>
        <Text style={styles.summaryValue}>
          {`In ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} · ${visitsCount} visits · ${liveDistance} km · ${liveHours} hours`}
        </Text>
      </View>

      <Text style={styles.warningText}>
        Tracking stops after you confirm check-out.
      </Text>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <View style={styles.buttonHalf}>
             <Button title="Retake" variant="outline" onPress={() => navigation.goBack()} disabled={loading} />
          </View>
          <View style={styles.buttonHalf}>
             <Button title="Confirm" onPress={handleConfirm} loading={loading} />
          </View>
        </View>
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
  photoContainer: {
    height: 400,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    marginBottom: theme.spacing.lg,
  },
  photoMock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryDark,
  },
  mockText: {
    color: theme.colors.surface,
    fontFamily: theme.fonts.bold,
  },
  burnInOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: theme.spacing.md,
  },
  burnInText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.surface,
    fontSize: 13,
    marginBottom: 4,
  },
  summaryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.md,
  },
  summaryLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.inkLight,
  },
  summaryValue: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.ink,
  },
  warningText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.inkLight,
    paddingHorizontal: theme.spacing.lg,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
    marginTop: 'auto',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  buttonHalf: {
    flex: 1,
  }
});
