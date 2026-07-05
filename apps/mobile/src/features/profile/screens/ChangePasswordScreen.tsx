import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { apiClient } from '../../../api/client';

export const ChangePasswordScreen = () => {
  const navigation = useNavigation<any>();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Validations
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const isFormValid = currentPassword.length > 0 && hasMinLength && hasNumber && passwordsMatch;

  const handleChangePassword = async () => {
    if (!isFormValid) return;
    
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/change-password', { 
        currentPassword,
        newPassword
      });
      setLoading(false);
      
      if (response.data.success) {
        Alert.alert('Success', 'Your password has been changed successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.error || 'Failed to change password');
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
        <Text style={styles.headerTitle}>Change password</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              placeholder="••••••••"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              placeholder="••••••••"
            />
          </View>

          <View style={styles.inputGroup}>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="••••••••"
            />
          </View>

          <View style={styles.validationContainer}>
            {renderValidationItem(hasMinLength, 'At least 8 characters')}
            {renderValidationItem(hasNumber, 'Contains a number')}
            {renderValidationItem(passwordsMatch, 'Both new entries match')}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.button, !isFormValid && styles.buttonDisabled]} 
          onPress={handleChangePassword}
          disabled={loading || !isFormValid}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Update password</Text>
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
    backgroundColor: '#fafafa',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#333',
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
    backgroundColor: '#fafafa',
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
