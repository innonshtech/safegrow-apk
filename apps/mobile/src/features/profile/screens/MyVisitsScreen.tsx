import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../config/theme';
import { apiClient } from '../../../api/client';

export const MyVisitsScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState('Today');
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/visits/history');
        setVisits(response.data);
      } catch (error) {
        console.error('Failed to fetch visits history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredVisits = useMemo(() => {
    const now = new Date();
    return visits.filter(visit => {
      const visitDate = new Date(visit.time);
      if (activeTab === 'Today') {
        return visitDate.toDateString() === now.toDateString();
      }
      if (activeTab === 'This week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return visitDate >= weekAgo;
      }
      if (activeTab === 'Month') {
        return visitDate.getMonth() === now.getMonth() && visitDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }, [visits, activeTab]);

  const ordersCount = filteredVisits.filter(v => v.outcome === 'ORDER_PLACED').length;

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My visits</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['Today', 'This week', 'Month'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.summaryText}>{filteredVisits.length} visits {activeTab.toLowerCase()} · {ordersCount} orders</Text>

        {/* List */}
        <View style={styles.listContainer}>
          {filteredVisits.map((item, index) => {
            const timeStr = new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            let status = 'N/A';
            if (item.outcome === 'ORDER_PLACED') status = 'Order';
            if (item.outcome === 'MET') status = 'Met';

            return (
              <View key={item.id}>
                <View style={styles.visitCard}>
                  <View style={styles.visitIconPlaceholder} />
                  <View style={styles.visitDetails}>
                    <Text style={styles.visitName}>{item.buyerName || 'Unknown Buyer'}</Text>
                    <Text style={styles.visitTime}>{timeStr}</Text>
                  </View>
                  <View style={[
                    styles.statusPill, 
                    status === 'N/A' && styles.statusPillNeutral
                  ]}>
                    <Text style={[
                      styles.statusText,
                      status === 'N/A' && styles.statusTextNeutral
                    ]}>
                      {status}
                    </Text>
                  </View>
                </View>
                {index < filteredVisits.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 2,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
  },
  activeTab: {
    backgroundColor: theme.colors.surfaceSecondary, // slightly darker for selected
  },
  tabText: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.inkLight,
  },
  activeTabText: {
    color: theme.colors.ink,
    fontFamily: theme.fonts.bold,
  },
  summaryText: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.inkLight,
    marginBottom: theme.spacing.md,
  },
  listContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    overflow: 'hidden',
  },
  visitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  visitIconPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: theme.colors.surfaceSecondary,
    marginRight: theme.spacing.md,
  },
  visitDetails: {
    flex: 1,
  },
  visitName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: theme.colors.ink,
    marginBottom: 4,
  },
  visitTime: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.inkLight,
  },
  statusPill: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)', // Light green
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
  },
  statusText: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.success,
  },
  statusPillNeutral: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
  statusTextNeutral: {
    color: theme.colors.inkLight,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.line,
  },
});
