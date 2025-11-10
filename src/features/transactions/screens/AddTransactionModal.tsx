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
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { AddTransactionSchema, AddTransactionFormValues } from '@/src/types/FormSchemas';
import { BottomSheetPicker } from '@/src/components/BottomSheetPicker';
import { DatePickerModal } from '@/src/components/DatePickerModal';

import {
  useCreateTransaction,
  useAccounts,
  useCategoriesAndGroups,
  useCurrencies,
  useMainCurrency
} from '@/src/hooks/useManagementData';

import { NewTransaction, CategoryRow as Category } from '@/src/types/supabase';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.8; // 80% of screen (4/5)

export default function AddTransactionModal() {
  const router = useRouter();

  // --- Local state for picker modals ---
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [note, setNote] = useState('');

  // --- Data Fetching ---
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const { data: allCategories = [], isLoading: loadingCategories } = useCategoriesAndGroups();
  const { data: currencies = [], isLoading: loadingCurrencies } = useCurrencies();
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
  
  // Set default currency when component loads
  React.useEffect(() => {
    if (mainCurrency && !selectedCurrency) {
      setSelectedCurrency(mainCurrency.code);
    }
  }, [mainCurrency]);
  
  // Determine if exchange rate is needed
  const needsExchangeRate = mainCurrency && selectedCurrency
    ? selectedCurrency !== mainCurrency.code 
    : false;

  const isLoading = loadingAccounts || loadingCategories || loadingCurrencies || loadingMainCurrency;

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
      label: account.name,
      value: account.id,
      isGroup: false,
    }));
  }, [accounts]);

  const currencyOptions = useMemo(() => {
    return currencies.map(currency => ({
      label: currency.code,
      value: currency.code,
      isGroup: false,
    }));
  }, [currencies]);

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/transactions');
    }
  };

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

    if (!selectedCurrency) {
      Alert.alert('Error', 'Please select a currency.');
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
      currency_original: selectedCurrency,
      exchange_rate: exchangeRate,
      account_id: data.accountId,
      category_id: data.categoryId,
    };
    
    createTransaction(transactionData, {
      onSuccess: () => handleClose(),
      onError: (e) => Alert.alert('Save Failed', e.message),
    });
  };

  return (
    <View style={styles.outerContainer}>
      {/* Configure this as a transparent modal */}
      <Stack.Screen
        options={{
          presentation: 'transparentModal',
          animation: 'fade',
          headerShown: false,
        }}
      />
      
      {/* Dark backdrop - tap to close */}
      <Pressable style={styles.backdrop} onPress={handleClose} />
      
      {/* The actual modal card */}
      <View style={styles.modalCard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Transaction</Text>
          <Pressable 
            onPress={handleClose} 
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
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color="#f39c12" style={styles.loader} />
          ) : (
            <>
              {/* Amount + Currency Row */}
              <View style={styles.amountRow}>
                <View style={styles.amountInputContainer}>
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.amountInput, errors.amount && styles.inputError]}
                        placeholder="Amount"
                        placeholderTextColor="#999"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="decimal-pad"
                      />
                    )}
                  />
                </View>
                
                <TouchableOpacity
                  style={styles.currencyButton}
                  onPress={() => setShowCurrencyPicker(true)}
                >
                  <Text style={styles.currencyButtonText}>
                    {selectedCurrency || 'USD'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#666" />
                </TouchableOpacity>
              </View>
              {errors.amount && (
                <Text style={styles.errorText}>{errors.amount.message}</Text>
              )}

              {/* Date */}
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

              {/* Note */}
              <View style={styles.fieldContainer}>
                <TextInput
                  style={[styles.input, styles.noteInput]}
                  placeholder="Note (Optional)"
                  placeholderTextColor="#999"
                  value={note}
                  onChangeText={setNote}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>

              {/* Category Picker */}
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

              {/* Account Picker */}
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
                    Converting from {selectedCurrency} to {mainCurrency?.code}
                  </Text>
                  <Controller
                    control={control}
                    name="exchangeRate"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        style={[styles.input, errors.exchangeRate && styles.inputError]}
                        placeholder={`Exchange Rate (${selectedCurrency} to ${mainCurrency?.code})`}
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

      {/* Currency Bottom Sheet Picker */}
      <BottomSheetPicker
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
        options={currencyOptions}
        selectedValue={selectedCurrency}
        onValueChange={setSelectedCurrency}
        title="Select Currency"
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
  outerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: MODAL_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
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
  amountRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  amountInputContainer: {
    flex: 1,
  },
  amountInput: {
    height: 56,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  currencyButton: {
    width: 100,
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
  currencyButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
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
  noteInput: {
    height: 80,
    paddingTop: 16,
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