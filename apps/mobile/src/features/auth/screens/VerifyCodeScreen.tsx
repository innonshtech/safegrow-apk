import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiClient } from '../../../api/client';

export const VerifyCodeScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId, maskedEmail } = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  
  const inputs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { userId });
      setLoading(false);
      setResendTimer(30);
      Alert.alert('Success', 'Verification code resent!');
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.error || 'Failed to resend code');
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      Alert.alert('Error', 'Please enter the full 6-digit code');
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/verify-otp', { userId, otp: otpString });
      setLoading(false);
      
      if (response.data.success) {
        navigation.navigate('NewPassword', { userId, otp: otpString });
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.error || 'Invalid or expired code');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verify Code</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.circle}>
            <Text style={styles.chatIcon}>{'💬'}</Text>
          </View>
        </View>

        <Text style={styles.title}>Enter the code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to your registered Email{'\n'}{maskedEmail}
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputs.current[index] = ref}
              style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(val) => handleOtpChange(val, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
          <Text style={[styles.resendText, resendTimer > 0 && styles.resendTextDisabled]}>
            {resendTimer > 0 ? `Resend code in 0:${resendTimer.toString().padStart(2, '0')}` : 'Resend code'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, otp.join('').length < 6 && styles.buttonDisabled]} 
          onPress={handleVerify}
          disabled={loading || otp.join('').length < 6}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
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
  chatIcon: {
    fontSize: 40,
    color: '#2e7d32',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  otpInputFilled: {
    borderColor: '#2e7d32',
  },
  resendText: {
    textAlign: 'center',
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '500',
  },
  resendTextDisabled: {
    color: '#999',
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
