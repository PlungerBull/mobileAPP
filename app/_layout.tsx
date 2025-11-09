import { AuthProvider } from '@/src/context/AuthContext';
import { Slot } from 'expo-router';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as eva from '@eva-design/eva'; // 👈 IMPORT Eva
import { ApplicationProvider, IconRegistry } from '@ui-kitten/components'; // 👈 IMPORT UI Kitten
import { EvaIconsPack } from '@ui-kitten/eva-icons'; // 👈 IMPORT Icons

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <>
      {/* 1. Register the icon pack */}
      <IconRegistry icons={EvaIconsPack} />
      
      {/* 2. Wrap the app in ApplicationProvider */}
      <ApplicationProvider {...eva} theme={eva.light}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Slot />
          </AuthProvider>
        </QueryClientProvider>
      </ApplicationProvider>
    </>
  );
}