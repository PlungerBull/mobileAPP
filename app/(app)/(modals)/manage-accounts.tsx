import React, { useState } from 'react';
import { 
  View, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  Text,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAccounts, useCreateAccount } from '@/hooks/useManagementData';

// ✅ Imports from the new component folder
import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';
import { AccountRow } from '@/components/list-items/AccountRow';

// --- Main Modal Component ---
export default function ManageAccountsModal() {
  const router = useRouter();
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const { mutate: createAccount, isPending: isCreating } = useCreateAccount();

  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [currency, setCurrency] = useState('USD'); 

  const handleAddAccount = () => {
    if (!name.trim() || isNaN(parseFloat(initialBalance)) || !currency.trim()) {
      Alert.alert('Error', 'Please enter a valid name, numerical balance, and currency.');
      return;
    }
    
    createAccount(
      { 
        name: name.trim(), 
        initialBalance: parseFloat(initialBalance), 
        currencyCode: currency.trim(),
      }, 
      {
        onSuccess: () => {
          setName('');
          setInitialBalance('0');
        },
        onError: (error) => {
          Alert.alert('Creation Failed', error.message);
        },
      }
    );
  };
  
  // Placeholder Handlers for List Items
  const handleEdit = (id: string) => console.log('Edit', id);
  const handleDelete = (id: string) => console.log('Delete', id);

  return (
    <View style={modalStyles.safeArea}>
      <Stack.Screen 
        options={{ 
          title: 'Manage Accounts',
          headerLeft: () => <View />, 
          headerRight: CloseButton, // ✅ Reusable component
        }} 
      />
      
      <ScrollView contentContainerStyle={modalStyles.container}>
        
        {/* Existing Accounts List */}
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
                onDelete={handleDelete} 
              />
            ))}
            {accounts.length === 0 && <Text style={modalStyles.emptyText}>No accounts added yet.</Text>}
          </View>
        )}
        
        <View style={modalStyles.separator} />

        {/* Add New Form */}
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
// 🚫 All previous styles and local components are REMOVED.