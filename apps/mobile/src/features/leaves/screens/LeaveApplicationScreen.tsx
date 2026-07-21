import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../../config/theme';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { apiClient } from '../../../api/client';
import { globalToast } from '../../../components/ui/ToastProvider';

const LEAVE_TYPES = ['CASUAL', 'PRIVILEGE', 'MEDICAL'];

export const LeaveApplicationScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editLeave = route.params?.editLeave;
  
  const [type, setType] = useState(editLeave?.type || 'CASUAL');
  const [reason, setReason] = useState(editLeave?.reason || '');
  const [loading, setLoading] = useState(false);
  
  const [startDateStr, setStartDateStr] = useState(editLeave ? editLeave.startDate.split('T')[0] : '');
  const [endDateStr, setEndDateStr] = useState(editLeave ? editLeave.endDate.split('T')[0] : '');
  const [balance, setBalance] = useState<any>(null);
  const [showCalendar, setShowCalendar] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    apiClient.get('/leaves/balance').then(res => setBalance(res.data)).catch(console.error);
  }, []);

  const calculatePreview = () => {
    if (!startDateStr || !endDateStr || !balance) return null;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return null;

    let totalDays = 0;
    let curr = new Date(start);
    while (curr <= end) {
      if (curr.getDay() !== 0) {
        totalDays++;
      }
      curr.setDate(curr.getDate() + 1);
    }
    
    if (totalDays === 0) return null;

    let paidDays = 0;
    
    if (type === 'MEDICAL') {
      const remainingYearly = Math.max(0, balance.medical.yearlyLimit - balance.medical.usedThisYear);
      const remainingMonthly = Math.max(0, balance.medical.monthlyLimit - balance.medical.usedThisMonth);
      const availablePaidDays = Math.min(remainingYearly, remainingMonthly);
      paidDays = Math.min(totalDays, availablePaidDays);
    }
    
    return { totalDays, unpaidDays: totalDays - paidDays };
  };

  const preview = calculatePreview();

  const handleApply = async () => {
    if (!startDateStr || !endDateStr || !reason.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields (Dates must be YYYY-MM-DD)');
      return;
    }
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      Alert.alert('Validation Error', 'Please enter valid dates (End Date >= Start Date)');
      return;
    }
    
    if (preview && balance) {
      if (type === 'CASUAL' && (balance.casual.used + preview.totalDays > balance.casual.limit)) {
        Alert.alert('Quota Exceeded', `You only have ${balance.casual.limit - balance.casual.used} Casual leaves remaining. Contact Admin for emergencies.`);
        return;
      }
      if (type === 'PRIVILEGE' && (balance.privilege.used + preview.totalDays > balance.privilege.limit)) {
        Alert.alert('Quota Exceeded', `You only have ${balance.privilege.limit - balance.privilege.used} Privilege leaves remaining. Contact Admin for emergencies.`);
        return;
      }
    }

    try {
      setLoading(true);
      if (editLeave) {
        await apiClient.put(`/leaves/${editLeave.id}`, {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          type,
          reason: reason.trim()
        });
        globalToast.show({ message: 'Leave updated successfully!', type: 'success' });
      } else {
        await apiClient.post('/leaves', {
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          type,
          reason: reason.trim()
        });
        globalToast.show({ message: 'Leave requested successfully!', type: 'success' });
      }
      navigation.goBack();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to submit leave request';
      globalToast.show({ message: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editLeave ? "Edit Leave Request" : "Apply for Leave"}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Leave Type</Text>
        <View style={styles.typeRow}>
          {LEAVE_TYPES.map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.typeButton, type === t && styles.typeButtonActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {type === 'MEDICAL' && balance && (
           <Text style={styles.infoText}>Medical Leaves remaining this month: {Math.max(0, balance.medical.monthlyLimit - balance.medical.usedThisMonth)}/{balance.medical.monthlyLimit} ({Math.max(0, balance.medical.yearlyLimit - balance.medical.usedThisYear)}/{balance.medical.yearlyLimit} yearly)</Text>
        )}
        {type === 'CASUAL' && balance && (
           <Text style={styles.infoText}>Casual Leaves remaining: {Math.max(0, balance.casual.limit - balance.casual.used)}/{balance.casual.limit}</Text>
        )}
        {type === 'PRIVILEGE' && balance && (
           <Text style={styles.infoText}>Privilege Leaves remaining: {Math.max(0, balance.privilege.limit - balance.privilege.used)}/{balance.privilege.limit}</Text>
        )}

        <View style={styles.datesRow}>
          <TouchableOpacity style={{flex: 1, marginRight: 8}} onPress={() => setShowCalendar('start')}>
            <View pointerEvents="none">
              <Input label="Start Date" placeholder="Select date" value={startDateStr} editable={false} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1, marginLeft: 8}} onPress={() => setShowCalendar('end')}>
            <View pointerEvents="none">
              <Input label="End Date" placeholder="Select date" value={endDateStr} editable={false} />
            </View>
          </TouchableOpacity>
        </View>

        <Modal visible={!!showCalendar} transparent={true} animationType="fade" onRequestClose={() => setShowCalendar(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.calendarContainer}>
              <Calendar
                enableSwipeMonths={true}
                theme={{
                  arrowColor: theme.colors.primary,
                  todayTextColor: theme.colors.primary,
                }}
                renderArrow={(direction: string) => (
                  <Text style={{ fontSize: 28, color: theme.colors.primary, paddingHorizontal: 10 }}>
                    {direction === 'left' ? '‹' : '›'}
                  </Text>
                )}
                onDayPress={(day: any) => {
                  if (showCalendar === 'start') setStartDateStr(day.dateString);
                  else if (showCalendar === 'end') setEndDateStr(day.dateString);
                  setShowCalendar(null);
                }}
                markedDates={{
                  [showCalendar === 'start' ? startDateStr : endDateStr]: { selected: true, selectedColor: theme.colors.primary }
                }}
              />
              <View style={{ marginTop: 16 }}>
                <Button title="Close" variant="outline" onPress={() => setShowCalendar(null)} />
              </View>
            </View>
          </View>
        </Modal>

        {preview && (
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>Calculation Preview</Text>
            <Text style={styles.previewText}>Total Days: {preview.totalDays}</Text>
            <Text style={[styles.previewText, preview.unpaidDays > 0 && { color: theme.colors.error }]}>Unpaid Days: {preview.unpaidDays}</Text>
          </View>
        )}

        <Input label="Reason" placeholder="Please enter a valid reason" value={reason} onChangeText={setReason} multiline={true} />

      </ScrollView>

      <View style={styles.footer}>
        <Button title={editLeave ? "Update Request" : "Submit Request"} onPress={handleApply} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surfaceSecondary },
  header: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, paddingTop: 50 },
  backButton: { fontSize: 32, color: theme.colors.inkLight, marginRight: theme.spacing.md },
  headerTitle: { fontFamily: theme.fonts.bold, fontSize: 20, color: theme.colors.ink },
  content: { padding: theme.spacing.lg },
  label: { fontFamily: theme.fonts.medium, fontSize: 14, color: theme.colors.inkLight, marginBottom: 8 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  typeButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.line },
  typeButtonActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  typeText: { fontFamily: theme.fonts.medium, fontSize: 14, color: theme.colors.inkLight },
  typeTextActive: { color: '#fff' },
  infoText: { fontFamily: theme.fonts.regular, fontSize: 13, color: theme.colors.primary, marginBottom: 16 },
  datesRow: { flexDirection: 'row', marginBottom: 16 },
  previewBox: { backgroundColor: '#f0fdf4', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#bbf7d0', marginBottom: 16 },
  previewTitle: { fontFamily: theme.fonts.bold, fontSize: 14, color: '#166534', marginBottom: 4 },
  previewText: { fontFamily: theme.fonts.medium, fontSize: 14, color: '#166534' },
  footer: { padding: theme.spacing.lg, backgroundColor: theme.colors.surface, borderTopWidth: 1, borderColor: theme.colors.line },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  calendarContainer: { width: '90%', backgroundColor: '#fff', borderRadius: 12, padding: 16 },
});
