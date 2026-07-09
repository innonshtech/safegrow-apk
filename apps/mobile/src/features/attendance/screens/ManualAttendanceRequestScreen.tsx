import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../../config/theme';
import { apiClient } from '../../../api/client';

export const ManualAttendanceRequestScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { date } = route.params || {};

  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for the manual request.');
      return;
    }
    if (!checkInTime.trim() && !checkOutTime.trim()) {
      Alert.alert('Error', 'Please provide either a Check-in time or Check-out time.');
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
      Alert.alert('Success', 'Attendance request submitted successfully. Awaiting admin approval.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit request');
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
          onChangeText={setCheckInTime}
          keyboardType="numbers-and-punctuation"
        />

        <Text style={styles.label}>Check-out Time (HH:MM, 24hr)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 18:00"
          value={checkOutTime}
          onChangeText={setCheckOutTime}
          keyboardType="numbers-and-punctuation"
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
