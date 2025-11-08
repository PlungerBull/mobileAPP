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
import { useForm, Controller } from 'react-hook-form'; // 👈 RHF
import { zodResolver } from '@hookform/resolvers/zod'; // 👈 RHF
import { AddTransactionSchema, AddTransactionFormValues } from '@/types/FormSchemas'; // 👈 RHF

import { 
  useCreateTransaction, 
  useAccounts, 
  useCategoriesAndGroups 
} from '@/hooks/useManagementData'; 

import { PrimaryButton, CustomInput, CloseButton, CustomPicker, modalStyles } from '@/components/ModalCommon'; // 👈 Import CustomPicker
import { NewTransaction, CategoryRow as Category } from '@/types/supabase';

export default function AddTransactionModal() {
  const router = useRouter();

  // 👈 REMOVED: All useState hooks for form fields

  // --- Data Fetching ---
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const { data: allCategories = [], isLoading: loadingCategories } = useCategoriesAndGroups();

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
    }
  });

  const isLoading = loadingAccounts || loadingCategories;

  const categoryPickerItems = useMemo(() => {
    // ... (This logic remains unchanged)
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

  // 👈 RHF Submit Handler
  const handleSaveTransaction = (data: AddTransactionFormValues) => {
    const parsedAmount = parseFloat(data.amount);
    const selectedAccount = accounts.find(a => a.id === data.accountId);
    
    if (!selectedAccount) {
      Alert.alert('Error', 'Invalid account selected.');
      return;
    }
    
    const transactionData: NewTransaction = {
      date: new Date().toISOString(),
      description: data.description.trim(),
      amount_home: parsedAmount,
      amount_original: parsedAmount,
      currency_original: selectedAccount.currency,
      exchange_rate: 1,
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
      <Stack.Screen 
        options={{ 
          title: 'Add Transaction',
          headerLeft: () => <View />, 
          headerRight: CloseButton,
        }} 
      />
      
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
              onPress={handleSubmit(handleSaveTransaction)} // 👈 RHF submit
              disabled={isCreating}
              style={{ marginTop: 20 }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}