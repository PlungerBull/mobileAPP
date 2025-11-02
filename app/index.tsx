import React from 'react';
import { Redirect } from 'expo-router';

export default function Index() {
  // The (app) layout will automatically check auth and redirect
  // to /login if needed.
  return <Redirect href="/report" />;
}