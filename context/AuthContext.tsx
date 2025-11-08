import React, { useEffect, ReactNode } from 'react';
import { create } from 'zustand'; // 👈 NEW: Import create from zustand
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Define the shape of the store's state and actions
interface AuthContextType {
  session: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void; // 👈 NEW: Action to update session
  setLoading: (loading: boolean) => void;       // 👈 NEW: Action to update loading
}

// Create the Zustand store
const useAuthStore = create<AuthContextType>((set) => ({
  session: null,
  loading: true,
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
}));

// Create the provider component - it now just initializes the listeners
export function AuthProvider({ children }: { children: ReactNode }) {
  const { setSession, setLoading } = useAuthStore.getState();

  useEffect(() => {
    // 1. Get current session and set initial state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for auth changes and update the store
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [setSession, setLoading]); // Depend on setters (safe with Zustand)

  // The provider itself no longer needs to pass a value, as the components
  // will connect directly to the store via the useAuth hook.
  return <>{children}</>;
}
// Create a custom hook to use the AuthStore (keeping the existing hook name)
export function useAuth() {
  // Select the state you need. This is the key performance feature of Zustand.
  return useAuthStore(state => ({
    session: state.session,
    loading: state.loading,
  }));
}