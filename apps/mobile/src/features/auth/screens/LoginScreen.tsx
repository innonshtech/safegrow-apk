import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, KeyboardAvoidingView, Platform, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { theme } from '../../../config/theme';
import { z } from 'zod';
import { LoginRequestSchema } from '@safegrow/shared';
import { apiClient } from '../../../api/client';
import { globalToast } from '../../../components/ui/ToastProvider';

export const LoginScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ userId?: string; password?: string }>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      setErrors({});
      setAuthError(null);
      // Validate using shared DTO
      LoginRequestSchema.parse({ userId, password });
      
      setLoading(true);
      const response = await apiClient.post('/auth/login', { userId, password });
      
      const { accessToken, user } = response.data;
      dispatch(setCredentials({ token: accessToken, user }));
      globalToast.show({ message: `Welcome back, ${user.name}!`, type: 'success' });
      setLoading(false);
    } catch (error: any) {
      console.error('Login error:', error);
      
      const serverError = error?.response?.data?.error;
      
      if (serverError === 'Account is inactive') {
        setAuthError('You are deactivated contact admin');
      } else if (error instanceof z.ZodError || error?.name === 'ZodError') {
        const newErrors: any = {};
        error.errors.forEach((err: any) => {
          if (err.path[0]) newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
      } else {
        setAuthError(serverError || error?.message || 'An unexpected error occurred');
      }
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require('../../../assets/Safegrow_logo.png')} style={styles.logoImage} resizeMode="contain" />
        </View>

        <Text style={styles.subtitle}>Field sales · log in to continue</Text>

        {authError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{authError}</Text>
          </View>
        )}

        <View style={styles.formContainer}>
          <Input
            placeholder="User ID (e.g. ramesh.kale)"
            value={userId}
            onChangeText={setUserId}
            error={errors.userId}
            autoCapitalize="none"
          />
          
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={errors.password}
          />
          
          <View style={styles.buttonContainer}>
            <Button 
              title="Log in" 
              onPress={handleLogin} 
              loading={loading}
            />
          </View>
          
          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoImage: {
    width: 150,
    height: 150,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.inkLight,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  formContainer: {
    width: '100%',
  },
  buttonContainer: {
    marginTop: theme.spacing.sm,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  forgotPasswordText: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: theme.colors.primaryDark,
  },
  errorContainer: {
    backgroundColor: '#fce8e8',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f5c6c6',
  },
  errorText: {
    color: '#d93025',
    fontFamily: theme.fonts.medium,
    fontSize: 13,
  },
});
