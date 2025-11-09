# Project: personalFinanceApp

## **1. Project Purpose**
This is a personal finance mobile app built with React Native and Supabase. It allows users to log their daily expenses immediately and view categorized spending, helping them manage their personal finances and save more.
## **2. Core Philosophy (The "Vibe")**
* **Design:** We MUST follow a minimalist, clean, and wholesome design that has warmth. The user experience should feel light, fast, and empowering.
* **Inspiration:** The benchmark for this "vibe" is the feel of apps like **Todoist** and **Notion**—functional, beautiful, and intuitive.
* **Principle:** Every UI choice (colors, fonts, layout) must serve this core philosophy. Avoid clutter and unnecessary friction.
## **3. Tech Stack**
* **Platform:** React Native with Expo
* **Language:** TypeScript
* **Backend:** Supabase (for Auth, Database, and API)
* **Database:** Supabase (PostgreSQL)
## **4. Key Libraries**
- **Routing:** Expo Router (file-based)
- **UI:** **React Native Paper**. A production-ready component library following Material Design 3 principles with excellent theming capabilities, perfect for achieving our minimalist, warm aesthetic while being actively maintained and fully compatible with Expo and TypeScript.
- **Server State:** TanStack Query (v5) (for all data fetching/caching from Supabase)
- **Client State:** Zustand (for simple global state like UI toggles)
- **Forms:** React Hook Form (for all user input)
## **5. Coding Standards**
*  **File Structure:** We use a **hybrid structure** to get the benefits of Expo Router (file-based routes) and feature-based modularity.
	- **/app/**: This directory is for **ROUTES ONLY**. It mirrors the URL structure of the app. Files here should be "thin" and import their logic from `/src/`.
	    - _Example:_ `app/(tabs)/home.tsx` is a route file.
	    - _Example:_ `app/(auth)/login.tsx` is a route file.
	- **/src/**: This directory contains **ALL modular code and features**. This is where our feature-based structure lives.
	    - _Example:_ `src/features/authentication/screens/LoginScreen.tsx` (the _actual_ screen component).
	    - _Example:_ `src/features/transactions/hooks/useCreateTransaction.ts` (the logic).
	    - _Example:_ `src/components/shared/StyledButton.tsx` (reusable UI).
	- **The Flow:** The route file (`app/(auth)/login.tsx`) simply imports and exports the real screen (`src/features/authentication/screens/LoginScreen.tsx`).
* **Naming:**
    * Components: `PascalCase.tsx` (e.g., `ExpenseList.tsx`)
    * Functions/Variables: `camelCase` (e.g., `getExpenses`)
    * Database (Supabase): `snake_case` (as per the provided schema: `user_id`, `created_at`, `amount_home`).
* **Patterns:**
    1.  All code MUST be TypeScript.
    2.  All components MUST be functional components with Hooks.
    3.  All server state (data from Supabase) MUST be managed with **TanStack Query** (e.g., `useQuery`, `useMutation`). Do NOT use `useState` for server data.
    4.  Global, non-server UI state (e.g., auth status, modal visibility) MUST be managed with **Zustand**.
    5.  All database calls MUST use the `supabase-js` client.
## **6. Core Product Requirements (Pillars)**
1.  **Authentication:** Uses Supabase Auth. The `user_id` in all tables is a foreign key to `auth.users.id`.
2.  **DATA ISOLATION (CRITICAL):** A user can **ONLY** see, edit, or delete their _own_ data.
	- **Implementation:** This MUST be enforced on the **database level** using Supabase **Row Level Security (RLS)** policies on _every_ table (`bankAccounts`, `categories`, `transactions`, `currencies`).
	- **Policy:** Policies will be written in SQL to check that the `user_id` column of a row matches the `auth.uid()` of the currently authenticated user.
	- **Client-Side Code:** The client (React Native app) MUST NOT perform any user-based filtering (e.g., `data.filter(d => d.user_id === user.id)`). The client code should trust that RLS has already filtered all data.
3.  **Transaction Model (Based on `transactions` table):**
	- **`INCOME`** is a transaction record with a **positive** `amount_original` value.
	- **`EXPENSE`** is a transaction record with a **negative** `amount_original` value.
	- **`TRANSFER`** is modeled as two separate transaction records (one negative, one positive).
	- **`TRANSFER` Implementation (CRITICAL):** To prevent data corruption (e.g., one record failing), transfers **MUST** be created using a single **Supabase `rpc` (database function)**, such as `create_transfer`.
	    - This function must run inside a database transaction (atomically).
	    - The client app will use a single `useMutation` hook to call this one `rpc` function, _not_ two separate `insert` calls.
4.  **Data Schema (Based on user-provided schema):**
    * `bankAccounts`: `id (uuid)`, `user_id (uuid)`, `name (text)`, `starting_balance (numeric)`, `currency (text)`.
    * `categories`: `id (uuid)`, `user_id (uuid)`, `name (text)`, `parent_id (uuid)`. The `parent_id` allows for nested sub-categories.
    * `currencies`: `id (uuid)`, `user_id (uuid)`, `code (text)`, `is_main (boolean)`. The user's "main currency" is the record where `is_main` is `true`.
    * `transactions`: `id (uuid)`, `user_id (uuid)`, `date (timestamptz)`, `description (text)`, `amount_home (numeric)`, `amount_original (numeric)`, `currency_original (text)`, `exchange_rate (numeric)`, `account_id (uuid)`, `category_id (uuid)`.
5.  **Multi-Currency Logic:**
	- All transactions are entered in their `amount_original` and `currency_original` (e.g., 50, "USD").
	- If `currency_original` is NOT the user's main currency, the `exchange_rate` MUST be stored.
	- **For V1, the user MUST manually input the `exchange_rate`** in the "Add Transaction" form. This adds a field to the form.
	- `amount_home` is the calculated value in the user's main currency (e.g., `amount_original * exchange_rate`).
## **7. Non-Goals (v1)**
* We will NOT be adding budgets, investment tracking, or shared accounts/expenses.
* We will NOT be building a web app (mobile-only for v1).
* We will NOT be supporting "offline mode."