import React, { useEffect } from 'react'; // 👈 ADD useEffect
import { Tabs, useRouter } from 'expo-router'; // 👈 ADD useRouter
import { Ionicons } from '@expo/vector-icons';
  import { useAuth } from '@/context/AuthContext'; // 👈 ADD THIS IMPORT
import { Text } from 'react-native'; // 👈 ADD THIS IMPORT

export default function AppLayout() {
  const { session, loading } = useAuth(); // 👈 GET AUTH STATE
  const router = useRouter(); // 👈 GET ROUTER

  useEffect(() => {
    if (loading) {
      return; // Wait until loading is done
    }
    if (!session) {
      // If no session, redirect to the login screen
      router.replace('/login');
    }
  }, [loading, session, router]); // 👈 ADD DEPENDENCIES

  // Show a loading screen while checking for session
  if (loading) {
    return <Text>Loading...</Text>; // Or a custom loading component
  }

  // Only render the app layout if there is a session
  return (
    <Tabs screenOptions={{ headerShown: true }}>
      <Tabs.Screen
        name="report"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="management"
        options={{
          title: 'Management',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}