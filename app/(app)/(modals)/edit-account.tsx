import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateAccount } from '@/hooks/useManagementData'; 
import { AccountRow as BankAccount } from '@/types/supabase';

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';

export default function EditAccountModal() {
  const router = useRouter();
  const { item } = useLocalSearchParams();
  const account = JSON.parse(item as string) as BankAccount;

  const { mutate: updateAccount, isPending: isUpdating } = useUpdateAccount();

  const [name, setName] = useState(account.name);
  const [initialBalance, setInitialBalance] = useState(String(account.starting_balance));
  const [currency, setCurrency] = useState(account.currency); 

  const handleUpdateAccount = () => {
    if (!name.trim() || isNaN(parseFloat(initialBalance)) || !currency.trim()) {
      Alert.alert('Error', 'Please enter a valid name, numerical balance, and currency.');
      return;
    }
    
    updateAccount(
      { 
        id: account.id,
        updates: { 
          name: name.trim(),
          starting_balance: parseFloat(initialBalance), 
          currency: currency.trim(),
        }
      }, 
      {
        onSuccess: () => router.back(),
        onError: (error) => Alert.alert('Update Failed', error.message),
      }
    );
  };
  
  return (
    <View style={modalStyles.safeArea}>
      <Stack.Screen 
        options={{ 
          title: 'Edit Account',
          headerLeft: () => <View />, 
          headerRight: CloseButton,
        }} 
      />
      <ScrollView contentContainerStyle={modalStyles.container}>
        <CustomInput 
          label="Name"
          placeholder="e.g. Savings Account"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <CustomInput 
          label="Balance"
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
          title={isUpdating ? 'Saving...' : 'Save Changes'}
          onPress={handleUpdateAccount}
          disabled={isUpdating}
        />
      </ScrollView>
    </View>
  );
}