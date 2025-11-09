import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { AddTransactionSchema, AddTransactionFormValues } from '@/src/types/FormSchemas';

import {
  useCreateTransaction,
  useAccounts,
  useCategoriesAndGroups,
  useMainCurrency
} from '@/src/hooks/useManagementData';

import { NewTransaction, CategoryRow as Category } from '@/src/types/supabase';

export default function AddTransactionModal() {
  const router = useRouter();

  // --- Data Fetching ---
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const { data: allCategories = [], isLoading: loadingCategories } = useCategoriesAndGroups();
  const { data: mainCurrency, isLoading: loadingMainCurrency } = useMainCurrency();

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
      exchangeRate: '',
    }
  });

  // Watch the selected account to determine if we need the exchange rate field
  const selectedAccountId = useWatch({ control, name: 'accountId' });
  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  
  // Determine if exchange rate is needed
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
    
    let exchangeRate = 1;
    let amountHome = parsedAmount;
    
    if (needsExchangeRate) {
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
      amount_home: amountHome,
      amount_original: parsedAmount,
      currency_original: selectedAccount.currency,
      exchange_rate: exchangeRate,
      account_id: data.accountId,
      category_id: data.categoryId,
    };
    
    createTransaction(transactionData, {
      onSuccess: () => router.back(),
      onError: (e) => Alert.alert('Save Failed', e.message),
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
        }} 
      />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Transaction</Text>
        <Pressable 
          onPress={() => router.back()} 
          hitSlop={10}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={28} color="#000" />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#f39c12" style={styles.loader} />
        ) : (
          <>
            {/* Amount */}
            <View style={styles.fieldContainer}>
              <Controller
                control={control}
                name="amount"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.amount && styles.inputError]}
                    placeholder="Amount"
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="decimal-pad"
                  />
                )}
              />
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount.message}</Text>
              )}
            </View>

            {/* Date (Currently shows today's date - you can make this editable later) */}
            <View style={styles.fieldContainer}>
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>
                  {new Date().toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                  })}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </View>
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.description && styles.inputError]}
                    placeholder="Description"
                    placeholderTextColor="#999"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="sentences"
                  />
                )}
              />
              {errors.description && (
                <Text style={styles.errorText}>{errors.description.message}</Text>
              )}
            </View>

            {/* Note (Optional) - Placeholder for future feature */}
            <View style={styles.fieldContainer}>
              <TextInput
                style={styles.input}
                placeholder="Note (Optional)"
                placeholderTextColor="#999"
                editable={false}
              />
            </View>

            {/* Category Picker */}
            <View style={styles.fieldContainer}>
              <Controller
                control={control}
                name="categoryId"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.pickerContainer, errors.categoryId && styles.inputError]}>
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select category..." value={undefined} color="#999" />
                      {categoryPickerItems}
                    </Picker>
                  </View>
                )}
              />
              {errors.categoryId && (
                <Text style={styles.errorText}>{errors.categoryId.message}</Text>
              )}
            </View>

            {/* Account Picker */}
            <View style={styles.fieldContainer}>
              <Controller
                control={control}
                name="accountId"
                render={({ field: { onChange, value } }) => (
                  <View style={[styles.pickerContainer, errors.accountId && styles.inputError]}>
                    <Picker
                      selectedValue={value}
                      onValueChange={onChange}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select account..." value={undefined} color="#999" />
                      {accounts.map(account => (
                        <Picker.Item 
                          key={account.id} 
                          label={`${account.name}`} 
                          value={account.id} 
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              />
              {errors.accountId && (
                <Text style={styles.errorText}>{errors.accountId.message}</Text>
              )}
            </View>

            {/* Exchange Rate (conditional) */}
            {needsExchangeRate && (
              <View style={styles.fieldContainer}>
                <Text style={styles.helperText}>
                  Converting from {selectedAccount?.currency} to {mainCurrency?.code}
                </Text>
                <Controller
                  control={control}
                  name="exchangeRate"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.exchangeRate && styles.inputError]}
                      placeholder={`Exchange Rate (${selectedAccount?.currency} to ${mainCurrency?.code})`}
                      placeholderTextColor="#999"
                      value={value || ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="decimal-pad"
                    />
                  )}
                />
                {errors.exchangeRate && (
                  <Text style={styles.errorText}>{errors.exchangeRate.message}</Text>
                )}
              </View>
            )}

            {/* Save Button */}
            <Pressable
              style={[styles.saveButton, isCreating && styles.saveButtonDisabled]}
              onPress={handleSubmit(handleSaveTransaction)}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 40,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  inputError: {
    borderColor: '#e63946',
  },
  dateContainer: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 56,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#e63946',
    marginTop: 4,
    marginLeft: 4,
  },
  saveButton: {
    height: 56,
    backgroundColor: '#f39c12',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});