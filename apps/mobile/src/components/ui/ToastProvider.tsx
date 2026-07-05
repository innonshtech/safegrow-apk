import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, SafeAreaView } from 'react-native';
import { theme } from '../../config/theme';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

interface ToastContextData {
  showToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextData | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Global ref for non-React files (like axios interceptors)
export const globalToast = {
  show: (options: ToastOptions) => {},
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  const showToast = useCallback(({ message, type = 'info', duration = 3000 }: ToastOptions) => {
    setToast({ message, type });

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setToast(null));
    }, duration);
  }, [opacity, translateY]);

  const getBackgroundColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return theme.colors.primary;
      case 'error':
        return '#E53E3E'; // Red
      case 'info':
      default:
        return theme.colors.ink;
    }
  };

  // Bind the global ref
  globalToast.show = showToast;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <SafeAreaView style={styles.container} pointerEvents="none">
          <Animated.View
            style={[
              styles.toastBox,
              {
                backgroundColor: getBackgroundColor(toast.type || 'info'),
                opacity,
                transform: [{ translateY }],
              },
            ]}
          >
            <Text style={styles.message}>{toast.message}</Text>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingTop: 16,
  },
  toastBox: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    maxWidth: '90%',
  },
  message: {
    color: '#FFFFFF',
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    textAlign: 'center',
  },
});
