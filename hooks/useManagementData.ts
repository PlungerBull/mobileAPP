import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ManagementRepository } from '@/services/ManagementRepository'; 
import { BankAccount, Category, Currency, ServiceResponse } from '@/types/ManagementTypes';

// --------------------------------------------------
// --- 1. Mutation Argument Interfaces (Input Types)---
// --------------------------------------------------

interface CreateAccountArgs {
  name: string;
  initialBalance: number;
  currencyCode: string; // The UI passes this, the repo maps it to 'currency'
}

// 👈 FIXED: Input interface for creating a general category (group or sub-category)
interface CreateCategoryArgs {
  name: string;
  parentId?: string | null;
}

// 👈 FIXED: Input interface for creating a currency
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
      return data || []; 
    },
  });
}

export function useCategoriesAndGroups() {
  return useQuery<Category[], Error>({
    queryKey: [QUERY_KEYS.CATEGORIES_AND_GROUPS],
    queryFn: async () => {
      const { data, error } = await ManagementRepository.getCategoriesAndGroups();
      if (error) throw error;
      return data || [];
    },
  });
}

export function useCurrencies() {
  return useQuery<Currency[], Error>({
    queryKey: [QUERY_KEYS.CURRENCIES],
    queryFn: async () => {
      const { data, error } = await ManagementRepository.getCurrencies();
      if (error) throw error;
      return data || [];
    },
  });
}

// --------------------------------------------------
// --- 4. WRITE Hooks (useMutation) ---
// --------------------------------------------------

export function useCreateAccount() {
    const queryClient = useQueryClient();
  
    // 💡 NOTE: CreateAccountArgs is now imported from @/types/ManagementTypes
    return useMutation<ServiceResponse<BankAccount | null>, Error, CreateAccountArgs>({
        // 🚫 REMOVED: accountType from destructuring
        mutationFn: async ({ name, initialBalance, currencyCode }) => {
            // 🚫 REMOVED: accountType argument from repository call
            const result = await ManagementRepository.createAccount(name, initialBalance, currencyCode);
            if (result.error) throw result.error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ACCOUNTS] }); 
        },
    });
}
  
export function useCreateGrouping() {
    const queryClient = useQueryClient();
  
    return useMutation<ServiceResponse<Category | null>, Error, string>({
        mutationFn: async (name) => {
            // This calls the createGrouping helper in the repo
            const result = await ManagementRepository.createGrouping(name);
            if (result.error) throw result.error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES_AND_GROUPS] });
        },
    });
}

// 👈 NEW HOOK: Creating a General Category (Group or Sub-Category)
export function useCreateCategory() {
    const queryClient = useQueryClient();

    return useMutation<ServiceResponse<Category | null>, Error, CreateCategoryArgs>({
        mutationFn: async ({ name, parentId }) => {
            const result = await ManagementRepository.createCategory(name, parentId);
            if (result.error) throw result.error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CATEGORIES_AND_GROUPS] });
        },
    });
}

export function useCreateCurrency() {
    const queryClient = useQueryClient();
  
    return useMutation<ServiceResponse<Currency | null>, Error, CreateCurrencyArgs>({
        mutationFn: async ({ code }) => {
            const result = await ManagementRepository.createCurrency(code);
            if (result.error) throw result.error;
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENCIES] });
        },
    });
}