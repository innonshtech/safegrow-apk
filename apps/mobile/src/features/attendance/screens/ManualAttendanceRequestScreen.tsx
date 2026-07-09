import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../../config/theme';
import { apiClient } from '../../../api/client';
import { globalToast } from '../../../components/ui/ToastProvider';

export const ManualAttendanceRequestScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { date } = route.params || {};

  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Strict time formatter: forces HH:MM format as user types
  const handleTimeChange = (text: string, setter: (val: string) => void) => {
    // 1. Remove all non-numeric characters
    let cleaned = text.replace(/[^0-9]/g, '');
    
    // 2. Cap hours to 23
    if (cleaned.length >= 2) {
      const hours = parseInt(cleaned.slice(0, 2), 10);
      if (hours > 23) {
        cleaned = `23${cleaned.slice(2)}`;
      }
    }
    
    // 3. Auto-insert colon
    if (cleaned.length >= 3) {
      cleaned = `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
    }

    // 4. Cap minutes to 59
    if (cleaned.length >= 5) {
      const minutes = parseInt(cleaned.slice(3, 5), 10);
      if (minutes > 59) {
        cleaned = `${cleaned.slice(0, 2)}:59`;
      }
    }

    setter(cleaned.slice(0, 5));
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      globalToast.show({ message: 'Please provide a reason for the manual request.', type: 'error' });
      return;
    }
    if (!checkInTime.trim() && !checkOutTime.trim()) {
      globalToast.show({ message: 'Please provide either a Check-in time or Check-out time.', type: 'error' });
      return;
    }

    // Ensure if a time is provided, it is fully complete (5 chars: HH:MM)
    if (checkInTime.trim() && checkInTime.length < 5) {
      globalToast.show({ message: 'Check-in time is incomplete. Please use HH:MM format.', type: 'error' });
      return;
    }
    if (checkOutTime.trim() && checkOutTime.length < 5) {
      globalToast.show({ message: 'Check-out time is incomplete. Please use HH:MM format.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      // Helper to construct Date objects from time string (HH:MM)
      const createDateWithTime = (timeStr: string) => {
        if (!timeStr) return null;
        const [hours, minutes] = timeStr.split(':').map(Number);
        const d = new Date(date);
        d.setHours(hours, minutes, 0, 0);
        return d.toISOString();
      };

      const payload = {
        date,
        checkInTime: createDateWithTime(checkInTime),
        checkOutTime: createDateWithTime(checkOutTime),
        reason
      };

      await apiClient.post('/attendance/request', payload);
      globalToast.show({ message: 'Attendance request submitted successfully. Awaiting admin approval.', type: 'success' });
      navigation.goBack();
    } catch (error: any) {
      console.error('Submit error:', error);
      globalToast.show({ message: error.response?.data?.error || 'Failed to submit request', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manual Request</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.dateText}>Applying for: {date}</Text>

        <Text style={styles.label}>Check-in Time (HH:MM, 24hr)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 09:30"
          value={checkInTime}
          onChangeText={(text) => handleTimeChange(text, setCheckInTime)}
          keyboardType="number-pad"
          maxLength={5}
        />

        <Text style={styles.label}>Check-out Time (HH:MM, 24hr)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 18:00"
          value={checkOutTime}
          onChangeText={(text) => handleTimeChange(text, setCheckOutTime)}
          keyboardType="number-pad"
          maxLength={5}
        />

        <Text style={styles.label}>Reason *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Why are you applying manually?"
          value={reason}
          onChangeText={setReason}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Request'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 28,
    color: '#333',
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 24,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
