import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'react-native';
import { GlobalErrorBoundary } from './src/components/GlobalErrorBoundary';
import { ToastProvider } from './src/components/ui/ToastProvider';

const App = () => {
  return (
    <GlobalErrorBoundary>
      <Provider store={store}>
        <SafeAreaProvider>
          <ToastProvider>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <RootNavigator />
          </ToastProvider>
        </SafeAreaProvider>
      </Provider>
    </GlobalErrorBoundary>
  );
};

export default App;
