import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod'; 

import { AuthService } from '@/services/AuthService'; 
import { CustomInput } from '@/components/ModalCommon';
import { LoginSchema, LoginFormValues } from '@/types/FormSchemas';

export default function LoginScreen() {
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
        email: '',
        password: '',
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    const { error } = await AuthService.signInWithPassword(data.email, data.password);

    if (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>

          <View style={styles.card}>
            <Text style={styles.title}>Log in</Text>

            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInput
                        label="Email address"
                        placeholder="Email address"
                        placeholderTextColor="#999"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        errorText={errors.email?.message} 
                    />
                )}
            />

            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInput
                        label="Password"
                        placeholder="Password"
                        placeholderTextColor="#999"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                        secureTextEntry
                        errorText={errors.password?.message}
                    />
                )}
            />

            <Pressable
              style={styles.button}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Logging in...' : 'Log in with Email'}
              </Text>
            </Pressable>

            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Don't have an account? </Text>
              <Link href="/signup">
                <Text style={[styles.linkText, styles.linkTextAction]}>
                  Sign up
                </Text>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles remain unchanged
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f4f4f5', 
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
  input: {
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#e63946', 
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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