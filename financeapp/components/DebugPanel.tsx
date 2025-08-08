import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';

const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  if (!__DEV__) {
    return null; // Só mostra em desenvolvimento
  }

  const envVars = {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV,
    EXPO_PUBLIC_ENV: process.env.EXPO_PUBLIC_ENV,
  };

  const getImageBaseUrl = () => {
    const apiUrl = process.env.EXPO_PUBLIC_API_URL;
    if (apiUrl) {
      return apiUrl;
    }
    
    if (__DEV__) {
      return 'http://localhost:3000';
    }
    
    return 'https://api.seudominio.com';
  };

  return (
    <View style={styles.container}>
      <Pressable 
        style={styles.toggle}
        onPress={() => setIsVisible(!isVisible)}
      >
        <Text style={styles.toggleText}>🐛 Debug</Text>
      </Pressable>

      {isVisible && (
        <ScrollView style={styles.panel}>
          <Text style={styles.title}>Environment Variables</Text>
          {Object.entries(envVars).map(([key, value]) => (
            <View key={key} style={styles.row}>
              <Text style={styles.key}>{key}:</Text>
              <Text style={styles.value}>{value || 'undefined'}</Text>
            </View>
          ))}
          
          <Text style={styles.title}>Image Base URL</Text>
          <Text style={styles.value}>{getImageBaseUrl()}</Text>
          
          <Text style={styles.title}>Development Mode</Text>
          <Text style={styles.value}>{__DEV__ ? 'true' : 'false'}</Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 9999,
  },
  toggle: {
    backgroundColor: '#ff6b6b',
    padding: 8,
    borderRadius: 20,
  },
  toggleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  panel: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    padding: 15,
    borderRadius: 10,
    maxHeight: 300,
    minWidth: 250,
    marginTop: 5,
  },
  title: {
    color: '#4ecdc4',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  row: {
    marginBottom: 5,
  },
  key: {
    color: '#ffd93d',
    fontSize: 12,
    fontWeight: 'bold',
  },
  value: {
    color: 'white',
    fontSize: 12,
    marginLeft: 10,
  },
});

export default DebugPanel;
