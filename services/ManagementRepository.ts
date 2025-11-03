// services/ManagementRepository.ts

import { supabase } from '@/lib/supabase';
// ✅ Import all canonical Row/Insert types from the database schema
import { 
  AccountRow, 
  CategoryRow, 
  CurrencyRow, 
  TransactionRow,
  NewTransaction as NewTransactionInsert 
} from '@/types/supabase';
// ✅ Import argument types and the ServiceResponse utility type
import { ServiceResponse } from '@/types/ApiArgs';

// Define local aliases for clarity (using canonical types)
type BankAccount = AccountRow;
type Category = CategoryRow;
type Currency = CurrencyRow;
type Transaction = TransactionRow;

const dbClient = supabase; 

export const ManagementRepository = {
  
  // --- READ Methods (Consolidated) ---

  /** Fetches all bank accounts (Table: accounts). */
  async getAccounts(): Promise<ServiceResponse<BankAccount[]>> {
    const { data, error } = await dbClient
      .from('accounts') 
      .select('*')
      .returns<BankAccount[]>();

    if (error) {
      console.error('ManagementRepository [getAccounts] Error:', error.message);
      return { data: null, error: new Error('Failed to load bank accounts.') };
    }
    return { data: data || [], error: null };
  },

  /** Fetches all Categories and Groups from the unified 'categories' table. */
  async getCategoriesAndGroups(): Promise<ServiceResponse<Category[]>> {
    const { data, error } = await dbClient
      .from('categories')
      .select('*')
      .returns<Category[]>();

    if (error) {
      console.error('ManagementRepository [getCategoriesAndGroups] Error:', error.message);
      return { data: null, error: new Error('Failed to load categories.') };
    }
    return { data: data || [], error: null };
  },
  
  /** Fetches all currencies (Table: currencies). */
  async getCurrencies(): Promise<ServiceResponse<Currency[]>> {
    const { data, error } = await dbClient 
      .from('currencies')
      .select('*')
      .returns<Currency[]>();

    if (error) {
        console.error('ManagementRepository [getCurrencies] Error:', error.message);
        return { data: null, error: new Error('Failed to load currencies.') };
    }
    return { data: data || [], error: null };
  },
  
  /** Fetches the latest N transactions, enriching with joined data. */
  async getTransactions(limit = 100): Promise<ServiceResponse<Transaction[]>> {
    const { data, error } = await dbClient
      .from('transactions')
      .select(`
        *,
        accounts (name, currency),
        categories (name, parent_id)
      `)
      .limit(limit)
      .order('date', { ascending: false })
      .returns<Transaction[]>();

    if (error) {
      console.error('ManagementRepository [getTransactions] Error:', error.message);
      return { data: null, error: new Error('Failed to load transactions.') };
    }
    return { data: data || [], error: null };
  },

  // --- CREATE Methods (Consolidated) ---
  
  /** Creates a new bank account. */
  async createAccount(name: string, initialBalance: number, currencyCode: string): Promise<ServiceResponse<BankAccount | null>> {
    const { data: { user: dbUser } } = await dbClient.auth.getUser();
    const userId = dbUser?.id;

    if (!userId) {
      return { data: null, error: new Error('User not authenticated.') };
    }
    
    // Note: The 'type' field is correctly omitted here based on your database screenshots.
    const newAccount = {
        user_id: userId,
        name: name,
        starting_balance: initialBalance, 
        currency: currencyCode, 
    }

    const { data, error } = await dbClient
        .from('accounts')
        .insert(newAccount)
        .select()
        .single();
        
    if (error) {
        console.error('ManagementRepository [createAccount] Error:', error.message);
        return { data: null, error: new Error('Failed to create account. DB Error: ' + error.message) };
    }
    
    return { data, error: null };
  },
  
  /** Inserts a new transaction for the current user. */
  async createTransaction(transactionData: NewTransactionInsert): Promise<ServiceResponse<Transaction | null>> {
    const { data: { user: dbUser } } = await dbClient.auth.getUser();
    const userId = dbUser?.id;

    if (!userId) {
        return { data: null, error: new Error('User not authenticated.') };
    }

    const newTransaction = {
        user_id: userId,
        ...transactionData, 
    };

    const { data, error } = await dbClient
        .from('transactions')
        .insert(newTransaction)
        .select()
        .single();

    if (error) {
        console.error('ManagementRepository [createTransaction] Error:', error.message);
        return { data: null, error: new Error('Failed to save new transaction.') };
    }
    return { data, error: null };
  },

  /** Creates a new top-level Grouping (maps to a Category with parent_id: null). */
  async createGrouping(name: string): Promise<ServiceResponse<Category | null>> {
    const { data: { user: dbUser } } = await dbClient.auth.getUser();
    const userId = dbUser?.id;
    
    if (!userId) {
        return { data: null, error: new Error('User not authenticated.') };
    }
    
    const newGrouping = {
        user_id: userId,
        name: name,
        parent_id: null, // Always null for a grouping
    }
    
    const { data, error } = await dbClient
        .from('categories') 
        .insert(newGrouping)
        .select()
        .single();

    if (error) {
        console.error('ManagementRepository [createGrouping] Error:', error.message);
        return { data: null, error: new Error('Failed to create grouping.') };
    }

    return { data, error: null };
  },

  /** Creates a new sub-category or group. */
  async createCategory(name: string, parentId?: string | null): Promise<ServiceResponse<Category | null>> {
    const { data: { user: dbUser } } = await dbClient.auth.getUser();
    const userId = dbUser?.id;
    
    if (!userId) {
        return { data: null, error: new Error('User not authenticated.') };
    }
    
    const newCategory = {
        user_id: userId,
        name: name,
        parent_id: parentId, // Can be null (for a Group) or a UUID (for a Sub-Category)
    }
    
    const { data, error } = await dbClient
        .from('categories') 
        .insert(newCategory)
        .select()
        .single();

    if (error) {
        console.error('ManagementRepository [createCategory] Error:', error.message);
        return { data: null, error: new Error('Failed to create category.') };
    }

    return { data, error: null };
  },

  /** Creates a new currency for the user. */
  async createCurrency(code: string): Promise<ServiceResponse<Currency | null>> {
    const { data: { user: dbUser } } = await dbClient.auth.getUser();
    const userId = dbUser?.id;
    
    if (!userId) {
        return { data: null, error: new Error('User not authenticated.') };
    }
    
    const newCurrency = {
        user_id: userId,
        code: code,
        is_main: false, // Default new currency to not main
    }
    
    const { data, error } = await dbClient
        .from('currencies') 
        .insert(newCurrency)
        .select()
        .single();

    if (error) {
        console.error('ManagementRepository [createCurrency] Error:', error.message);
        return { data: null, error: new Error('Failed to create currency.') };
    }

    return { data, error: null };
  },

  // --- Report/Summary Methods (Placeholder) ---
  
  async getTransactionSummary(period: 'month' | 'week'): Promise<ServiceResponse<{ total: number }>> {
    try {
        // Placeholder logic using the Transaction type
        const dummyTransactions: Transaction[] = []; 
        
        const total = dummyTransactions.reduce((sum, t) => sum + t.amount_home, 0); 
        return { data: { total }, error: null };

    } catch (e) {
        console.error('ManagementRepository [getTransactionSummary] Error:', e);
        return { data: null, error: new Error('Failed to compute summary.') };
    }
  }
};