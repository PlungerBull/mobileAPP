import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
// 🚫 REMOVED: import { supabase } from '@/lib/supabase';
import { AuthService } from '@/services/AuthService'; // 👈 NEW SERVICE IMPORT

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    setLoading(true);
    // 👈 Now using AuthService to handle registration logic
    const { error } = await AuthService.signUp(firstName, lastName, email, password);

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert('Success', 'Please check your email to confirm your account.');
      router.replace('/login');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>

          {/* This is the white card */}
          <View style={styles.card}>
            <Text style={styles.title}>Sign up</Text>

            {/* First/Last Name Row */}
            <View style={styles.nameRow}>
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="First Name"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              <TextInput
                style={[styles.input, styles.nameInput]}
                placeholder="Last Name"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>

            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Custom Red Button */}
            <Pressable
              style={styles.button}
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Sign up with Email'}
              </Text>
            </Pressable>

            {/* Terms of Service Text */}
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.linkTextAction}>Terms of Service</Text> and{' '}
              <Text style={styles.linkTextAction}>Privacy Policy</Text>.
            </Text>

            {/* Log in Link Area */}
            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Already have an account? </Text>
              <Link href="/login">
                <Text style={[styles.linkText, styles.linkTextAction]}>
                  Log in
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// 👇 Styles to match your new design
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f4f4f5', // Light gray background
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  nameInput: {
    width: '48%', // Creates the two-column layout
    marginBottom: 0, // Margin is handled by the row
  },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#e63946',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#666',
  },
  linkTextAction: {
    color: '#e63946',
    fontWeight: 'bold',
  },
});