import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { theme } from '../../../config/theme';
import { apiClient } from '../../../api/client';

export const LeaveHistoryScreen = () => {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<any>(null);

  const fetchLeaves = async () => {
    try {
      const [leavesRes, balanceRes] = await Promise.all([
        apiClient.get('/leaves'),
        apiClient.get('/leaves/balance'),
      ]);
      setLeaves(leavesRes.data.leaves);
      setBalance(balanceRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchLeaves();
    }
  }, [isFocused]);

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Leave",
      "Are you sure you want to delete this leave request?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await apiClient.delete(`/leaves/${id}`);
              fetchLeaves();
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Failed to delete leave request");
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEdit = (item: any) => {
    navigation.navigate('LeaveApplication', { editLeave: item });
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.typeText}>{item.type}</Text>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
            {item.status === 'PENDING' && (
              <>
                <TouchableOpacity onPress={() => handleEdit(item)}>
                  <Text style={{color: theme.colors.primary, fontFamily: theme.fonts.medium, fontSize: 13}}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={{color: theme.colors.error, fontFamily: theme.fonts.medium, fontSize: 13}}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
            <View style={[styles.statusBadge, styles[`status_${item.status}` as keyof typeof styles]]}>
              <Text style={[styles.statusText, styles[`statusText_${item.status}` as keyof typeof styles]]}>{item.status}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.startDate).toLocaleDateString()} to {new Date(item.endDate).toLocaleDateString()}
        </Text>
        <Text style={styles.reasonText}>{item.reason}</Text>
        <View style={styles.daysContainer}>
          <Text style={styles.daysText}>{item.totalDays} Total Days</Text>
          {item.unpaidDays > 0 && (
            <Text style={styles.unpaidText}> ({item.unpaidDays} Unpaid)</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Leaves</Text>
      </View>

      {balance && (
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Yearly Leave Balances</Text>
          <View style={{marginTop: 8}}>
            <Text style={styles.balanceValue}>Casual: {Math.max(0, balance.casual.limit - balance.casual.used)} / {balance.casual.limit}</Text>
            <Text style={styles.balanceValue}>Privilege: {Math.max(0, balance.privilege.limit - balance.privilege.used)} / {balance.privilege.limit}</Text>
            <Text style={styles.balanceValue}>Medical (Monthly): {Math.max(0, balance.medical.monthlyLimit - balance.medical.usedThisMonth)} / {balance.medical.monthlyLimit}</Text>
            <Text style={styles.balanceValue}>Medical (Yearly): {Math.max(0, balance.medical.yearlyLimit - balance.medical.usedThisYear)} / {balance.medical.yearlyLimit}</Text>
          </View>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={leaves}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchLeaves} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No leave requests found.</Text>}
        />
      )}

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('LeaveApplication')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.surfaceSecondary },
  header: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, paddingTop: 50 },
  backButton: { fontSize: 32, color: theme.colors.inkLight, marginRight: theme.spacing.md },
  headerTitle: { fontFamily: theme.fonts.bold, fontSize: 20, color: theme.colors.ink },
  balanceCard: { margin: theme.spacing.md, padding: theme.spacing.lg, backgroundColor: theme.colors.surface, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.primaryLight },
  balanceTitle: { fontFamily: theme.fonts.medium, fontSize: 14, color: theme.colors.inkLight },
  balanceValue: { fontFamily: theme.fonts.bold, fontSize: 18, color: theme.colors.primary, marginTop: 4 },
  listContainer: { padding: theme.spacing.md, paddingBottom: 100 },
  card: { backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.radius.md, marginBottom: theme.spacing.md, borderWidth: 1, borderColor: theme.colors.line },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeText: { fontFamily: theme.fonts.bold, fontSize: 16, color: theme.colors.ink },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontFamily: theme.fonts.medium, fontSize: 12 },
  status_PENDING: { backgroundColor: '#fef3c7' },
  statusText_PENDING: { color: '#92400e' },
  status_APPROVED: { backgroundColor: '#d1fae5' },
  statusText_APPROVED: { color: '#065f46' },
  status_REJECTED: { backgroundColor: '#fee2e2' },
  statusText_REJECTED: { color: '#991b1b' },
  dateText: { fontFamily: theme.fonts.medium, fontSize: 14, color: theme.colors.inkLight, marginBottom: 4 },
  reasonText: { fontFamily: theme.fonts.regular, fontSize: 14, color: theme.colors.ink },
  daysContainer: { flexDirection: 'row', marginTop: 8 },
  daysText: { fontFamily: theme.fonts.medium, fontSize: 12, color: theme.colors.inkLight },
  unpaidText: { fontFamily: theme.fonts.bold, fontSize: 12, color: theme.colors.error },
  emptyText: { textAlign: 'center', marginTop: 40, fontFamily: theme.fonts.regular, color: theme.colors.inkLight },
  fab: { position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  fabIcon: { fontSize: 32, color: '#fff', lineHeight: 34 },
});
