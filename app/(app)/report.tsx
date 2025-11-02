import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '@/services/AuthService'; // 👈 NEW SERVICE IMPORT

export default function ReportScreen() {
  const router = useRouter();

  const handleSignOut = async () => {
    // 👈 Now using the decoupled service method
    const { error } = await AuthService.signOut();
    
    if (error) {
      // The service has already handled logging; here we handle UI feedback.
      // In a scalable app, this would trigger a Toast/Snackbar notification.
      console.error('Error signing out:', error.message); 
      // We rely on AuthContext to detect the session change and redirect.
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Screen</Text>
      <Text>This is where the financial summary dashboard will go.</Text>
      <View style={{ margin: 20 }} />
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});