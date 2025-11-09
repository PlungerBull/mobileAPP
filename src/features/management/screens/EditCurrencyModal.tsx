import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateCurrency } from '@/src/hooks/useManagementData';
import { CurrencyRow as Currency } from '@/src/types/supabase';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditCurrencySchema, EditCurrencyFormValues } from '@/src/types/FormSchemas';

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/src/components/ModalCommon';

export default function EditCurrencyModal() {
  const router = useRouter();
  const { item } = useLocalSearchParams();
  const currency = JSON.parse(item as string) as Currency;

  const { mutate: updateCurrency, isPending: isUpdating } = useUpdateCurrency();

  const { control, handleSubmit, formState: { errors } } = useForm<EditCurrencyFormValues>({
    resolver: zodResolver(EditCurrencySchema),
    defaultValues: {
      code: currency.code,
    }
  });

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
          onPress={handleSubmit(handleUpdateCurrency)}
          disabled={isUpdating}
        />
      </ScrollView>
    </View>
  );
}