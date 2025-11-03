// types/ManagementTypes.ts (Recommended Clean Content)

// --- API Argument Interfaces (Inputs ONLY) ---
export interface CreateCategoryArgs {
  name: string;
  parentId?: string | null;
}

export interface CreateAccountArgs {
  name: string;
  initialBalance: number;
  currencyCode: string;
  // NOTE: If your DB *actually* requires 'type', you must re-add it here
  // based on the enum from supabase.ts (e.g., accountType: AccountType)
  // For now, we assume it's NOT mandatory based on the previous discussion.
}

// Universal standardized response type for all services/repositories
export type ServiceResponse<T = any> = {
  data: T | null;
  error: Error | null;
};