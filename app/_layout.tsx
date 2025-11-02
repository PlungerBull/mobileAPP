import React, { useState, useEffect } from 'react';
import { Slot, useRouter } from 'expo-router'; // 👈 Import Slot
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { View, Text } from 'react-native';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
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

  useEffect(() => {
    if (loading) return; 

    if (session) {
      // User is logged in, send them to the (app) group
      router.replace('/report'); // 👈 Already fixed, this is correct
    } else {
      // User is not logged in, send them to the (auth) group
      router.replace('/login'); // 👈 Already fixed, this is correct
    }
  }, [session, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // This <Slot /> will render either the (app) layout or the (auth) layout
  return <Slot />;
}