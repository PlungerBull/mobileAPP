import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateAccount } from '@/hooks/useManagementData'; 
import { AccountRow as BankAccount } from '@/types/supabase';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditAccountSchema, EditAccountFormValues } from '@/types/FormSchemas';

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';

export default function EditAccountModal() {
  const router = useRouter();
  const { item } = useLocalSearchParams();
  const account = JSON.parse(item as string) as BankAccount;

  const { mutate: updateAccount, isPending: isUpdating } = useUpdateAccount();

  const { control, handleSubmit, formState: { errors } } = useForm<EditAccountFormValues>({
    resolver: zodResolver(EditAccountSchema),
    defaultValues: {
      name: account.name,
      initialBalance: String(account.starting_balance),
      currency: account.currency,
    }
  });

  const handleUpdateAccount = (data: EditAccountFormValues) => {
    updateAccount(
      { 
        id: account.id,
        updates: { 
          name: data.name.trim(),
          starting_balance: parseFloat(data.initialBalance), 
          currency: data.currency.trim(),
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
              label="Balance"
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
          title={isUpdating ? 'Saving...' : 'Save Changes'}
          onPress={handleSubmit(handleUpdateAccount)}
          disabled={isUpdating}
        />
      </ScrollView>
    </View>
  );
}