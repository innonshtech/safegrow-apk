import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../../../api/client';

export const ForgotPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!userId.trim()) {
      Alert.alert('Error', 'Please enter your User ID');
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/forgot-password', { userId });
      setLoading(false);
      
      if (response.data.success) {
        navigation.navigate('VerifyCode', { 
          userId, 
          maskedEmail: response.data.maskedEmail 
        });
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.error || 'Failed to send verification code');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forgot Password</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.circle}>
            <Text style={styles.lockIcon}>{'?'}</Text>
          </View>
        </View>

        <Text style={styles.title}>Reset your password</Text>
        <Text style={styles.subtitle}>
          Enter your user ID. We'll send a verification code to your registered Email ID.
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>User ID</Text>
          <TextInput
            style={styles.input}
            value={userId}
            onChangeText={setUserId}
            autoCapitalize="none"
            placeholder="e.g. saket.patil"
          />
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, !userId.trim() && styles.buttonDisabled]} 
          onPress={handleSendCode}
          disabled={loading || !userId.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send code</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
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
    padding: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eef6f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIcon: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 24,
  },
  button: {
    backgroundColor: '#2e7d32',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
