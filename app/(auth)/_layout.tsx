import { Stack, useRouter } from 'expo-router'; // 👈 Import useRouter
import React, { useEffect } from 'react'; // 👈 Import useEffect
import { useAuth } from '@/src/context/AuthContext'; // 👈 Import our hook
import { Text, View } from 'react-native'; // 👈 Import for loading indicator

export default function AuthLayout() {
  const { session, loading } = useAuth(); // 👈 Get auth state
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Wait for loading to finish
    }

    if (session) {
      // If the user IS logged in, redirect them to the main app
      // This is the missing piece of logic.
      router.replace('/report');
    }
  }, [loading, session, router]); // 👈 Add dependencies

  // Show a loading screen while checking for session
  if (loading) {
    // You can make this a nicer loading spinner
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // Only show the auth screens (login, signup) if there is NO session
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}