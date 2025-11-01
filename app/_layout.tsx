import React, { useState, useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
// Import the new auth service
import { firebaseAuth } from '../config/firebaseConfig';
import { View, Text } from 'react-native';

// This is the new type for the user object
type FirebaseUser = import('@react-native-firebase/auth').FirebaseAuthTypes.User;

export default function RootLayout() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // The new listener syntax is slightly different
    const subscriber = firebaseAuth().onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (loading) {
        setLoading(false);
      }
    });

    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    if (loading) return; // Wait until Firebase check is complete

    if (user) {
      // User is logged in, send them to the (app) group
      router.replace('/report');
    } else {
      // User is not logged in, send them to the (auth) group
      router.replace('/login');
    }
  }, [user, loading]); // Re-run when user or loading state changes

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}