import React, { useState } from 'react';
import { 
  View, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  Text,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
// ✅ UPDATED: Import the delete hook
import { useAccounts, useCreateAccount, useDeleteAccount } from '@/hooks/useManagementData';

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';
import { AccountRow } from '@/components/list-items/AccountRow';

export default function ManageAccountsModal() {
  const router = useRouter();
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const { mutate: createAccount, isPending: isCreating } = useCreateAccount();
  // ✅ NEW: Get the delete mutation
  const { mutate: deleteAccount } = useDeleteAccount();

  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [currency, setCurrency] = useState('USD'); 

  const handleAddAccount = () => {
    // ... (This function remains unchanged)
    if (!name.trim() || isNaN(parseFloat(initialBalance)) || !currency.trim()) {
      Alert.alert('Error', 'Please enter a valid name, numerical balance, and currency.');
      return;
    }
    createAccount(
      { name: name.trim(), initialBalance: parseFloat(initialBalance), currencyCode: currency.trim() }, 
      {
        onSuccess: () => { setName(''); setInitialBalance('0'); },
        onError: (error) => { Alert.alert('Creation Failed', error.message); },
      }
    );
  };
  
  // ✅ UPDATED: This function now navigates to the edit modal
  const handleEdit = (id: string) => {
    const accountToEdit = accounts.find(a => a.id === id);
    if (accountToEdit) {
      router.push({
        pathname: '/edit-account',
        params: { item: JSON.stringify(accountToEdit) }
      });
    }
  };

  // ✅ --- THIS IS THE MISSING FUNCTION ---
  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Account",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteAccount({ id }, {
            onError: (e) => Alert.alert('Delete Failed', e.message)
          })
        }
      ]
    );
  };
  // ✅ --- END OF MISSING FUNCTION ---

  return (
    <View style={modalStyles.safeArea}>
      <Stack.Screen 
        options={{ 
          title: 'Manage Accounts',
          headerLeft: () => <View />, 
          headerRight: CloseButton, 
        }} 
      />
      
      <ScrollView contentContainerStyle={modalStyles.container}>
        
        <Text style={modalStyles.listTitle}>Existing Accounts</Text>
        {loadingAccounts ? (
          <ActivityIndicator size="small" color="#e63946" />
        ) : (
          <View>
            {accounts.map(account => (
              <AccountRow 
                key={account.id} 
                account={account} 
                onEdit={handleEdit} 
                onDelete={handleDelete} // ✅ This will now correctly find the function
              />
            ))}
            {accounts.length === 0 && <Text style={modalStyles.emptyText}>No accounts added yet.</Text>}
          </View>
        )}
        
        <View style={modalStyles.separator} />

        {/* ... (Add New Form remains unchanged) ... */}
        <Text style={modalStyles.addTitle}>Add New Account</Text>
        <CustomInput 
          label="Name"
          placeholder="e.g. Savings Account"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <CustomInput 
          label="Initial Balance"
          placeholder="0.00"
          value={initialBalance}
          onChangeText={setInitialBalance}
          keyboardType="numeric"
        />
        <CustomInput 
          label="Currency Code"
          placeholder="e.g. USD"
          value={currency}
          onChangeText={setCurrency}
          autoCapitalize="characters"
          maxLength={3}
        />
        <PrimaryButton 
          title={isCreating ? 'Adding...' : 'Add'}
          onPress={handleAddAccount}
          disabled={isCreating}
        />
      </ScrollView>
    </View>
  );
}