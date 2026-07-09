import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { theme } from '../../../config/theme';
import { apiClient } from '../../../api/client';

export const MyAttendanceScreen = () => {
  const navigation = useNavigation<any>();
  const [attendances, setAttendances] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/attendance/history');
        if (response.data.attendances) {
          setAttendances(response.data.attendances);
          setRequests(response.data.requests || []);
        } else {
          // fallback if API hasn't been updated yet on the server
          setAttendances(response.data);
          setRequests([]);
        }
      } catch (error) {
        console.error('Failed to fetch attendance history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const calculateHours = (inTime: string, outTime: string) => {
    const diffMs = new Date(outTime).getTime() - new Date(inTime).getTime();
    if (diffMs < 0) return '—';
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const getStatus = (att: any) => {
    if (att.checkInTime && att.checkOutTime) return 'Complete';
    if (att.checkInTime && !att.checkOutTime) return 'Incomplete';
    return 'Off';
  };

  const presentDays = attendances.length;
  const totalHoursFloat = attendances.reduce((acc, curr) => {
    if (curr.checkInTime && curr.checkOutTime) {
      const diff = new Date(curr.checkOutTime).getTime() - new Date(curr.checkInTime).getTime();
      return acc + diff / (1000 * 60 * 60);
    }
    return acc;
  }, 0);
  
  const avgDay = presentDays > 0 ? (totalHoursFloat / presentDays).toFixed(1) : '0.0';

  const getMarkedDates = () => {
    const marks: any = {};
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Mark past days up to today as absent (red) if they are weekdays
    for (let d = 1; d <= today.getDate(); d++) {
      const iterDate = new Date(currentYear, currentMonth, d);
      const dayOfWeek = iterDate.getDay();
      
      // Assume Sunday (0) is weekly off
      if (dayOfWeek !== 0) {
        // Adjust for local time zone to get correct YYYY-MM-DD
        const dateString = new Date(iterDate.getTime() - (iterDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        marks[dateString] = { selected: true, selectedColor: theme.colors.danger, customStyles: { container: { borderRadius: 8 } } };
      }
    }

    // Overwrite with actual attendances
    attendances.forEach(att => {
      const dateObj = new Date(att.date);
      const dateString = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const status = getStatus(att);
      if (status === 'Complete') {
        marks[dateString] = { selected: true, selectedColor: theme.colors.primary, customStyles: { container: { borderRadius: 8 } } };
      } else if (status === 'Incomplete') {
        marks[dateString] = { selected: true, selectedColor: theme.colors.danger, customStyles: { container: { borderRadius: 8 } } }; // Red for missed entries
      }
    });

    // Add yellow/amber marks for pending requests if they don't override a complete day
    requests.forEach(req => {
      if (req.status === 'PENDING') {
        const dateObj = new Date(req.date);
        const dateString = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        if (!marks[dateString] || marks[dateString].selectedColor !== theme.colors.primary) {
           marks[dateString] = { selected: true, selectedColor: theme.colors.warning, customStyles: { container: { borderRadius: 8 } } };
        }
      }
    });

    return marks;
  };

  const handleDayPress = (day: any) => {
    const dateStr = day.dateString; // YYYY-MM-DD
    
    // Prevent applying for future dates
    const today = new Date();
    const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    
    if (dateStr > todayStr) {
      Alert.alert('Invalid Date', 'You can only apply for past attendance, not future.');
      return;
    }

    // Pass the selected date to the manual request screen
    navigation.navigate('ManualAttendanceRequest', { date: dateStr });
  };

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
        <Text style={styles.headerTitle}>My attendance</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            markingType={'custom'}
            markedDates={getMarkedDates()}
            onDayPress={handleDayPress}
            theme={{
              todayTextColor: theme.colors.primary,
              arrowColor: theme.colors.primary,
            }}
          />
          <Text style={styles.calendarHint}>Tap a date to apply for manual check-in/out.</Text>
        </View>

        {/* Summary Metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Present</Text>
            <Text style={styles.metricValue}>{presentDays}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Hours</Text>
            <Text style={styles.metricValue}>{Math.round(totalHoursFloat)}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Avg day</Text>
            <Text style={styles.metricValue}>{avgDay}h</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Manual Requests</Text>
        
        {requests.length === 0 ? (
          <Text style={styles.emptyText}>No manual requests found.</Text>
        ) : (
          <View style={styles.listContainer}>
            {requests.map((item, index) => {
              const dateStr = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
              
              let statusPillStyle = styles.statusPillNeutral;
              let statusTextStyle = styles.statusTextNeutral;
              
              if (item.status === 'APPROVED') {
                statusPillStyle = styles.statusPillSuccess;
                statusTextStyle = styles.statusTextSuccess;
              } else if (item.status === 'PENDING') {
                statusPillStyle = styles.statusPillWarning;
                statusTextStyle = styles.statusTextWarning;
              } else if (item.status === 'REJECTED') {
                statusPillStyle = styles.statusPillDanger;
                statusTextStyle = styles.statusTextDanger;
              }

              return (
                <View key={item.id}>
                  <View style={styles.listItem}>
                    <View style={styles.listItemLeft}>
                      <Text style={styles.itemDate}>{dateStr}</Text>
                      <Text style={styles.itemTime} numberOfLines={1}>Reason: {item.reason}</Text>
                    </View>
                    <View style={styles.listItemRight}>
                      <View style={[styles.statusPill, statusPillStyle]}>
                        <Text style={[styles.statusText, statusTextStyle]}>
                          {item.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {index < requests.length - 1 && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent days</Text>

        {/* List */}
        <View style={styles.listContainer}>
          {attendances.map((item, index) => {
            const dateStr = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
            const inStr = new Date(item.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const outStr = item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--';
            const status = getStatus(item);
            const hours = item.checkOutTime ? calculateHours(item.checkInTime, item.checkOutTime) : (status === 'Incomplete' ? '—' : null);

            return (
              <View key={item.id}>
                <View style={styles.listItem}>
                  <View style={styles.listItemLeft}>
                    <Text style={styles.itemDate}>{dateStr}</Text>
                    {item.checkInTime ? (
                      <Text style={styles.itemTime}>In {inStr} · Out {outStr}</Text>
                    ) : (
                      <Text style={styles.itemTime}>Weekly off</Text>
                    )}
                  </View>
                  <View style={styles.listItemRight}>
                    {hours && <Text style={styles.itemHours}>{hours}</Text>}
                    <View style={[
                      styles.statusPill, 
                      status === 'Complete' && styles.statusPillSuccess,
                      status === 'Incomplete' && styles.statusPillDanger,
                      status === 'Off' && styles.statusPillNeutral
                    ]}>
                      <Text style={[
                        styles.statusText,
                        status === 'Complete' && styles.statusTextSuccess,
                        status === 'Incomplete' && styles.statusTextDanger,
                        status === 'Off' && styles.statusTextNeutral
                      ]}>
                        {status}
                      </Text>
                    </View>
                  </View>
                </View>
                {index < attendances.length - 1 && <View style={styles.divider} />}
              </View>
            );
          })}
        </View>
        
        <View style={{ height: 40 }} />
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
  calendarContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  calendarHint: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.inkLight,
    textAlign: 'center',
    marginTop: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  metricBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    alignItems: 'center',
  },
  metricLabel: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.inkLight,
    marginBottom: 4,
  },
  metricValue: {
    fontFamily: theme.fonts.bold,
    fontSize: 20,
    color: theme.colors.ink,
  },
  sectionTitle: {
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
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  listItemLeft: {
    flex: 1,
  },
  itemDate: {
    fontFamily: theme.fonts.medium,
    fontSize: 15,
    color: theme.colors.ink,
    marginBottom: 2,
  },
  itemTime: {
    fontFamily: theme.fonts.regular,
    fontSize: 13,
    color: theme.colors.inkLight,
  },
  listItemRight: {
    alignItems: 'flex-end',
  },
  itemHours: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.ink,
    marginBottom: 4,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
  },
  statusText: {
    fontFamily: theme.fonts.medium,
    fontSize: 11,
  },
  statusPillSuccess: {
    backgroundColor: 'rgba(46, 125, 50, 0.1)', 
  },
  statusTextSuccess: {
    color: theme.colors.primary,
  },
  statusPillDanger: {
    backgroundColor: 'rgba(179, 38, 30, 0.1)',
  },
  statusTextDanger: {
    color: theme.colors.danger,
  },
  statusPillWarning: {
    backgroundColor: 'rgba(138, 90, 0, 0.1)', 
  },
  statusTextWarning: {
    color: theme.colors.warning,
  },
  statusPillNeutral: {
    backgroundColor: theme.colors.surfaceSecondary,
  },
  statusTextNeutral: {
    color: theme.colors.inkLight,
  },
  emptyText: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    color: theme.colors.inkLight,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.line,
    marginLeft: theme.spacing.lg,
  },
});
