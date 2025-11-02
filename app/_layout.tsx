import { AuthProvider } from '@/context/AuthContext'; // 👈 ADD THIS IMPORT
import { Slot } from 'expo-router';
import React from 'react';

// This is the Root Layout
export default function RootLayout() {
  return (
    // Wrap the entire app with the AuthProvider
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}