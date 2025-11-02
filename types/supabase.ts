// --- DATABASE SCHEMA DEFINITION ---
// This file explicitly defines the structure of your Supabase database 
// to ensure perfect type safety across the entire application.

export interface Database {
    public: {
      Tables: {
        accounts: {
          Row: {
            id: string;
            created_at: string;
            user_id: string;
            name: string;
            type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan' | 'cash' | 'other';
            starting_balance: number;
            currency: string;
          };
          Insert: Omit<Database['public']['Tables']['accounts']['Row'], 'id' | 'created_at' | 'user_id'>;
          Update: Partial<Database['public']['Tables']['accounts']['Row']>;
        };
        categories: {
          Row: {
            id: string;
            created_at: string;
            user_id: string;
            name: string;
            parent_id: string | null;
          };
          Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at' | 'user_id'>;
          Update: Partial<Database['public']['Tables']['categories']['Row']>;
        };
        currencies: {
            Row: {
              id: string;
              created_at: string;
              user_id: string;
              code: string; // The 3-letter ISO code
              is_main: boolean;
            };
            Insert: Omit<Database['public']['Tables']['currencies']['Row'], 'id' | 'created_at' | 'user_id'>;
            Update: Partial<Database['public']['Tables']['currencies']['Row']>;
          };
        transactions: {
          Row: {
            id: string;
            created_at: string;
            user_id: string;
            date: string;
            description: string | null;
            amount_home: number;
            amount_original: number;
            currency_original: string;
            exchange_rate: number | null;
            account_id: string | null;
            category_id: string | null;
          };
          Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'user_id'>;
          Update: Partial<Database['public']['Tables']['transactions']['Row']>;
        };
      };
      Views: {};
      Functions: {};
      Enums: {
        account_type: 'checking' | 'savings' | 'credit_card' | 'investment' | 'loan' | 'cash' | 'other';
      };
      CompositeTypes: {};
    };
  }
  
  // Helper types for client-side use
  export type AccountType = Database['public']['Enums']['account_type'];
  
  export type TransactionRow = Database['public']['Tables']['transactions']['Row'];
  export type NewTransaction = Database['public']['Tables']['transactions']['Insert'];
  
  export type AccountRow = Database['public']['Tables']['accounts']['Row'];
  export type NewAccount = Database['public']['Tables']['accounts']['Insert'];
  
  export type CategoryRow = Database['public']['Tables']['categories']['Row'];
  export type NewCategory = Database['public']['Tables']['categories']['Insert'];

  export type CurrencyRow = Database['public']['Tables']['currencies']['Row'];
  export type NewCurrency = Database['public']['Tables']['currencies']['Insert'];