import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ManagementRepository } from '@/services/ManagementRepository'; 

// ✅ Import core DB types from the canonical source
import { 
    AccountRow, CategoryRow, CurrencyRow, TransactionRow, NewTransaction
} from '@/types/supabase';
// ✅ Import argument types and ServiceResponse utility from the argument/utility file
import { 
    ServiceResponse, 
    CreateAccountArgs, 
    CreateCategoryArgs 
} from '@/types/ApiArgs';

// Define local aliases for clarity
type BankAccount = AccountRow;
type Category = CategoryRow;
type Currency = CurrencyRow;
type Transaction = TransactionRow;
type NewTransactionInsert = NewTransaction;

// --------------------------------------------------
// --- 1. Mutation Argument Interfaces (Input Types)---
// NOTE: These are now typically only argument interfaces or simple local types
// --------------------------------------------------

interface CreateCurrencyArgs {
  code: string;
}

// --------------------------------------------------
// --- 2. Query Keys (Used for caching/refetching) ---
// --------------------------------------------------

const QUERY_KEYS = {
  ACCOUNTS: 'accounts',
  CATEGORIES_AND_GROUPS: 'categoriesAndGroups', 
  CURRENCIES: 'currencies',
  TRANSACTIONS: 'transactions', // 👈 NEW KEY
  TRANSACTION_SUMMARY: 'transactionSummary', // 👈 NEW KEY for reporting
};

// --------------------------------------------------
// --- 3. READ Hooks (useQuery) ---
// --------------------------------------------------

export function useAccounts() {
  // TData is BankAccount[], TError is Error
  return useQuery<BankAccount[], Error>({ 
    queryKey: [QUERY_KEYS.ACCOUNTS],
    queryFn: async () => {
      // ManagementRepository.getAccounts returns ServiceResponse<BankAccount[]>
      const { data, error } = await ManagementRepository.getAccounts();
      
      // 1. Handle Error: If there's an error, THROW it.
      if (error) throw error; 
      
      // 2. SUCCESS: Because the Repository now guarantees data is [] (empty array)
      // or [data] on successful fetch, we can safely return the non-null data.
      // This cast asserts to TypeScript that `data` is now the clean TData type.
      return data as BankAccount[]; 
    },
  });
}

export function useCategoriesAndGroups() {
  return useQuery<Category[], Error>({
    queryKey: [QUERY_KEYS.CATEGORIES_AND_GROUPS],
    queryFn: async () => {
      const { data, error } = await ManagementRepository.getCategoriesAndGroups();
      if (error) throw error;
      return data as Category[]; // ✅ Ensure only the array is returned
    },
  });
}

export function useCurrencies() {
  return useQuery<Currency[], Error>({
    queryKey: [QUERY_KEYS.CURRENCIES],
    queryFn: async () => {
      const { data, error } = await ManagementRepository.getCurrencies();
      if (error) throw error;
      return data as Currency[]; // ✅ Ensure only the array is returned
    },
  });
}

// 👈 NEW: Hook to fetch Transactions
export function useTransactions() {
  return useQuery<Transaction[], Error>({
      queryKey: [QUERY_KEYS.TRANSACTIONS],
      queryFn: async () => {
          const { data, error } = await ManagementRepository.getTransactions();
          if (error) throw error;
          return data as Transaction[]; // ✅ Ensure only the array is returned
      },
      staleTime: 1000 * 60 * 5,
  });
}

// --------------------------------------------------
// --- 4. WRITE Hooks (useMutation) ---
// --------------------------------------------------

export function useCreateAccount() {
    const queryClient = useQueryClient();
  
    // Changed mutation return type to the data itself (BankAccount | null) for cleaner onSuccess/onError handling
    return useMutation<BankAccount | null, Error, CreateAccountArgs>({
        mutationFn: async ({ name, initialBalance, currencyCode }) => {
            const result = await ManagementRepository.createAccount(name, initialBalance, currencyCode);
            if (result.error) throw result.error;
            return result.data; // Return the successfully created object
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] }); 
        },
    });
}
  
export function useCreateGrouping() {
    const queryClient = useQueryClient();
  
    return useMutation<Category | null, Error, string>({
        mutationFn: async (name) => {
            const result = await ManagementRepository.createGrouping(name);
            if (result.error) throw result.error;
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES_AND_GROUPS] });
        },
    });
}

export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation<Category | null, Error, CreateCategoryArgs>({
        mutationFn: async ({ name, parentId }) => {
            const result = await ManagementRepository.createCategory(name, parentId);
            if (result.error) throw result.error;
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES_AND_GROUPS] });
        },
    });
}

export function useCreateCurrency() {
    const queryClient = useQueryClient();
  
    return useMutation<Currency | null, Error, CreateCurrencyArgs>({
        mutationFn: async ({ code }) => {
            const result = await ManagementRepository.createCurrency(code);
            if (result.error) throw result.error;
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENCIES] });
        },
    });
}

// 👈 NEW: Hook to create a new Transaction
export function useCreateTransaction() {
    const queryClient = useQueryClient();

    return useMutation<Transaction | null, Error, NewTransactionInsert>({
        mutationFn: async (transactionData) => {
            const result = await ManagementRepository.createTransaction(transactionData);
            if (result.error) throw result.error;
            return result.data;
        },
        onSuccess: () => {
            // Refetch the list of transactions and any dashboard summaries
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] }); 
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTION_SUMMARY] }); 
        },
    });
}