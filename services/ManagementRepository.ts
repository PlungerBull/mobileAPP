import { supabase } from '@/lib/supabase';
import { 
  ServiceResponse, 
  BankAccount, 
  Category,
  Currency,
  Transaction // 👈 NOW CORRECTLY IMPORTED
} from '@/types/ManagementTypes';

const dbClient = supabase; 

export const ManagementRepository = {
  
  // --- READ Methods ---

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
    return { data, error: null };
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
    return { data, error: null };
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
    return { data, error: null };
  },
  
  // --- CREATE Methods ---
  
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
        // Placeholder logic using the now correctly defined Transaction type
        const dummyTransactions: Transaction[] = []; 
        
        const total = dummyTransactions.reduce((sum, t) => sum + t.amount_home, 0); // Using amount_home as per schema
        return { data: { total }, error: null };

    } catch (e) {
        return { data: null, error: new Error('Failed to compute summary.') };
    }
  }
};

    