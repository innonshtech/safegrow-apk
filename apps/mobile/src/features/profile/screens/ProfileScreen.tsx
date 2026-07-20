import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, setCredentials } from '../../auth/store/authSlice';
import { RootState } from '../../../store';
import { theme } from '../../../config/theme';
import { apiClient } from '../../../api/client';
import { useEffect, useState } from 'react';
import DeviceInfo from 'react-native-device-info';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [isBatteryRestricted, setIsBatteryRestricted] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/auth/me');
        if (response.data?.user && token) {
          dispatch(setCredentials({ token, user: response.data.user }));
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };
    fetchProfile();

    const checkBattery = async () => {
      try {
        const isRestricted = await DeviceInfo.isBatteryOptimizationEnabled();
        setIsBatteryRestricted(isRestricted);
      } catch (e) {}
    };
    checkBattery();
  }, [dispatch, token]);
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  const initials = getInitials(user?.name || '');

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  const ListItem = ({ title, rightText, onPress, isDestructive }: { title: string, rightText?: string, onPress?: () => void, isDestructive?: boolean }) => (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <Text style={[styles.listItemTitle, isDestructive && styles.destructiveText]}>{title}</Text>
      <View style={styles.listItemRight}>
        {rightText && <Text style={[styles.listItemRightText, rightText === 'Action needed' && styles.actionNeededText]}>{rightText}</Text>}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profileRole}>
              {user?.role === 'REP' ? 'Sales rep' : user?.role || 'Role'} 
              {user?.employeeId ? ` · ${user.employeeId}` : ''}
            </Text>
            <Text style={styles.profileDetails}>
              {user?.territory ? `${user.territory} territory` : 'No territory'}
              {user?.managerName ? ` · Manager: ${user.managerName}` : ''}
            </Text>
          </View>
        </View>

        {/* My Activity */}
        <SectionHeader title="My activity" />
        <View style={styles.listContainer}>
          <ListItem 
            title="My attendance" 
            onPress={() => navigation.navigate('MyAttendance')} 
          />
          <View style={styles.divider} />
          <ListItem 
            title="My visits" 
            onPress={() => navigation.navigate('MyVisits')} 
          />
          <View style={styles.divider} />
          <ListItem 
            title="My leaves" 
            onPress={() => navigation.navigate('LeaveHistory')} 
          />
        </View>

        {/* Settings */}
        <SectionHeader title="Settings" />
        <View style={styles.listContainer}>
          <ListItem 
            title="Notifications" 
            onPress={() => navigation.navigate('Notifications')} 
          />
          <View style={styles.divider} />
          <ListItem 
            title="Location & tracking" 
            rightText={isBatteryRestricted ? "Action needed" : undefined} 
            onPress={() => navigation.navigate('LocationTracking')}
          />
        </View>

        {/* Account */}
        <SectionHeader title="Account" />
        <View style={styles.listContainer}>
          <ListItem 
            title="Change password" 
            onPress={() => navigation.navigate('ChangePassword')}
          />
          <View style={styles.divider} />
          <ListItem 
            title="Log out" 
            isDestructive 
            onPress={() => setLogoutModalVisible(true)} 
          />
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Text style={styles.modalIcon}>➔</Text>
            </View>
            <Text style={styles.modalTitle}>Log out?</Text>
            <Text style={styles.modalSubtitle}>
              You'll need your user ID and password to log in again.
            </Text>
            
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={() => {
                setLogoutModalVisible(false);
                dispatch(logout());
              }}
            >
              <Text style={styles.logoutButtonText}>Log out</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setLogoutModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: theme.colors.surfaceSecondary,
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
  profileCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    marginBottom: theme.spacing.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  avatarText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primary,
    fontSize: 20,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.ink,
    marginBottom: 4,
  },
  profileRole: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.inkLight,
    marginBottom: 2,
  },
  profileDetails: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.inkLighter,
  },
  sectionHeader: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.inkLight,
    marginBottom: theme.spacing.md,
  },
  listContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
  },
  listItemTitle: {
    fontFamily: theme.fonts.medium,
    fontSize: 16,
    color: theme.colors.ink,
  },
  destructiveText: {
    color: theme.colors.error,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemRightText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.inkLight,
    marginRight: theme.spacing.sm,
  },
  actionNeededText: {
    color: '#D97706', // warning amber
  },
  chevron: {
    fontSize: 20,
    color: theme.colors.inkLighter,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.line,
    marginLeft: theme.spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    width: '80%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 24,
    color: '#C62828',
    transform: [{ rotate: '180deg' }], // To make arrow point out
  },
  modalTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.ink,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.inkLight,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#C62828', // Red
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontFamily: theme.fonts.medium,
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  cancelButtonText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.medium,
    fontSize: 16,
  },
});
