// --- Management Entities ---
export interface CreateCategoryArgs {
    name: string;
    parentId?: string | null;
  }
  
  export interface CreateAccountArgs {
    name: string;
    initialBalance: number;
    currencyCode: string;
    // 👇 FIX 2: Add mandatory type field
    accountType: string;
  }

  export interface BankAccount {
    id: string;
    user_id: string;
    name: string;
    starting_balance: number; 
    currency: string; 
    // 🚫 REMOVED: institution: string; // This field is not in your DB schema.
  }
  
  export interface Grouping {
    id: string;
    user_id: string;
    name: string;
  }
  
  export interface Transaction {
    id: string;
    user_id: string;
    date: string; // timestamp with time zone in DB, use string for front-end
    description?: string;
    amount_home: number;
    amount_original: number;
    currency_original: string;
    exchange_rate?: number;
    account_id?: string;
    category_id?: string;
  }

  export interface Category {
    id: string;
    user_id: string;
    name: string;
    parent_id?: string; // This column now identifies the Grouping/Parent
    // Add other Category/Grouping specific fields here if needed
  }
  
  export interface Currency {
    code: string; // e.g., 'USD', 'PEN', 'EUR'
    name: string; 
    is_main: boolean; // For display purposes, like the 'Main' tag in your image
  }
  
  // Universal standardized response type for all services/repositories
  export type ServiceResponse<T = any> = {
    data: T | null;
    error: Error | null;
  };
  
  // Also defining Transaction type here, though not strictly used by the ManagementRepo now
  export interface BankAccount {
    id: string;
    user_id: string;
    name: string;
    starting_balance: number; 
    currency: string; // Formerly currency_code
    institution: string;
  }