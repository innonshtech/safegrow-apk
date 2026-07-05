import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { checkOut } from '../../attendance/store/attendanceSlice';
import { Button } from '../../../components/ui/Button';
import { theme } from '../../../config/theme';
import { logout } from '../../auth/store/authSlice';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { apiClient } from '../../../api/client';
import Geolocation from 'react-native-geolocation-service';

export const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [liveHours, setLiveHours] = useState('0.0');
  const [liveDistance, setLiveDistance] = useState('0.0');

  useFocusEffect(
    useCallback(() => {
      const fetchVisits = async () => {
        try {
          setLoadingVisits(true);
          const response = await apiClient.get('/visits/history');
          setVisits(response.data);
        } catch (error) {
          console.error('Failed to fetch visits:', error);
        } finally {
          setLoadingVisits(false);
        }
      };

      fetchVisits();
    }, [])
  );
  
  const { isCheckedIn, checkInTime, checkInTimestamp, visitsCount, distanceKm, hoursTracked } = useSelector(
    (state: RootState) => state.attendance
  );

  React.useEffect(() => {
    let interval: any;
    if (isCheckedIn && checkInTimestamp) {
      const updateMetrics = async () => {
        // Calculate live hours
        const diffMs = Date.now() - new Date(checkInTimestamp).getTime();
        const hrs = diffMs / (1000 * 60 * 60);
        setLiveHours(hrs.toFixed(1));

        // Get live distance from Location Service
        try {
          const BackgroundGeolocation = require('react-native-background-geolocation').default;
          const odometer = await BackgroundGeolocation.getOdometer();
          setLiveDistance((odometer / 1000).toFixed(1));
        } catch (e) {
          // ignore or fallback to redux distanceKm
          setLiveDistance(distanceKm.toString());
        }
      };

      updateMetrics();
      interval = setInterval(updateMetrics, 10000); // refresh every 10 seconds
    } else {
      setLiveHours('0.0');
      setLiveDistance('0.0');
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, checkInTimestamp, distanceKm]);

  const user = useSelector((state: RootState) => state.auth.user);
  const firstName = user?.name?.split(' ')[0] || 'User';
  
  // Calculate initials from user name
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  const initials = getInitials(user?.name || '');

  const handleCheckInPress = () => {
    navigation.navigate('CheckIn');
  };

  const handleCheckOutPress = () => {
    navigation.navigate('CheckOut');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {firstName}</Text>
          <Text style={styles.dateText}>
            {isCheckedIn ? `Checked in · ${checkInTime}` : 'Wed, 12 March'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Status Chip */}
      <View style={[styles.statusChip, isCheckedIn && styles.statusChipActive]}>
        {isCheckedIn && <View style={styles.statusDot} />}
        <Text style={[styles.statusText, isCheckedIn && styles.statusTextActive]}>
          {isCheckedIn ? 'Tracking on' : 'Not checked in'}
        </Text>
      </View>

      {!isCheckedIn ? (
        /* NOT CHECKED IN STATE */
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Start your day</Text>
          <Text style={styles.cardDesc}>
            Check in to begin tracking. Tracking only runs while you're checked in.
          </Text>
          
          <View style={styles.emptyVisits}>
            <Text style={styles.emptyVisitsText}>No visits yet check in to begin</Text>
          </View>
          
          <Button title="Check in" onPress={handleCheckInPress} />
        </View>
      ) : (
        /* CHECKED IN STATE */
        <View>
          {/* Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Visits</Text>
              <Text style={styles.metricValue}>{visitsCount}</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Distance</Text>
              <Text style={styles.metricValue}>{liveDistance} km</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={styles.metricLabel}>Hours</Text>
              <Text style={styles.metricValue}>{liveHours}</Text>
            </View>
          </View>

          {/* Visits List */}
          <View style={styles.visitsContainer}>
            {visits.map((visit) => (
              <View key={visit.id} style={styles.visitCard}>
                {visit.photoUrl ? (
                  <Image source={{ uri: visit.photoUrl }} style={styles.visitIconImage} />
                ) : (
                  <View style={styles.visitIconPlaceholder} />
                )}
                <View style={styles.visitDetails}>
                  <Text style={styles.visitName}>{visit.vendorName}</Text>
                  <Text style={styles.visitTime}>{new Date(visit.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} · {visit.area}</Text>
                </View>
                <Text style={styles.visitStatus}>{visit.outcome.replace('_', '\n')}</Text>
              </View>
            ))}
            {visits.length === 0 && !loadingVisits && (
              <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.inkLight }}>No visits recorded yet.</Text>
            )}
          </View>

          <View style={styles.actionsContainer}>
            <Button title="New buyer visit" onPress={() => navigation.navigate('VisitCamera')} />
            <View style={{ height: theme.spacing.md }} />
            <Button title="Check out" variant="outline" onPress={handleCheckOutPress} loading={loadingCheckout} />
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSecondary,
  },
  content: {
    padding: theme.spacing.lg,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  greeting: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.ink,
  },
  dateText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.inkLight,
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.primary,
  },
  statusChip: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.line,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChipActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: 'transparent',
    borderWidth: 0,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.success,
    marginRight: 6,
  },
  statusText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.inkLight,
  },
  statusTextActive: {
    color: theme.colors.success,
    fontFamily: theme.fonts.semiBold,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  cardTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 18,
    color: theme.colors.ink,
    marginBottom: theme.spacing.xs,
  },
  cardDesc: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.inkLight,
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  emptyVisits: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSecondary,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xl,
  },
  emptyVisitsText: {
    fontFamily: theme.fonts.medium,
    color: theme.colors.inkLighter,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  metricBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: 20,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  metricLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.inkLight,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 22,
    color: theme.colors.ink,
  },
  visitsContainer: {
    marginBottom: theme.spacing.xl,
  },
  visitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    marginBottom: theme.spacing.sm,
  },
  visitIconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F7F5',
    marginRight: theme.spacing.md,
  },
  visitIconImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: theme.spacing.md,
    backgroundColor: '#F5F7F5',
  },
  visitDetails: {
    flex: 1,
  },
  visitName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 14,
    color: theme.colors.ink,
    marginBottom: 2,
  },
  visitTime: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.inkLight,
  },
  visitStatus: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 11,
    color: theme.colors.success,
    textAlign: 'center',
    lineHeight: 14,
  },
  actionsContainer: {
    marginTop: theme.spacing.md,
  },
});
