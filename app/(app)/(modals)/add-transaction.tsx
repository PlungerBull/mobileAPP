import React, { useState, useMemo } from 'react'; // ✅ Add useMemo
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

// Import our hooks
import { 
  useCreateTransaction, 
  useAccounts, 
  // ✅ UPDATED: Change to the correct hook
  useCategoriesAndGroups 
} from '@/hooks/useManagementData'; 

// Import reusable components
import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';

// Import the type for a new transaction
import { NewTransaction, CategoryRow as Category } from '@/types/supabase'; // ✅ Add Category type

export default function AddTransactionModal() {
  const router = useRouter();

  // --- Form State ---
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);

  // --- Data Fetching ---
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  // ✅ UPDATED: Fetch all categories and groups
  const { data: allCategories = [], isLoading: loadingCategories } = useCategoriesAndGroups();

  // --- Mutation ---
  const { mutate: createTransaction, isPending: isCreating } = useCreateTransaction();

  const isLoading = loadingAccounts || loadingCategories;

  // ✅ NEW: Use useMemo to format the picker list
  const categoryPickerItems = useMemo(() => {
    const groups: Category[] = allCategories.filter(c => c.parent_id === null);
    const categories: Category[] = allCategories.filter(c => c.parent_id !== null);

    const items = [];
    
    // Add all top-level groups
    for (const group of groups) {
      items.push(<Picker.Item key={group.id} label={group.name} value={group.id} />);
    }
    
    // Add all sub-categories, indented
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


  const handleSaveTransaction = () => {
    // ... (This function remains unchanged) ...
    const parsedAmount = parseFloat(amount);
    if (!description.trim() || isNaN(parsedAmount) || !accountId || !categoryId) {
      Alert.alert('Error', 'Please fill out all fields with valid data.');
      return;
    }
    const selectedAccount = accounts.find(a => a.id === accountId);
    if (!selectedAccount) {
      Alert.alert('Error', 'Invalid account selected.');
      return;
    }
    const transactionData: NewTransaction = {
      date: new Date().toISOString(),
      description: description.trim(),
      amount_home: parsedAmount,
      amount_original: parsedAmount,
      currency_original: selectedAccount.currency,
      exchange_rate: 1,
      account_id: accountId,
      category_id: categoryId,
    };
    createTransaction(transactionData, {
      onSuccess: () => {
        router.back();
      },
      onError: (e) => {
        Alert.alert('Save Failed', e.message);
      },
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
            {/* ... (Description and Amount CustomInputs are unchanged) ... */}
            <CustomInput 
              label="Description"
              placeholder="e.g. Coffee"
              value={description}
              onChangeText={setDescription}
              autoCapitalize="sentences"
            />
            <CustomInput 
              label="Amount"
              placeholder="0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            {/* ... (Account Picker is unchanged) ... */}
            <View style={modalStyles.inputContainer}>
              <Text style={modalStyles.inputLabel}>Account</Text>
              <View style={modalStyles.pickerWrapper}>
                <Picker
                  selectedValue={accountId} 
                  onValueChange={(itemValue) => setAccountId(itemValue)}
                  style={modalStyles.picker}
                >
                  <Picker.Item label="Select an account..." value={null} /> 
                  {accounts.map(account => (
                    <Picker.Item key={account.id} label={`${account.name} (${account.currency})`} value={account.id} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* ✅ UPDATED: Category Picker now shows groups and sub-categories */}
            <View style={modalStyles.inputContainer}>
              <Text style={modalStyles.inputLabel}>Category</Text>
              <View style={modalStyles.pickerWrapper}>
                <Picker
                  selectedValue={categoryId} 
                  onValueChange={(itemValue) => setCategoryId(itemValue)}
                  style={modalStyles.picker}
                >
                  <Picker.Item label="Select a category..." value={null} /> 
                  {categoryPickerItems}
                </Picker>
              </View>
            </View>

            <PrimaryButton 
              title={isCreating ? 'Saving...' : 'Save Transaction'}
              onPress={handleSaveTransaction}
              disabled={isCreating}
              style={{ marginTop: 20 }}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}