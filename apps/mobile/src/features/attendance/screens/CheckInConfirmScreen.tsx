import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { checkIn } from '../store/attendanceSlice';
import { Button } from '../../../components/ui/Button';
import { theme } from '../../../config/theme';
import { apiClient } from '../../../api/client';
import LocationTrackingService from '../../../services/LocationTrackingService';
import { globalToast } from '../../../components/ui/ToastProvider';

export const CheckInConfirmScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  const { location, photoUri } = route.params || {};

  const handleConfirm = async () => {
    try {
      setLoading(true);
      const isoTime = new Date().toISOString();
      
      if (!photoUri) {
        throw new Error('No photo was captured.');
      }

      let finalPhotoUrl = '';
      // 1. Get Presigned URL
      const presignedRes = await apiClient.post('/upload/presigned-url', {
        contentType: 'image/jpeg',
        fileExtension: 'jpg'
      });
      
      const { presignedUrl, publicUrl } = presignedRes.data;

      // 2. Fetch file as blob (works for both local file:// and remote http://)
      const fetchRes = await fetch(photoUri);
      const blob = await fetchRes.blob();
      
      // 3. Upload directly to S3
      await fetch(presignedUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'Content-Type': 'image/jpeg'
        }
      });
      
      finalPhotoUrl = publicUrl;

      const response = await apiClient.post('/attendance/check-in', {
        time: isoTime,
        lat: location?.lat || 0,
        lng: location?.lng || 0,
        photoUrl: finalPhotoUrl
      });

      dispatch(checkIn({ 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        timestamp: isoTime,
        attendanceId: response.data.attendanceId 
      }));
      
      await LocationTrackingService.configureAndStart(response.data.attendanceId);
      
      globalToast.show({ message: 'Successfully checked in!', type: 'success' });
      setLoading(false);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || 'Failed to check in';
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
        <Text style={styles.headerTitle}>Confirm check-in</Text>
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

      <Text style={styles.warningText}>
        This selfie and location start your day. Tracking turns on after you confirm.
      </Text>

      <View style={styles.footer}>
        <Button title="Retake" variant="outline" onPress={() => navigation.goBack()} disabled={loading} />
        <View style={{ height: theme.spacing.md }} />
        <Button title="Confirm" onPress={handleConfirm} loading={loading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
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
    flex: 1,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
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
  warningText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.inkLight,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
});
