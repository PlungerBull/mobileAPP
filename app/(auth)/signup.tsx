// app/(auth)/signup.tsx

import React from 'react'; // 👈 REMOVED: useState
import {
  View,
  Text,
  // 👈 REMOVED: TextInput (now handled by CustomInput)
  StyleSheet,
  Alert,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { AuthService } from '@/services/AuthService'; // 👈 Already correct

// 👇 NEW IMPORTS for RHF
import { useForm, Controller } from 'react-hook-form'; 
import { zodResolver } from '@hookform/resolvers/zod'; 
import { SignUpSchema, SignUpFormValues } from '@/types/FormSchemas'; 
import { CustomInput } from '@/components/ModalCommon'; // 👈 Use CustomInput

export default function SignUpScreen() {
  // 👈 REMOVED: All useState hooks (firstName, lastName, email, password, loading)
  const router = useRouter();

  // 👇 NEW: RHF setup with Zod resolver
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    }
  });

  // 👇 NEW: RHF submit handler
  const handleSignUp = async (data: SignUpFormValues) => {
    // isSubmitting handles the loading state
    const { error } = await AuthService.signUp(
      data.firstName, 
      data.lastName, 
      data.email, 
      data.password
    );

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert('Success', 'Please check your email to confirm your account.');
      router.replace('/login');
    }
    // 👈 REMOVED: setLoading(false)
  };

  return (
    <SafeAreaView style={styles.safeContainer} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.welcomeTitle}>Create Account</Text>

          {/* This is the white card */}
          <View style={styles.card}>
            <Text style={styles.title}>Sign up</Text>

            {/* First/Last Name Row */}
            <View style={styles.nameRow}>
              {/* 👈 RHF Controller for First Name */}
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    label="First Name"
                    placeholder="First Name"
                    // ... (other props) ...
                    errorText={errors.firstName?.message}
                    containerStyle={styles.nameInput} // 👈 RENAMED from 'style'
                  />
                )}
              />
              {/* 👈 RHF Controller for Last Name */}
              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    label="Last Name"
                    placeholder="Last Name"
                    placeholderTextColor="#999"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                    errorText={errors.lastName?.message}
                    containerStyle={styles.nameInput} // 👈 RENAMED from 'style'
                  />
                )}
              />
            </View>

            {/* 👈 NEW: RHF Controller for Email */}
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
            
            {/* 👈 NEW: RHF Controller for Password */}
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
            
            {/* Custom Red Button */}
            <Pressable
              style={styles.button}
              onPress={handleSubmit(handleSignUp)} // 👈 Use RHF's handleSubmit
              disabled={isSubmitting} // 👈 Use RHF's loading state
            >
              <Text style={styles.buttonText}>
                {isSubmitting ? 'Creating Account...' : 'Sign up with Email'}
              </Text>
            </Pressable>

            {/* Terms of Service Text (unchanged) */}
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.linkTextAction}>Terms of Service</Text> and{' '}
              <Text style={styles.linkTextAction}>Privacy Policy</Text>.
            </Text>

            {/* Log in Link Area (unchanged) */}
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

// Styles are updated to remove the 'input' style which is
// now handled by CustomInput. 'nameInput' is kept for layout.
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 16, // 👈 Handled by CustomInput's internal style
  },
  nameInput: {
    width: '48%', // Creates the two-column layout
    marginBottom: 16, // 👈 Keep marginBottom here for the row
  },
  // 👈 REMOVED: 'input' style is no longer needed
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