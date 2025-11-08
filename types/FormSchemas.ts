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

// --- Management Schemas (Placeholders) ---

// Example schema for adding an account
export const AddAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  initialBalance: z.number().nonnegative('Balance must be non-negative'),
  currency: z.string().length(3, 'Currency must be a 3-letter code'),
});

export type AddAccountFormValues = z.infer<typeof AddAccountSchema>;

// Example schema for adding a transaction
export const AddTransactionSchema = z.object({
  description: z.string().min(1, 'Description is required').optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount format'), // Keep as string for RNF keyboardType="numeric"
  accountId: z.string().uuid('Account is required'),
  categoryId: z.string().uuid('Category is required'),
});

export type AddTransactionFormValues = z.infer<typeof AddTransactionSchema>;