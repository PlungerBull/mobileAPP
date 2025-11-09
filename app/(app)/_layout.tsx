import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/src/context/AuthContext';
import { Text } from 'react-native'; 

export default function AppLayout() {
  const { session, loading } = useAuth(); 
  const router = useRouter(); 

  useEffect(() => {
    if (loading) {
      return; 
    }
    if (!session) {
      router.replace('/login');
    }
  }, [loading, session, router]); 

  if (loading) {
    return <Text>Loading...</Text>; 
  }

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
      {/* 👈 NEW LINE TO EXCLUDE THE MODALS FOLDER FROM THE TABS */}
      <Tabs.Screen
        name="(modals)"
        options={{
          href: null, // This explicitly tells Expo Router NOT to render a tab item
        }}
      />
    </Tabs>
  );
}