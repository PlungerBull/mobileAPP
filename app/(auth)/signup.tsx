import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase'; // Import our client

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      // On success, Supabase sends a confirmation email.
      Alert.alert('Success', 'Please check your email to confirm your account.');
      router.replace('/login');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={loading ? 'Creating...' : 'Create Account'} onPress={handleSignUp} disabled={loading} />
      
      <Link href="/(auth)/login" style={styles.link}>
        <Text style={styles.linkText}>Already have an account? Log In</Text>
      </Link>
    </View>
  );
}

// Reusing the same styles from login.tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
    borderRadius: 5,
  },
  link: {
    marginTop: 15,
    textAlign: 'center',
  },
  linkText: {
    color: 'blue',
  },
});