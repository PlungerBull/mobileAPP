// types/ApiArgs.ts
import {
  AccountRow,
  CategoryRow,
  CurrencyRow
} from '@/src/types/supabase'; 

// --- API Argument Interfaces (Inputs ONLY) ---
export interface CreateCategoryArgs {
  name: string;
  parentId?: string | null;
}

export interface CreateAccountArgs {
  name: string;
  initialBalance: number;
  currencyCode: string;
}

export interface CreateCurrencyArgs { // ✅ ADDED: The missing type
  code: string;
}

// ✅ NEW: Args for the atomic transfer RPC (as required by README)
export interface CreateTransferArgs {
  date: string;
  description: string;
  amount: number; // The positive amount being transferred
  from_account_id: string; // Account to debit (will become negative transaction)
  to_account_id: string;   // Account to credit (will become positive transaction)
  category_id: string;     // Assumes a transfer category exists
}

// Universal standardized response type for all services/repositories
export type ServiceResponse<T = any> = {
  data: T | null;
  error: Error | null;
};

// --- Arguments for Delete/Update mutations ---
export interface DeleteByIdArgs {
  id: string;
}

export interface DeleteByCodeArgs {
  code: string;
}

export interface SetMainCurrencyArgs {
  code: string;
}

// --- Arguments for Edit/Update mutations ---
export interface UpdateAccountArgs {
  id: string;
  updates: Partial<Omit<AccountRow, 'id' | 'user_id' | 'created_at'>>;
}

export interface UpdateCategoryArgs {
  id: string;
  updates: Partial<Omit<CategoryRow, 'id' | 'user_id' | 'created_at'>>;
}

export interface UpdateCurrencyArgs {
  code: string; 
  updates: Partial<Omit<CurrencyRow, 'id' | 'user_id' | 'created_at'>>; 
}