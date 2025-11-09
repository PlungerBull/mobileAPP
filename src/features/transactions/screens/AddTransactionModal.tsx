import React, { useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  StyleSheet,
  Pressable,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { AddTransactionSchema, AddTransactionFormValues } from '@/src/types/FormSchemas';
import { BottomSheetPicker } from '@/src/components/BottomSheetPicker';
import { DatePickerModal } from '@/src/components/DatePickerModal';

import {
  useCreateTransaction,
  useAccounts,
  useCategoriesAndGroups,
  useMainCurrency
} from '@/src/hooks/useManagementData';

import { NewTransaction, CategoryRow as Category } from '@/src/types/supabase';

export default function AddTransactionModal() {
  const router = useRouter();

  // --- Local state for picker modals ---
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [note, setNote] = useState('');

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
    formState: { errors },
    setValue,
    watch,
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

  // Watch the selected values
  const selectedAccountId = watch('accountId');
  const selectedCategoryId = watch('categoryId');
  
  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const selectedCategory = allCategories.find(c => c.id === selectedCategoryId);
  
  // Determine if exchange rate is needed
  const needsExchangeRate = mainCurrency && selectedAccount 
    ? selectedAccount.currency !== mainCurrency.code 
    : false;

  const isLoading = loadingAccounts || loadingCategories || loadingMainCurrency;

  // --- Prepare picker options ---
  const categoryOptions = useMemo(() => {
    const groups: Category[] = allCategories.filter(c => c.parent_id === null);
    const categories: Category[] = allCategories.filter(c => c.parent_id !== null);
    
    const options = [];
    for (const group of groups) {
      options.push({ 
        label: group.name, 
        value: group.id, 
        isGroup: true 
      });
      // Add sub-categories under this group
      const subCategories = categories.filter(c => c.parent_id === group.id);
      for (const cat of subCategories) {
        options.push({ 
          label: `  ${cat.name}`, 
          value: cat.id,
          isGroup: false
        });
      }
    }
    return options;
  }, [allCategories]);

  const accountOptions = useMemo(() => {
    return accounts.map(account => ({
      label: `${account.name} (${account.currency})`,
      value: account.id,
      isGroup: false,
    }));
  }, [accounts]);

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
      date: selectedDate.toISOString(),
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

            {/* Date - Now Clickable */}
            <View style={styles.fieldContainer}>
              <TouchableOpacity
                style={styles.dateContainer}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {selectedDate.toLocaleDateString('en-US', { 
                    month: '2-digit', 
                    day: '2-digit', 
                    year: 'numeric' 
                  })}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#666" />
              </TouchableOpacity>
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

            {/* Note (Now Editable) */}
            <View style={styles.fieldContainer}>
              <TextInput
                style={styles.input}
                placeholder="Note (Optional)"
                placeholderTextColor="#999"
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            {/* Category Picker - Custom TouchableOpacity */}
            <View style={styles.fieldContainer}>
              <TouchableOpacity
                style={[styles.pickerButton, errors.categoryId && styles.inputError]}
                onPress={() => setShowCategoryPicker(true)}
              >
                <Text style={[styles.pickerButtonText, !selectedCategory && styles.placeholderText]}>
                  {selectedCategory ? selectedCategory.name : 'Select category...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
              {errors.categoryId && (
                <Text style={styles.errorText}>{errors.categoryId.message}</Text>
              )}
            </View>

            {/* Account Picker - Custom TouchableOpacity */}
            <View style={styles.fieldContainer}>
              <TouchableOpacity
                style={[styles.pickerButton, errors.accountId && styles.inputError]}
                onPress={() => setShowAccountPicker(true)}
              >
                <Text style={[styles.pickerButtonText, !selectedAccount && styles.placeholderText]}>
                  {selectedAccount ? selectedAccount.name : 'Select account...'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>
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

      {/* Category Bottom Sheet Picker */}
      <BottomSheetPicker
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        options={categoryOptions}
        selectedValue={selectedCategoryId}
        onValueChange={(value) => setValue('categoryId', value)}
        title="Select Category"
      />

      {/* Account Bottom Sheet Picker */}
      <BottomSheetPicker
        visible={showAccountPicker}
        onClose={() => setShowAccountPicker(false)}
        options={accountOptions}
        selectedValue={selectedAccountId}
        onValueChange={(value) => setValue('accountId', value)}
        title="Select Account"
      />

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        title="Select Date"
      />
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
  pickerButton: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    color: '#999',
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