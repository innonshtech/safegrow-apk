import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { apiClient } from '../../../api/client';

export const NewPasswordScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userId, otp } = route.params || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Validations
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const isFormValid = hasMinLength && hasNumber && passwordsMatch;

  const handleResetPassword = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/reset-password', { 
        userId, 
        otp, 
        newPassword: password 
      });
      setLoading(false);
      
      if (response.data.success) {
        navigation.navigate('PasswordResetSuccess');
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.error || 'Failed to reset password');
    }
  };

  const renderValidationItem = (isValid: boolean, text: string) => (
    <View style={styles.validationItem}>
      <Text style={[styles.validationIcon, isValid ? styles.validationIconValid : null]}>
        ✓
      </Text>
      <Text style={[styles.validationText, isValid ? styles.validationTextValid : null]}>
        {text}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Password</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.circle}>
            <Text style={styles.lockIcon}>{'🔒'}</Text>
          </View>
        </View>

        <Text style={styles.title}>Create a new password</Text>
        <Text style={styles.subtitle}>
          Choose a password you'll remember for next time.
        </Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="New password"
          />
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Confirm new password"
          />

          <View style={styles.validationContainer}>
            {renderValidationItem(hasMinLength, 'At least 8 characters')}
            {renderValidationItem(hasNumber, 'Contains a number')}
            {renderValidationItem(passwordsMatch, 'Both entries match')}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, !isFormValid && styles.buttonDisabled]} 
          onPress={handleResetPassword}
          disabled={loading || !isFormValid}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Reset password</Text>
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
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  validationContainer: {
    marginTop: 8,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  validationIcon: {
    fontSize: 12,
    color: '#999',
    marginRight: 8,
    fontWeight: 'bold',
  },
  validationIconValid: {
    color: '#2e7d32',
  },
  validationText: {
    fontSize: 14,
    color: '#999',
  },
  validationTextValid: {
    color: '#2e7d32',
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
