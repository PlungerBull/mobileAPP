import React from 'react'; // 👈 REMOVED: useState
import { View, ScrollView, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateCurrency } from '@/hooks/useManagementData'; 
import { CurrencyRow as Currency } from '@/types/supabase';

// 👈 RHF Imports
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditCurrencySchema, EditCurrencyFormValues } from '@/types/FormSchemas';

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';

export default function EditCurrencyModal() {
  const router = useRouter();
  const { item } = useLocalSearchParams();
  const currency = JSON.parse(item as string) as Currency;

  const { mutate: updateCurrency, isPending: isUpdating } = useUpdateCurrency();

  // 👈 REMOVED: useState for code

  // 👈 RHF Setup
  const { control, handleSubmit, formState: { errors } } = useForm<EditCurrencyFormValues>({
    resolver: zodResolver(EditCurrencySchema),
    defaultValues: {
      code: currency.code,
    }
  });

  // 👈 RHF Submit Handler
  const handleUpdateCurrency = (data: EditCurrencyFormValues) => {
    updateCurrency(
      { 
        code: currency.code, // Use the *original* code to find the row
        updates: { 
          code: data.code.toUpperCase().trim(), // Set the new code
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
          title: 'Edit Currency',
          headerLeft: () => <View />, 
          headerRight: CloseButton,
        }} 
      />
      <ScrollView contentContainerStyle={modalStyles.container}>
        {/* 👈 Refactored Form */}
        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput 
              label="Currency Code"
              placeholder="e.g. USD"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="characters"
              maxLength={3}
              errorText={errors.code?.message}
            />
          )}
        />
        <PrimaryButton 
          title={isUpdating ? 'Saving...' : 'Save Changes'}
          onPress={handleSubmit(handleUpdateCurrency)} // 👈 RHF Submit
          disabled={isUpdating}
        />
      </ScrollView>
    </View>
  );
}