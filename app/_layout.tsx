import { Slot } from 'expo-router';
import React from 'react';

// This is the Root Layout
// Its only job is to render the child route
export default function RootLayout() {
  return <Slot />;
}