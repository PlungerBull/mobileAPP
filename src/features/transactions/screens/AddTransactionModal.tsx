import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddTransactionSchema, AddTransactionFormValues } from '@/src/types/FormSchemas';

import {
  useCreateTransaction,
  useAccounts,
  useCategoriesAndGroups,
  useMainCurrency // ✅ NEW: Import the main currency hook
} from '@/src/hooks/useManagementData';

import { PrimaryButton, CustomInput, CloseButton, CustomPicker, modalStyles } from '@/src/components/ModalCommon';
import { NewTransaction, CategoryRow as Category } from '@/src/types/supabase';

export default function AddTransactionModal() {
  const router = useRouter();

  // --- Data Fetching ---
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const { data: allCategories = [], isLoading: loadingCategories } = useCategoriesAndGroups();
  const { data: mainCurrency, isLoading: loadingMainCurrency } = useMainCurrency(); // ✅ NEW

  // --- Mutation ---
  const { mutate: createTransaction, isPending: isCreating } = useCreateTransaction();

  // --- RHF Setup ---
  const { 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<AddTransactionFormValues>({
    resolver: zodResolver(AddTransactionSchema),
    defaultValues: {
      description: '',
      amount: '',
      accountId: undefined,
      categoryId: undefined,
      exchangeRate: '', // ✅ NEW: Default to empty string
    }
  });

  // ✅ NEW: Watch the selected account to determine if we need the exchange rate field
  const selectedAccountId = useWatch({ control, name: 'accountId' });
  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  
  // ✅ NEW: Determine if exchange rate is needed
  const needsExchangeRate = mainCurrency && selectedAccount 
    ? selectedAccount.currency !== mainCurrency.code 
    : false;

  const isLoading = loadingAccounts || loadingCategories || loadingMainCurrency;

  const categoryPickerItems = useMemo(() => {
    const groups: Category[] = allCategories.filter(c => c.parent_id === null);
    const categories: Category[] = allCategories.filter(c => c.parent_id !== null);
    const items = [];
    for (const group of groups) {
      items.push(<Picker.Item key={group.id} label={group.name} value={group.id} />);
    }
    for (const category of categories) {
      items.push(
        <Picker.Item 
          key={category.id} 
          label={`  — ${category.name}`} 
          value={category.id} 
        />
      );
    }
    return items;
  }, [allCategories]);

  const handleSaveTransaction = (data: AddTransactionFormValues) => {
    const parsedAmount = parseFloat(data.amount);
    
    if (!selectedAccount) {
      Alert.alert('Error', 'Invalid account selected.');
      return;
    }

    if (!mainCurrency) {
      Alert.alert('Error', 'No main currency set. Please set a main currency first.');
      return;
    }
    
    // ✅ FIXED: Proper exchange rate handling
    let exchangeRate = 1;
    let amountHome = parsedAmount;
    
    if (needsExchangeRate) {
      // If currencies differ, exchange rate is REQUIRED
      if (!data.exchangeRate || data.exchangeRate.trim() === '') {
        Alert.alert('Error', 'Exchange rate is required for different currencies.');
        return;
      }
      exchangeRate = parseFloat(data.exchangeRate);
      amountHome = parsedAmount * exchangeRate;
    }
    
    const transactionData: NewTransaction = {
      date: new Date().toISOString(),
      description: data.description.trim(),
      amount_home: amountHome, // ✅ FIXED: Calculated correctly
      amount_original: parsedAmount,
      currency_original: selectedAccount.currency,
      exchange_rate: exchangeRate, // ✅ FIXED: User-provided or 1
      account_id: data.accountId,
      category_id: data.categoryId,
    };
    
    createTransaction(transactionData, {
      onSuccess: () => router.back(),
      onError: (e) => Alert.alert('Save Failed', e.message),
    });
  };

  return (
    <View style={modalStyles.safeArea}>
      
      <ScrollView contentContainerStyle={modalStyles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#e63946" />
        ) : (
          <>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput 
                  label="Description"
                  placeholder="e.g. Coffee"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="sentences"
                  errorText={errors.description?.message}
                />
              )}
            />
            
            <Controller
              control={control}
              name="amount"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput 
                  label="Amount"
                  placeholder="0.00"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  keyboardType="numeric"
                  errorText={errors.amount?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="accountId"
              render={({ field: { onChange, value } }) => (
                <CustomPicker
                  label="Account"
                  selectedValue={value} 
                  onValueChange={onChange}
                  errorText={errors.accountId?.message}
                >
                  <Picker.Item label="Select an account..." value={undefined} /> 
                  {accounts.map(account => (
                    <Picker.Item key={account.id} label={`${account.name} (${account.currency})`} value={account.id} />
                  ))}
                </CustomPicker>
              )}
            />

            {/* ✅ NEW: Conditionally show exchange rate field */}
            {needsExchangeRate && (
              <View>
                <Text style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
                  Converting from {selectedAccount?.currency} to {mainCurrency?.code}
                </Text>
                <Controller
                  control={control}
                  name="exchangeRate"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInput 
                      label={`Exchange Rate (${selectedAccount?.currency} to ${mainCurrency?.code})`}
                      placeholder="e.g. 1.25"
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                      errorText={errors.exchangeRate?.message}
                    />
                  )}
                />
              </View>
            )}

            <Controller
              control={control}
              name="categoryId"
              render={({ field: { onChange, value } }) => (
                <CustomPicker
                  label="Category"
                  selectedValue={value} 
                  onValueChange={onChange}
                  errorText={errors.categoryId?.message}
                >
                  <Picker.Item label="Select a category..." value={undefined} /> 
                  {categoryPickerItems}
                </CustomPicker>
              )}
            />

            <PrimaryButton 
              title={isCreating ? 'Saving...' : 'Save Transaction'}
              onPress={handleSubmit(handleSaveTransaction)}
              disabled={isCreating}
              style={{ marginTop: 20 }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}