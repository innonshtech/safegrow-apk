import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { theme } from '../../../config/theme';

export const TeamMemberVisitDetailScreen = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { visit, visitNumber, totalVisits } = route.params;

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 8 }}>
          <Text style={{ fontSize: 24, color: theme.colors.ink }}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Visit {visitNumber} of {totalVisits}</Text>
      </View>

      {/* Media (Photo or Map fallback) */}
      <View style={styles.mediaContainer}>
        {visit.photoUrl ? (
          <Image source={{ uri: visit.photoUrl }} style={styles.media} resizeMode="cover" />
        ) : (
          <MapView
            style={styles.media}
            initialRegion={{
              latitude: visit.lat,
              longitude: visit.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={{ latitude: visit.lat, longitude: visit.lng }} />
          </MapView>
        )}
        
        {/* Overlay Overlay */}
        <View style={styles.overlayBox}>
          <Text style={styles.overlayTextBold}>{visit.lat.toFixed(4)}, {visit.lng.toFixed(4)}</Text>
          <Text style={styles.overlayText}>{formatDate(visit.time)} · {formatTime(visit.time)} · {visit.area}</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailsRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.vendorName}>{visit.vendorName}</Text>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>🕒</Text>
            <Text style={styles.detailText}>{formatTime(visit.time)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{visit.lat.toFixed(4)}, {visit.lng.toFixed(4)}</Text>
          </View>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{visit.outcome === 'ORDER_PLACED' ? 'Order placed' : 'Met'}</Text>
        </View>
      </View>

      {visit.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{visit.notes}</Text>
        </View>
      )}

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
    fontSize: 18,
    color: theme.colors.ink,
    marginLeft: theme.spacing.sm,
  },
  mediaContainer: {
    height: 400,
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    backgroundColor: '#D1D5DB', // gray-300 placeholder
    marginBottom: theme.spacing.xl,
    position: 'relative',
  },
  media: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayBox: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    borderRadius: 8,
  },
  overlayTextBold: {
    color: 'white',
    fontFamily: theme.fonts.bold,
    fontSize: 13,
    marginBottom: 2,
  },
  overlayText: {
    color: 'white',
    fontFamily: theme.fonts.regular,
    fontSize: 11,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vendorName: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.ink,
    marginBottom: theme.spacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 6,
    color: theme.colors.inkLight,
  },
  detailText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.inkLight,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: theme.colors.primaryDark,
    fontFamily: theme.fonts.medium,
    fontSize: 13,
  },
  notesSection: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  },
  notesTitle: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 16,
    color: theme.colors.ink,
    marginBottom: theme.spacing.sm,
  },
  notesText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.inkLight,
    lineHeight: 20,
  }
});
