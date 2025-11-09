// services/ManagementRepository.ts

import { supabase } from '@/src/lib/supabase';
// ✅ Import all canonical Row/Insert types from the database schema
import {
  AccountRow,
  CategoryRow,
  CurrencyRow,
  TransactionRow,
  NewTransaction as NewTransactionInsert
} from '@/src/types/supabase';
// ✅ Import argument types and the ServiceResponse utility type
import {
  ServiceResponse,
  UpdateAccountArgs,
  UpdateCategoryArgs,
  UpdateCurrencyArgs,
  CreateTransferArgs // 👈 NEW: Import for transfer method
} from '@/src/types/ApiArgs';

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
      .from('bankAccounts') 
      .select('*')
      .returns<BankAccount[]>();

    if (error) {
      console.error('ManagementRepository [getAccounts] Error:', error.message);
      return { data: null, error: new Error('Failed to load bank accounts.') };
    }
    return { data: data || [], error: null };
  },

  /** Fetches only top-level groups. */
  async getGroups(): Promise<ServiceResponse<Category[]>> {
    const { data, error } = await dbClient
      .from('categories')
      .select('*')
      .is('parent_id', null) // Filter for top-level groups
      .returns<Category[]>();

    if (error) {
      console.error('ManagementRepository [getGroups] Error:', error.message);
      return { data: null, error: new Error('Failed to load groups.') };
    }
    return { data: data || [], error: null };
  },

  /** Fetches only sub-categories (items with a parent). */
  async getCategories(): Promise<ServiceResponse<Category[]>> {
    const { data, error } = await dbClient
      .from('categories')
      .select('*')
      .not('parent_id', 'is', null) // Filter for sub-categories
      .returns<Category[]>();

    if (error) {
      console.error('ManagementRepository [getCategories] Error:', error.message);
      return { data: null, error: new Error('Failed to load categories.') };
    }
    return { data: data || [], error: null };
  },

  /** Fetches all Categories and Groups. */
  async getCategoriesAndGroups(): Promise<ServiceResponse<Category[]>> {
    const { data, error } = await dbClient
      .from('categories')
      .select('*')
      .order('name', { ascending: true }) // Order them alphabetically
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
        bankAccounts (name, currency),
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
    
    const newAccount = {
        user_id: userId,
        name: name,
        starting_balance: initialBalance, 
        currency: currencyCode, 
    }

    const { data, error } = await dbClient
        .from('bankAccounts')
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

  async createTransfer(transferData: CreateTransferArgs): Promise<ServiceResponse<null>> {
    const { data: { user: dbUser } } = await dbClient.auth.getUser();
    const userId = dbUser?.id;

    if (!userId) {
        return { data: null, error: new Error('User not authenticated.') };
    }
    
    // Args for the Supabase RPC, including the user_id for RLS/security
    const rpcArgs = {
        _user_id: userId,
        _date: transferData.date,
        _description: transferData.description,
        _amount: transferData.amount,
        _from_account_id: transferData.from_account_id,
        _to_account_id: transferData.to_account_id,
        _category_id: transferData.category_id,
        // The RPC function (create_transfer in SQL) will handle currency fetching, dual inserts, and atomicity.
    };
    
    // Call the Supabase function (RPC) - required by the README for transfers
    const { error } = await dbClient.rpc('create_transfer', rpcArgs);

    if (error) {
        console.error('ManagementRepository [createTransfer] Error:', error.message);
        return { data: null, error: new Error('Failed to create transfer. Please check accounts/currencies.') };
    }
    
    return { data: null, error: null };
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

  // --- DELETE Methods ---

  /** Deletes an account by its ID. */
  async deleteAccount(id: string): Promise<ServiceResponse<null>> {
    const { error } = await dbClient.from('bankAccounts').delete().match({ id });
    if (error) {
      console.error('ManagementRepository [deleteAccount] Error:', error.message);
      return { data: null, error: new Error('Failed to delete account.') };
    }
    return { data: null, error: null };
  },

  /** Deletes a category (or group) by its ID. */
  async deleteCategory(id: string): Promise<ServiceResponse<null>> {
    const { error } = await dbClient.from('categories').delete().match({ id });
    if (error) {
      console.error('ManagementRepository [deleteCategory] Error:', error.message);
      return { data: null, error: new Error('Failed to delete category.') };
    }
    return { data: null, error: null };
  },

  /** Deletes a currency by its 3-letter code. */
  async deleteCurrency(code: string): Promise<ServiceResponse<null>> {
    const { error } = await dbClient.from('currencies').delete().match({ code });
    if (error) {
      console.error('ManagementRepository [deleteCurrency] Error:', error.message);
      return { data: null, error: new Error('Failed to delete currency.') };
    }
    return { data: null, error: null };
  },

  // --- UPDATE Methods ---

  /** Sets a specific currency as the main one, and un-sets all others. */
  async setMainCurrency(code: string): Promise<ServiceResponse<null>> {
    // Step 1: Set all currencies to NOT be main
    const { error: resetError } = await dbClient
      .from('currencies')
      .update({ is_main: false })
      .eq('is_main', true); // Only update rows that are currently true

    if (resetError) {
      console.error('ManagementRepository [setMainCurrency Step 1] Error:', resetError.message);
      return { data: null, error: new Error('Failed to reset main currency.') };
    }

    // Step 2: Set the new currency as main
    const { error: setError } = await dbClient
      .from('currencies')
      .update({ is_main: true })
      .match({ code });

    if (setError) {
      console.error('ManagementRepository [setMainCurrency Step 2] Error:', setError.message);
      return { data: null, error: new Error('Failed to set new main currency.') };
    }

    return { data: null, error: null };
  },

  /** Updates an existing bank account. */
  async updateAccount({ id, updates }: UpdateAccountArgs): Promise<ServiceResponse<BankAccount | null>> {
    const { data, error } = await dbClient
        .from('bankAccounts')
        .update(updates)
        .match({ id })
        .select()
        .single();
        
    if (error) {
        console.error('ManagementRepository [updateAccount] Error:', error.message);
        return { data: null, error: new Error('Failed to update account.') };
    }
    return { data, error: null };
  },

  /** Updates an existing category or group. */
  async updateCategory({ id, updates }: UpdateCategoryArgs): Promise<ServiceResponse<Category | null>> {
    const { data, error } = await dbClient
        .from('categories')
        .update(updates)
        .match({ id })
        .select()
        .single();
        
    if (error) {
        console.error('ManagementRepository [updateCategory] Error:', error.message);
        return { data: null, error: new Error('Failed to update category.') };
    }
    return { data, error: null };
  },

  /** Updates an existing currency. */
  async updateCurrency({ code, updates }: UpdateCurrencyArgs): Promise<ServiceResponse<Currency | null>> {
    const { data, error } = await dbClient
        .from('currencies')
        .update(updates)
        .match({ code })
        .select()
        .single();
        
    if (error) {
        console.error('ManagementRepository [updateCurrency] Error:', error.message);
        return { data: null, error: new Error('Failed to update currency.') };
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