// types/ApiArgs.ts (Recommended Clean Content)
import { 
  AccountRow, 
  CategoryRow, 
  CurrencyRow 
} from '@/types/supabase'; // Import the row types

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

// Universal standardized response type for all services/repositories
export type ServiceResponse<T = any> = {
  data: T | null;
  error: Error | null;
};

// --- ✅ NEW: Arguments for Delete/Update mutations ---
export interface DeleteByIdArgs {
  id: string;
}

export interface DeleteByCodeArgs {
  code: string;
}

export interface SetMainCurrencyArgs {
  code: string;
}

// --- ✅ NEW: Arguments for Edit/Update mutations ---
// We pass the identifier (id/code) and the partial data to update
export interface UpdateAccountArgs {
  id: string;
  updates: Partial<Omit<AccountRow, 'id' | 'user_id' | 'created_at'>>;
}

export interface UpdateCategoryArgs {
  id: string;
  updates: Partial<Omit<CategoryRow, 'id' | 'user_id' | 'created_at'>>;
}

export interface UpdateCurrencyArgs {
  code: string; // This is the key to find the row
  // ✅ FIX: Removed 'code' from Omit<> so we can update it
  updates: Partial<Omit<CurrencyRow, 'id' | 'user_id' | 'created_at'>>; 
}