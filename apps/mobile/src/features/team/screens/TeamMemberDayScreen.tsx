import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MapView, { Polyline, Marker } from 'react-native-maps';
import { theme } from '../../../config/theme';
import { apiClient } from '../../../api/client';

export const TeamMemberDayScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { memberId, memberName } = route.params;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDay = async () => {
      try {
        const response = await apiClient.get(`/manager/team/${memberId}/day`);
        setData(response.data.attendance);
      } catch (error) {
        console.error('Failed to fetch team member day', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDay();
  }, [memberId]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const formatTime = (isoString: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const initialRegion = data?.route?.length > 0 ? {
    latitude: data.route[0].latitude,
    longitude: data.route[0].longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : undefined;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 24, color: theme.colors.ink }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{memberName}</Text>
        <Text style={styles.headerSubtitle}>Pune territory</Text>
      </View>

      {/* Date Selector (Static for MVP) */}
      <View style={styles.dateSelector}>
        <Text style={styles.chevron}>‹</Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>

      {/* Metrics Row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.metricsRow}>
        <View style={styles.metricPill}>
          <Text style={styles.metricText}>In {formatTime(data?.checkInTime)}</Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricText}>Out {formatTime(data?.checkOutTime)}</Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricText}>{data?.visitsCount || 0} visits</Text>
        </View>
        <View style={styles.metricPill}>
          <Text style={styles.metricText}>{data?.distanceKm || '0'} km</Text>
        </View>
      </ScrollView>

      {/* Map */}
      <View style={styles.mapContainer}>
        {initialRegion ? (
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
          >
            {data.route.length > 0 && (
              <Polyline
                coordinates={data.route}
                strokeColor={theme.colors.primaryDark}
                strokeWidth={4}
              />
            )}
            {/* Start point */}
            {data.route.length > 0 && (
              <Marker coordinate={data.route[0]}>
                <View style={styles.mapMarkerStart}><Text style={styles.mapMarkerText}>L</Text></View>
              </Marker>
            )}
            {/* End point */}
            {data.route.length > 1 && (
              <Marker coordinate={data.route[data.route.length - 1]}>
                <View style={styles.mapMarkerEnd}><Text style={styles.mapMarkerText}>E</Text></View>
              </Marker>
            )}
            {/* Visits */}
            {data.visits?.map((visit: any, index: number) => (
              <Marker key={visit.id} coordinate={{ latitude: visit.lat, longitude: visit.lng }}>
                <View style={styles.visitMarker}><Text style={styles.visitMarkerText}>{index + 1}</Text></View>
              </Marker>
            ))}
          </MapView>
        ) : (
          <View style={[styles.map, { justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: theme.colors.inkLight }}>No location data available</Text>
          </View>
        )}
      </View>

      {/* Visits List */}
      <Text style={styles.sectionTitle}>Visits</Text>
      <View style={styles.visitsList}>
        {data?.visits?.map((visit: any, index: number) => (
          <TouchableOpacity 
            key={visit.id} 
            style={styles.visitCard}
            onPress={() => navigation.navigate('TeamMemberVisitDetail', { visit, visitNumber: index + 1, totalVisits: data.visits.length })}
          >
            <View style={styles.visitNumberBadge}>
              <Text style={styles.visitNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.visitInfo}>
              <Text style={styles.visitName}>{visit.vendorName}</Text>
              <Text style={styles.visitTime}>{formatTime(visit.time)}</Text>
            </View>
            <View style={styles.visitStatusBadge}>
              <Text style={styles.visitStatusText}>{visit.outcome === 'ORDER_PLACED' ? 'Order' : 'Met'}</Text>
            </View>
          </TouchableOpacity>
        ))}
        {(!data?.visits || data.visits.length === 0) && (
          <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.inkLight }}>No visits for this day.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    padding: theme.spacing.md,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.ink,
    marginLeft: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  headerSubtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.inkLight,
    marginTop: 4,
  },
  dateSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
  },
  dateText: {
    fontFamily: theme.fonts.bold,
    fontSize: 16,
    color: theme.colors.ink,
  },
  chevron: {
    fontSize: 20,
    color: theme.colors.inkLight,
  },
  metricsRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
  },
  metricPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: 20,
    marginRight: 8,
  },
  metricText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.inkLight,
  },
  mapContainer: {
    height: 250,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.xl,
    backgroundColor: '#E8F5E9',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapMarkerStart: {
    backgroundColor: theme.colors.primaryDark,
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'white',
  },
  mapMarkerEnd: {
    backgroundColor: theme.colors.primaryDark,
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'white',
  },
  mapMarkerText: {
    color: 'white', fontSize: 10, fontFamily: theme.fonts.bold,
  },
  visitMarker: {
    backgroundColor: 'white',
    width: 24, height: 24, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: theme.colors.primaryDark,
  },
  visitMarkerText: {
    color: theme.colors.primaryDark, fontSize: 12, fontFamily: theme.fonts.bold,
  },
  sectionTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 18,
    color: theme.colors.ink,
    marginBottom: theme.spacing.md,
  },
  visitsList: {
    gap: theme.spacing.sm,
    paddingBottom: 40,
  },
  visitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
  },
  visitNumberBadge: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center', alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  visitNumberText: {
    color: theme.colors.primaryDark,
    fontFamily: theme.fonts.bold,
    fontSize: 14,
  },
  visitInfo: {
    flex: 1,
  },
  visitName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: theme.colors.ink,
    marginBottom: 2,
  },
  visitTime: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.inkLight,
  },
  visitStatusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
  },
  visitStatusText: {
    color: theme.colors.primaryDark,
    fontFamily: theme.fonts.medium,
    fontSize: 12,
  }
});
