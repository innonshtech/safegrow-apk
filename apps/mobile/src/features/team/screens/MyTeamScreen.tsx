import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../config/theme';
import { apiClient } from '../../../api/client';

export const MyTeamScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    summary: { checkedIn: number; checkedOut: number; trackingOff: number };
    members: any[];
  } | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await apiClient.get('/manager/team/status');
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch team status', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>My Team</Text>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{data?.summary.checkedIn || 0}</Text>
          <Text style={styles.summaryLabel}>Checked in</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{data?.summary.checkedOut || 0}</Text>
          <Text style={styles.summaryLabel}>Checked out</Text>
        </View>
        <View style={[styles.summaryCard, styles.summaryCardWarning]}>
          <Text style={[styles.summaryValue, { color: '#B45309' }]}>{data?.summary.trackingOff || 0}</Text>
          <Text style={[styles.summaryLabel, { color: '#B45309' }]}>Tracking off</Text>
        </View>
      </View>

      {/* Team List */}
      <View style={styles.listContainer}>
        {data?.members.map((member) => (
          <TouchableOpacity 
            key={member.id} 
            style={styles.memberCard}
            onPress={() => navigation.navigate('TeamMemberDay', { memberId: member.id, memberName: member.name })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={[
                styles.memberStatus, 
                member.status === 'Tracking off' && { color: '#B45309' }
              ]}>
                {member.status} {member.status !== 'Tracking off' ? `· ${member.visitsCount} visits` : ''}
              </Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
        {data?.members.length === 0 && (
          <Text style={{ textAlign: 'center', marginTop: 20, color: theme.colors.inkLight }}>No team members found.</Text>
        )}
      </View>
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
  headerTitle: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    color: theme.colors.ink,
    marginBottom: theme.spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.xl,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  summaryCardWarning: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  summaryValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.ink,
    marginBottom: 4,
  },
  summaryLabel: {
    fontFamily: theme.fonts.medium,
    fontSize: 12,
    color: theme.colors.inkLight,
  },
  listContainer: {
    gap: theme.spacing.sm,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontFamily: theme.fonts.bold,
    color: theme.colors.primaryDark,
    fontSize: 14,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontFamily: theme.fonts.semiBold,
    fontSize: 15,
    color: theme.colors.ink,
    marginBottom: 2,
  },
  memberStatus: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.inkLight,
  },
  chevron: {
    fontSize: 20,
    color: theme.colors.inkLighter,
    fontFamily: theme.fonts.regular,
  }
});
