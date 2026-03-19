// Refreshing app entry
import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { getFirestore } from 'firebase/firestore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import * as Font from 'expo-font';
import { SpaceGrotesk_700Bold, SpaceGrotesk_500Medium } from '@expo-google-fonts/space-grotesk';
import { StatusBar } from 'expo-status-bar';
import { initializeApp } from 'firebase/app';
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Internal Imports
import { Theme } from './theme.js';
import TabNavigator from './src/navigation/TabNavigator';
import { connectorConfig } from './src/dataconnect-generated';
import { PantryProvider } from './src/context/PantryContext';
import { getDataConnectHost, getApiBaseUrl } from './src/utils/api';

// Your Firebase Config
const firebaseConfig = {
  projectId: "kitch-recipe-app",
  appId: "1:962255216708:web:dc3b14da8910f80e24dc11",
  storageBucket: "kitch-recipe-app.firebasestorage.app",
  apiKey: "AIzaSyDKDpPqPaxaATH6AmnD680gKfQio08TfLs",
  authDomain: "kitch-recipe-app.firebaseapp.com",
  messagingSenderId: "962255216708",
  measurementId: "G-Z3NVPXVK75"
};

// Initialize Services
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const dataConnect = getDataConnect(firebaseApp, connectorConfig);

// Connect to Emulator in development
if (__DEV__) {
  const host = getDataConnectHost();
  console.log(`[DataConnect] Connecting to emulator at ${host}:50001`);
  connectDataConnectEmulator(dataConnect, host, 50001);
}

const queryClient = new QueryClient();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          SpaceGrotesk_700Bold,
          SpaceGrotesk_500Medium,
        });

        if (__DEV__) {
          const apiBase = getApiBaseUrl();
          const dcHost = getDataConnectHost();
          console.log(`[Debug] Backend Config - API: ${apiBase}, DC Host: ${dcHost}`);
        }
      } catch (e) {
        console.warn("Font loading error:", e);
      } finally {
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  // Loading State
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#D4E95A" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <NavigationIndependentTree>
          <NavigationContainer>
            <PantryProvider firestore={db}>
              <TabNavigator />
            </PantryProvider>
          </NavigationContainer>
        </NavigationIndependentTree>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F6FBDE', // Matches your Soft Cream theme
    justifyContent: 'center',
    alignItems: 'center',
  }
});