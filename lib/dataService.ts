import { supabase } from '@/lib/supabase';
import { Alert } from 'react-native';
// 👈 IMPORT TYPES from the new location (you may need to adjust the path)

import { 
    TransactionRow, NewTransaction, 
    AccountRow, NewAccount, AccountType, 
    CategoryRow, NewCategory,
    CurrencyRow, NewCurrency // 👈 ADD THESE IMPORTS
  } from '../types/supabase';

// --- 1. CORE TYPESCRIPT DEFINITIONS ---

// Use the imported Row/Insert types directly
export type Transaction = TransactionRow;
export type NewTransactionInsert = NewTransaction;

export type Account = AccountRow;
export type NewAccountInsert = NewAccount;
export type AccountTypeEnum = AccountType;

export type Category = CategoryRow;
export type NewCategoryInsert = NewCategory;

export type Currency = CurrencyRow; // 👈 NEW EXPORT
export type NewCurrencyInsert = NewCurrency; // 👈 NEW EXPORT

/**
 * 2. DATA SERVICE CLASS (Repository Pattern)
 * This class abstracts all Supabase interaction, so your React components 
 * don't directly handle SQL or API errors.
 */
class DataService {

  // --- ACCOUNTS MANAGEMENT (for the Management Hub) ---

  /**
   * Fetches all accounts belonging to the current user.
   */
  async fetchAccounts(): Promise<Account[] | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accounts:', error);
      Alert.alert('Data Error', 'Could not load your accounts.');
      return null;
    }
    return data as Account[];
  }

  /**
   * Inserts a new account for the current user.
   */
  async insertAccount(accountData: NewAccountInsert): Promise<Account | null> {
    const { data, error } = await supabase
      .from('accounts')
      .insert(accountData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting account:', error);
      Alert.alert('Data Error', 'Failed to save new account.');
      return null;
    }
    return data as Account;
  }


  // --- CATEGORIES MANAGEMENT (for the Management Hub) ---

  /**
   * Fetches all categories belonging to the current user.
   * This includes both top-level groupings and sub-categories.
   */
  async fetchCategories(): Promise<Category[] | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Data Error', 'Could not load categories.');
      return null;
    }
    return data as Category[];
  }
  
  /**
   * Inserts a new category/grouping for the current user.
   */
  async insertCategory(categoryData: NewCategoryInsert): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting category:', error);
      Alert.alert('Data Error', 'Failed to save new category.');
      return null;
    }
    return data as Category;
  }

    // --- CURRENCIES MANAGEMENT (NEW SECTION) ---
  
  /**
   * Fetches all currencies being tracked by the user.
   */
  async fetchCurrencies(): Promise<Currency[] | null> {
    const { data, error } = await supabase
      .from('currencies')
      .select('*')
      .order('is_main', { ascending: false }) // Main currency first
      .order('code', { ascending: true });

    if (error) {
      console.error('Error fetching currencies:', error);
      Alert.alert('Data Error', 'Could not load currency list.');
      return null;
    }
    return data as Currency[];
  }
  
  /**
   * Inserts a new currency code for the current user.
   */
  async insertCurrency(currencyData: NewCurrency): Promise<Currency | null> {
    const { data, error } = await supabase
      .from('currencies')
      .insert(currencyData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting currency:', error);
      Alert.alert('Data Error', 'Failed to save new currency.');
      return null;
    }
    return data as Currency;
  }
  
  // --- TRANSACTIONS MANAGEMENT (for the Transactions Screen) ---

  /**
   * Fetches the latest N transactions, optionally joining with account/category data.
   */
  async fetchTransactions(limit = 100): Promise<Transaction[] | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        accounts (name, currency),
        categories (name, parent_id)
      `)
      .limit(limit)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      Alert.alert('Data Error', 'Could not load transactions.');
      return null;
    }
    // We will cast the result, trusting the select statement structure.
    return data as Transaction[]; 
  }
  
  /**
   * Inserts a new transaction for the current user.
   */
  async insertTransaction(transactionData: NewTransactionInsert): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting transaction:', error);
      Alert.alert('Data Error', 'Failed to save new transaction.');
      return null;
    }
    return data as Transaction;
  }
}

// Export a singleton instance for easy, consistent use throughout the app
export const dataService = new DataService();