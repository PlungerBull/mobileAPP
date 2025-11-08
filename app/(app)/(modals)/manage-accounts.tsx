import React from 'react'; // 👈 REMOVED: useState
import { 
  View, Alert, ActivityIndicator, ScrollView, Text,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAccounts, useCreateAccount, useDeleteAccount } from '@/hooks/useManagementData';

// 👈 RHF Imports
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddAccountSchema, AddAccountFormValues } from '@/types/FormSchemas';

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';
import { AccountRow } from '@/components/list-items/AccountRow';

export default function ManageAccountsModal() {
  const router = useRouter();
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const { mutate: createAccount, isPending: isCreating } = useCreateAccount();
  const { mutate: deleteAccount } = useDeleteAccount();

  // 👈 REMOVED: useState for name, initialBalance, currency

  // 👈 RHF Setup
  const { control, handleSubmit, reset, formState: { errors } } = useForm<AddAccountFormValues>({
    resolver: zodResolver(AddAccountSchema),
    defaultValues: {
      name: '',
      initialBalance: '0',
      currency: 'USD',
    }
  });

  // 👈 RHF Submit Handler
  const handleAddAccount = (data: AddAccountFormValues) => {
    createAccount(
      { 
        name: data.name.trim(), 
        initialBalance: parseFloat(data.initialBalance), 
        currencyCode: data.currency.toUpperCase().trim() 
      }, 
      {
        onSuccess: () => reset(), // 👈 Reset form on success
        onError: (error) => Alert.alert('Creation Failed', error.message),
      }
    );
  };
  
  const handleEdit = (id: string) => {
    // ... (This function remains unchanged)
    const accountToEdit = accounts.find(a => a.id === id);
    if (accountToEdit) {
      router.push({
        pathname: '/edit-account',
        params: { item: JSON.stringify(accountToEdit) }
      });
    }
  };

  const handleDelete = (id: string) => {
    // ... (This function remains unchanged)
    Alert.alert(
      "Delete Account", "Are you sure? This cannot be undone.",
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
        {/* ... (List rendering logic is unchanged) ... */}
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

        <Text style={modalStyles.addTitle}>Add New Account</Text>
        
        {/* 👈 Refactored Form */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput 
              label="Name"
              placeholder="e.g. Savings Account"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              errorText={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="initialBalance"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput 
              label="Initial Balance"
              placeholder="0.00"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="numeric"
              errorText={errors.initialBalance?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="currency"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput 
              label="Currency Code"
              placeholder="e.g. USD"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="characters"
              maxLength={3}
              errorText={errors.currency?.message}
            />
          )}
        />
        <PrimaryButton 
          title={isCreating ? 'Adding...' : 'Add'}
          onPress={handleSubmit(handleAddAccount)} // 👈 RHF Submit
          disabled={isCreating}
        />
      </ScrollView>
    </View>
  );
}