import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { incrementVisit } from '../../attendance/store/attendanceSlice';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { theme } from '../../../config/theme';
import { apiClient } from '../../../api/client';
import { globalToast } from '../../../components/ui/ToastProvider';
import { RootState } from '../../../store';

const OUTCOMES = ['Order placed', 'Met', 'Not available'];

export const VisitConfirmScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch();
  
  const { location, photoUri } = route.params || {};
  const { attendanceId } = useSelector((state: RootState) => state.attendance);
  
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [vendorName, setVendorName] = useState('');
  const [area, setArea] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!selectedOutcome || !attendanceId) {
      if (!attendanceId) Alert.alert('Error', 'No active attendance record found.');
      return;
    }

    if (!vendorName.trim() || !area.trim()) {
      Alert.alert('Validation Error', 'Please enter both Vendor Name and Area.');
      return;
    }
    
    if (!photoUri) {
      Alert.alert('Error', 'No photo was captured.');
      return;
    }
    
    try {
      setLoading(true);
      
      // 1. Get Presigned URL
      const presignedRes = await apiClient.post('/upload/presigned-url', {
        contentType: 'image/jpeg',
        fileExtension: 'jpg'
      });
      
      const { presignedUrl, publicUrl } = presignedRes.data;

      // 2. Fetch file as blob
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
      
      await apiClient.post('/visits', {
        attendanceId,
        time: new Date().toISOString(),
        lat: location?.lat || 0,
        lng: location?.lng || 0,
        photoUrl: publicUrl,
        vendorName: vendorName.trim(),
        area: area.trim(),
        outcome: selectedOutcome.toUpperCase().replace(' ', '_'),
      });

      dispatch(incrementVisit());
      globalToast.show({ message: 'Visit saved successfully!', type: 'success' });
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.response?.data?.error || 'Failed to save visit';
      globalToast.show({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm visit</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Photo Container */}
        <View style={styles.photoContainer}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <View style={styles.photoMock}>
              <Text style={styles.mockText}>No Photo</Text>
            </View>
          )}
          <View style={styles.burnInOverlay}>
            <Text style={styles.burnInText}>{location?.lat.toFixed(4)}, {location?.lng.toFixed(4)}</Text>
            <Text style={styles.burnInText}>{new Date().toLocaleDateString()} · {new Date().toLocaleTimeString()} · Pune</Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Visit outcome</Text>
          
          <View style={styles.outcomeRow}>
            {OUTCOMES.map((outcome) => (
              <TouchableOpacity 
                key={outcome} 
                style={[
                  styles.outcomeButton, 
                  selectedOutcome === outcome && styles.outcomeButtonActive
                ]}
                onPress={() => setSelectedOutcome(outcome)}
              >
                <Text style={[
                  styles.outcomeText,
                  selectedOutcome === outcome && styles.outcomeTextActive
                ]}>
                  {outcome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ marginBottom: theme.spacing.md }}>
            <Input
              label="Vendor Name *"
              placeholder="Enter vendor name"
              value={vendorName}
              onChangeText={setVendorName}
            />
          </View>
          
          <Input
            label="Area *"
            placeholder="Enter area"
            value={area}
            onChangeText={setArea}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button title="Retake" variant="outline" onPress={() => navigation.goBack()} disabled={loading} />
        <View style={{ height: theme.spacing.md }} />
        <Button 
          title="Save visit" 
          onPress={handleSave} 
          loading={loading}
          disabled={!selectedOutcome || !vendorName.trim() || !area.trim()}
        />
      </View>
    </KeyboardAvoidingView>
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
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  photoContainer: {
    height: 250,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    marginBottom: theme.spacing.xl,
  },
  photoMock: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.inkLighter,
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
  formContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.inkLight,
    marginBottom: theme.spacing.md,
  },
  outcomeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  outcomeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  outcomeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  outcomeText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.inkLight,
  },
  outcomeTextActive: {
    color: theme.colors.surface,
  },
  notesInput: {
    height: 80,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: theme.colors.ink,
    textAlignVertical: 'top',
  },
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
    backgroundColor: theme.colors.surfaceSecondary,
  },
});
