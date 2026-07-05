import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, AppState, AppStateStatus } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';

export const LocationTrackingScreen = () => {
  const navigation = useNavigation<any>();

  const [locationStatus, setLocationStatus] = useState<string>('Checking...');
  const [preciseLocation, setPreciseLocation] = useState<boolean>(true); // React Native Permissions mostly checks precise
  const [isBatteryRestricted, setIsBatteryRestricted] = useState<boolean>(false);

  const checkPermissions = async () => {
    // Check Battery Optimization
    try {
      const isRestricted = await DeviceInfo.isBatteryOptimizationEnabled();
      setIsBatteryRestricted(isRestricted);
    } catch (e) {
      console.log('Error checking battery optimization', e);
    }

    // Check Location Permission
    try {
      const locPermission = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      if (locPermission === RESULTS.GRANTED) {
        // We can also check background location
        const bgPermission = await check(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
        if (bgPermission === RESULTS.GRANTED) {
          setLocationStatus('Always');
        } else {
          setLocationStatus('While in use');
        }
      } else {
        setLocationStatus('Denied');
      }
    } catch (e) {
      console.log('Error checking location permission', e);
    }
  };

  useEffect(() => {
    checkPermissions();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkPermissions();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleFixBattery = () => {
    // Open Android Battery Optimization Settings
    Linking.sendIntent('android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS');
  };

  const handleOpenSettings = () => {
    Linking.openSettings();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location & tracking</Text>
      </View>

      <View style={styles.content}>
        {isBatteryRestricted && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningTitle}>Action needed</Text>
            <Text style={styles.warningText}>
              Battery saver may stop tracking. Fix the item below.
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Status</Text>

        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleOpenSettings}>
            <Text style={styles.rowTitle}>Location permission</Text>
            <Text style={[
              styles.rowStatus, 
              locationStatus === 'Denied' ? styles.statusError : styles.statusSuccess
            ]}>
              {locationStatus}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={handleOpenSettings}>
            <Text style={styles.rowTitle}>Precise location</Text>
            <View style={preciseLocation ? styles.toggleActive : styles.toggleInactive}>
              <View style={styles.toggleKnob} />
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={handleFixBattery}>
            <Text style={styles.rowTitle}>Battery optimisation</Text>
            <View style={styles.rightActions}>
              {isBatteryRestricted ? (
                <>
                  <Text style={styles.statusWarning}>Restricted</Text>
                  <View style={styles.fixButton}>
                    <Text style={styles.fixButtonText}>Fix</Text>
                  </View>
                </>
              ) : (
                <Text style={styles.statusSuccess}>Unrestricted</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          Tracking only runs while you're checked in.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  warningBanner: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eaeaea',
    overflow: 'hidden',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowTitle: {
    fontSize: 16,
    color: '#333',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowStatus: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusSuccess: {
    color: '#2e7d32',
  },
  statusWarning: {
    color: '#b45309',
    marginRight: 12,
  },
  statusError: {
    color: '#d32f2f',
  },
  fixButton: {
    backgroundColor: '#92400e',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  fixButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  toggleActive: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 2,
  },
  toggleInactive: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#eaeaea',
    marginLeft: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#999',
    marginLeft: 4,
  },
});
