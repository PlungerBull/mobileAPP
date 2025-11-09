// hooks/useManagementData.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ManagementRepository } from '@/src/services/ManagementRepository';

// ✅ Import core DB types from the canonical source
import {
    AccountRow, CategoryRow, CurrencyRow, TransactionRow, NewTransaction
} from '@/src/types/supabase';
// ✅ FIXED & NEW: Import all argument types from the canonical file
import {
    ServiceResponse,
    CreateAccountArgs,
    CreateCategoryArgs,
    CreateCurrencyArgs, // 👈 ADDED HERE (Now consistent)
    CreateTransferArgs, // 👈 NEW: Argument type for transfer mutation
    DeleteByIdArgs,
    DeleteByCodeArgs,
    SetMainCurrencyArgs,
    UpdateAccountArgs,
    UpdateCategoryArgs,
    UpdateCurrencyArgs
} from '@/src/types/ApiArgs';

// Define local aliases for clarity
type BankAccount = AccountRow;
type Category = CategoryRow;
type Currency = CurrencyRow;
type Transaction = TransactionRow;
type NewTransactionInsert = NewTransaction;

// --------------------------------------------------
// --- 2. Query Keys (Used for caching/refetching) ---
// --------------------------------------------------

const QUERY_KEYS = {
  ACCOUNTS: 'accounts',
  GROUPS: 'groups',
  CATEGORIES: 'categories',
  CATEGORIES_AND_GROUPS: 'categoriesAndGroups', 
  CURRENCIES: 'currencies',
  TRANSACTIONS: 'transactions',
  TRANSACTION_SUMMARY: 'transactionSummary',
};

// --------------------------------------------------
// --- 3. READ Hooks (useQuery) ---
// --------------------------------------------------

export function useAccounts() {
  return useQuery<BankAccount[], Error>({ 
    queryKey: [QUERY_KEYS.ACCOUNTS],
    queryFn: async () => {
      const { data, error } = await ManagementRepository.getAccounts();
      if (error) throw error; 
      return data as BankAccount[]; 
    },
  });
}

/** Hook to fetch only Groups (top-level categories) */
export function useGroups() {
  return useQuery<Category[], Error>({
    queryKey: [QUERY_KEYS.GROUPS],
    queryFn: async () => {
      const { data, error } = await ManagementRepository.getGroups();
      if (error) throw error;
      return data as Category[]; 
    },
  });
}

/** Hook to fetch only sub-categories */
export function useCategories() {
  return useQuery<Category[], Error>({
    queryKey: [QUERY_KEYS.CATEGORIES],
    queryFn: async () => {
      const { data, error } = await ManagementRepository.getCategories();
      if (error) throw error;
      return data as Category[];
    },
  });
}

/** Hook to fetch all categories and groups */
export function useCategoriesAndGroups() {
  return useQuery<Category[], Error>({
    queryKey: [QUERY_KEYS.CATEGORIES_AND_GROUPS],
    queryFn: async () => {
      const { data, error } = await ManagementRepository.getCategoriesAndGroups();
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useCurrencies() {
  return useQuery<Currency[], Error>({
    queryKey: [QUERY_KEYS.CURRENCIES],
    queryFn: async () => {
      const { data, error } = await ManagementRepository.getCurrencies();
      if (error) throw error;
      return data as Currency[]; 
    },
  });
}

export function useTransactions() {
  return useQuery<Transaction[], Error>({
      queryKey: [QUERY_KEYS.TRANSACTIONS],
      queryFn: async () => {
          const { data, error } = await ManagementRepository.getTransactions();
          if (error) throw error;
          return data as Transaction[]; 
      },
      staleTime: 1000 * 60 * 5,
  });
}

// --------------------------------------------------
// --- 4. WRITE Hooks (useMutation) ---
// --------------------------------------------------

export function useCreateAccount() {
    const queryClient = useQueryClient();
  
    return useMutation<BankAccount | null, Error, CreateAccountArgs>({
        mutationFn: async ({ name, initialBalance, currencyCode }) => {
            const result = await ManagementRepository.createAccount(name, initialBalance, currencyCode);
            if (result.error) throw result.error;
            return result.data; 
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
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUPS] });
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
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUPS] });
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

// ✅ NEW: Mutation for creating an atomic money transfer
export function useCreateTransfer() { 
    const queryClient = useQueryClient();

    return useMutation<null, Error, CreateTransferArgs>({
        mutationFn: async (transferData) => {
            const { error } = await ManagementRepository.createTransfer(transferData);
            if (error) throw error;
            return null; // RPC operations often return void/null
        },
        onSuccess: () => {
            // Transfers create two transactions and change account balances. Invalidate both.
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] }); 
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] }); 
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTION_SUMMARY] }); 
        },
    });
}

// --- DELETE/UPDATE MUTATION HOOKS ---

export function useDeleteAccount() {
    const queryClient = useQueryClient();
    return useMutation<null, Error, DeleteByIdArgs>({
        mutationFn: async ({ id }) => {
            const result = await ManagementRepository.deleteAccount(id);
            if (result.error) throw result.error;
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] });
        },
    });
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation<null, Error, DeleteByIdArgs>({
        mutationFn: async ({ id }) => {
            const result = await ManagementRepository.deleteCategory(id);
            if (result.error) throw result.error;
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUPS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES_AND_GROUPS] });
        },
    });
}

export function useDeleteCurrency() {
    const queryClient = useQueryClient();
    return useMutation<null, Error, DeleteByCodeArgs>({
        mutationFn: async ({ code }) => {
            const result = await ManagementRepository.deleteCurrency(code);
            if (result.error) throw result.error;
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENCIES] });
        },
    });
}

export function useSetMainCurrency() {
    const queryClient = useQueryClient();
    return useMutation<null, Error, SetMainCurrencyArgs>({
        mutationFn: async ({ code }) => {
            const result = await ManagementRepository.setMainCurrency(code);
            if (result.error) throw result.error;
            return result.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENCIES] });
        },
    });
}

// --- UPDATE MUTATION HOOKS (Corrected) ---

export function useUpdateAccount() {
    const queryClient = useQueryClient();
    return useMutation<BankAccount | null, Error, UpdateAccountArgs>({
        mutationFn: async (args: UpdateAccountArgs) => {
            const { data, error } = await ManagementRepository.updateAccount(args);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] });
        },
    });
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation<Category | null, Error, UpdateCategoryArgs>({
        mutationFn: async (args: UpdateCategoryArgs) => {
            const { data, error } = await ManagementRepository.updateCategory(args);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GROUPS] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES_AND_GROUPS] });
        },
    });
}

export function useUpdateCurrency() {
    const queryClient = useQueryClient();
    return useMutation<Currency | null, Error, UpdateCurrencyArgs>({
        mutationFn: async (args: UpdateCurrencyArgs) => {
            const { data, error } = await ManagementRepository.updateCurrency(args);
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENCIES] });
        },
    });
}

/**
 * Hook to get the user's main currency.
 * Returns the currency marked as is_main: true
 */
export function useMainCurrency() {
    return useQuery<Currency | null, Error>({
      queryKey: [QUERY_KEYS.CURRENCIES, 'main'],
      queryFn: async () => {
        const { data, error } = await ManagementRepository.getCurrencies();
        if (error) throw error;
        
        const currencies = data as Currency[];
        const mainCurrency = currencies.find(c => c.is_main);
        
        return mainCurrency || null;
      },
    });
  }