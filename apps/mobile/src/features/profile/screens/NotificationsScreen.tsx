import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../config/theme';
import { apiClient } from '../../../api/client';
import { globalToast } from '../../../components/ui/ToastProvider';

export const NotificationsScreen = () => {
  const navigation = useNavigation<any>();
  
  const [pushEnabled, setPushEnabled] = useState(true);
  
  const [reminders, setReminders] = useState({
    checkIn: true,
    checkOut: true,
  });
  
  const [alerts, setAlerts] = useState({
    trackingStopped: true,
    syncIssues: true,
    managerMessages: true,
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await apiClient.get('/users/me/preferences');
        if (response.data?.preferences) {
          const prefs = response.data.preferences;
          setPushEnabled(prefs.pushEnabled ?? true);
          setReminders(prev => ({ ...prev, checkIn: prefs.notifyCheckIn ?? true }));
          setAlerts({
            trackingStopped: prefs.notifyTrackingStopped ?? true,
            syncIssues: prefs.notifySyncIssues ?? true,
            managerMessages: prefs.notifyManagerMessages ?? true,
          });
        }
      } catch (error) {
        console.log('Failed to fetch preferences', error);
      }
    };
    fetchPreferences();
  }, []);

  const updatePreference = async (key: string, value: boolean) => {
    try {
      await apiClient.post('/users/me/preferences', { [key]: value });
    } catch (error) {
      console.log('Failed to update preference', error);
      globalToast.show({ message: 'Failed to update setting', type: 'error' });
    }
  };

  const ToggleItem = ({ title, value, onValueChange, isFirst = false, isLast = false }: any) => (
    <View style={[
      styles.toggleItem, 
      !isLast && styles.toggleItemBorder
    ]}>
      <Text style={styles.toggleTitle}>{title}</Text>
      <Switch 
        value={value} 
        onValueChange={onValueChange} 
        trackColor={{ false: theme.colors.surfaceSecondary, true: theme.colors.success }}
        thumbColor={theme.colors.surface}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Master Toggle */}
        <View style={styles.sectionContainer}>
          <ToggleItem 
            title="Push notifications" 
            value={pushEnabled} 
            onValueChange={(val: boolean) => {
              setPushEnabled(val);
              updatePreference('pushEnabled', val);
            }} 
            isLast={true}
          />
        </View>

        {/* Reminders */}
        <Text style={styles.sectionHeader}>Reminders</Text>
        <View style={styles.sectionContainer}>
          <ToggleItem 
            title="Check-in reminder" 
            value={reminders.checkIn} 
            onValueChange={(val: boolean) => {
              setReminders(prev => ({ ...prev, checkIn: val }));
              updatePreference('notifyCheckIn', val);
            }} 
          />
          <ToggleItem 
            title="Check-out reminder" 
            value={reminders.checkOut} 
            onValueChange={(val: boolean) => {
              // Note: We don't have a separate notifyCheckOut in schema yet,
              // but we can map it or just use state. Let's just update local state.
              setReminders(prev => ({ ...prev, checkOut: val }));
            }} 
            isLast={true}
          />
        </View>

        {/* Alerts */}
        <Text style={styles.sectionHeader}>Alerts</Text>
        <View style={styles.sectionContainer}>
          <ToggleItem 
            title="Tracking stopped" 
            value={alerts.trackingStopped} 
            onValueChange={(val: boolean) => {
              setAlerts(prev => ({ ...prev, trackingStopped: val }));
              updatePreference('notifyTrackingStopped', val);
            }} 
          />
          <ToggleItem 
            title="Sync issues" 
            value={alerts.syncIssues} 
            onValueChange={(val: boolean) => {
              setAlerts(prev => ({ ...prev, syncIssues: val }));
              updatePreference('notifySyncIssues', val);
            }} 
          />
          <ToggleItem 
            title="Messages from manager" 
            value={alerts.managerMessages} 
            onValueChange={(val: boolean) => {
              setAlerts(prev => ({ ...prev, managerMessages: val }));
              updatePreference('notifyManagerMessages', val);
            }} 
            isLast={true}
          />
        </View>

      </ScrollView>
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
  content: {
    padding: theme.spacing.lg,
  },
  sectionHeader: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.inkLight,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
    marginLeft: 4,
  },
  sectionContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  toggleItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  toggleTitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.ink,
  },
});
