import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js'; // 👈 Import specific types

// Define the shape of the core data returned from successful auth operations
type AuthData = {
    session: Session | null;
    user: User | null;
}

// Define a standardized, application-level return type for all service operations
export type ServiceResponse<T = any> = {
  data: T | null;
  error: Error | null;
};

export const AuthService = {

  // --- Auth Management ---

  /**
   * Signs the current user out.
   */
  async signOut(): Promise<ServiceResponse<void>> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('AuthService [signOut] Error:', error.message); 
      return { data: null, error: new Error('Sign out failed. Please try again.') };
    }

    return { data: undefined, error: null };
  },

  // --- User Registration & Login ---
  
  /**
   * Registers a new user with email, password, first name, and last name.
   */
  // 👈 Update return type to ServiceResponse<AuthData>
  async signUp(firstName: string, lastName: string, email: string, password: string): Promise<ServiceResponse<AuthData>> {
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      console.error('AuthService [signUp] Error:', error.message); 
      return { data: null, error: new Error(error.message) };
    }

    // 👈 Return the session and user data from the result
    return { data: { session: authData.session, user: authData.user }, error: null };
  },

  /**
   * Signs in an existing user with email and password.
   */
  // 👈 Update return type to ServiceResponse<AuthData>
  async signInWithPassword(email: string, password: string): Promise<ServiceResponse<AuthData>> {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('AuthService [signInWithPassword] Error:', error.message); 
      return { data: null, error: new Error(error.message) };
    }

    // 👈 Return the session and user data from the result
    return { data: { session: authData.session, user: authData.user }, error: null };
  },
};