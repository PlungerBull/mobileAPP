import { AuthProvider } from '@/context/AuthContext';
import { Slot } from 'expo-router';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // 👈 NEW IMPORTS

// 1. Initialize the Query Client once at the root
const queryClient = new QueryClient();

// This is the Root Layout
export default function RootLayout() {
  return (
    // 2. Wrap the entire app with the QueryClientProvider
    <QueryClientProvider client={queryClient}>
      {/* 3. The AuthProvider goes inside, wrapping the Slot */}
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </QueryClientProvider>
  );
}