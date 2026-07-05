import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../../config/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, ...props }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={theme.colors.inkLighter}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontFamily: theme.fonts.medium,
    fontSize: 13,
    color: theme.colors.inkLight,
    marginBottom: theme.spacing.xs,
  },
  input: {
    height: 48,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    fontFamily: theme.fonts.regular,
    fontSize: 15,
    color: theme.colors.ink,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: theme.colors.danger,
    marginTop: theme.spacing.xs,
  },
});
