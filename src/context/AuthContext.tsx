import React, { useEffect, ReactNode } from 'react';
import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/src/lib/supabase';

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
}

const useAuthStore = create<AuthContextType>((set) => ({
  session: null,
  loading: true,
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),
}));

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const { setSession, setLoading } = useAuthStore.getState();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}

export function useAuth() {
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  
  return { session, loading };
}