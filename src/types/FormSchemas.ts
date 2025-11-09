// types/FormSchemas.ts
import { z } from 'zod';

// --- Auth Schemas ---

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginFormValues = z.infer<typeof LoginSchema>;

export const SignUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type SignUpFormValues = z.infer<typeof SignUpSchema>;

// --- Management "Add" Schemas ---

// For the 'Add New Account' form in manage-accounts.tsx
export const AddAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  initialBalance: z.string().regex(/^\-?(\d+)(\.\d{1,2})?$/, 'Invalid amount'),
  currency: z.string().length(3, 'Must be 3 letters').min(1, 'Required'),
});
export type AddAccountFormValues = z.infer<typeof AddAccountSchema>;

// For the 'Add New' form in manage-categories.tsx
export const AddCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  parentId: z.string(), // 'None' or a UUID
});
export type AddCategoryFormValues = z.infer<typeof AddCategorySchema>;

// For the 'Add New' form in manage-groupings.tsx
export const AddGroupingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});
export type AddGroupingFormValues = z.infer<typeof AddGroupingSchema>;

// For the 'Add New Currency' form in manage-currencies.tsx
export const AddCurrencySchema = z.object({
  code: z.string().length(3, 'Code must be 3 letters').min(1, 'Required'),
});
export type AddCurrencyFormValues = z.infer<typeof AddCurrencySchema>;

// ✅ UPDATED: For the 'Add Transaction' modal (with optional exchange rate)
export const AddTransactionSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.string().regex(/^\-?(\d+)(\.\d{1,2})?$/, 'Invalid amount format'), 
  accountId: z.string().uuid('Account is required'),
  categoryId: z.string().uuid('Category is required'),
  // ✅ NEW: Optional exchange rate field (only required when currencies differ)
  exchangeRate: z.string()
    .regex(/^(\d+)(\.\d+)?$/, 'Invalid exchange rate')
    .optional()
    .or(z.literal('')), // Allow empty string for same-currency transactions
});
export type AddTransactionFormValues = z.infer<typeof AddTransactionSchema>;


// --- Management "Edit" Schemas ---

// For the 'edit-account.tsx' modal
export const EditAccountSchema = AddAccountSchema;
export type EditAccountFormValues = z.infer<typeof EditAccountSchema>;

// For the 'edit-category.tsx' modal
export const EditCategorySchema = AddCategorySchema;
export type EditCategoryFormValues = z.infer<typeof EditCategorySchema>;

// For the 'edit-currency.tsx' modal
export const EditCurrencySchema = AddCurrencySchema;
export type EditCurrencyFormValues = z.infer<typeof EditCurrencySchema>;