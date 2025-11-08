import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateCurrency } from '@/hooks/useManagementData'; 
import { CurrencyRow as Currency } from '@/types/supabase';

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';

// Note: We are only allowing editing the code, as 'is_main' is handled
// by the "Set as Main" button in the list.

export default function EditCurrencyModal() {
  const router = useRouter();
  const { item } = useLocalSearchParams();
  const currency = JSON.parse(item as string) as Currency;

  const { mutate: updateCurrency, isPending: isUpdating } = useUpdateCurrency();

  const [code, setCode] = useState(currency.code);

  const handleUpdateCurrency = () => {
    if (code.trim().length !== 3) {
      Alert.alert('Error', 'Code must be 3 letters.');
      return;
    }
    
    updateCurrency(
      { 
        code: currency.code, // Use the *original* code to find the row
        updates: { 
          code: code.toUpperCase().trim(), // Set the new code
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
        <CustomInput 
          label="Currency Code"
          placeholder="e.g. USD"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          maxLength={3}
        />
        <PrimaryButton 
          title={isUpdating ? 'Saving...' : 'Save Changes'}
          onPress={handleUpdateCurrency}
          disabled={isUpdating}
        />
      </ScrollView>
    </View>
  );
}