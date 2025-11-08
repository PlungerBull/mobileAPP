import React from 'react'; // 👈 REMOVED: useState
import { 
  View, Text, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { 
  useCurrencies, useCreateCurrency, useDeleteCurrency, useSetMainCurrency
} from '@/hooks/useManagementData'; 

// 👈 RHF Imports
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddCurrencySchema, AddCurrencyFormValues } from '@/types/FormSchemas';

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';
import { CurrencyRow } from '@/components/list-items/CurrencyRow';

export default function ManageCurrenciesModal() {
  const router = useRouter();
  const { data: currencies = [], isLoading: loadingCurrencies } = useCurrencies();
  const { mutate: createCurrency, isPending: isCreating } = useCreateCurrency();
  const { mutate: deleteCurrency } = useDeleteCurrency();
  const { mutate: setMainCurrency } = useSetMainCurrency();

  // 👈 REMOVED: useState for code

  // 👈 RHF Setup
  const { control, handleSubmit, reset, formState: { errors } } = useForm<AddCurrencyFormValues>({
    resolver: zodResolver(AddCurrencySchema),
    defaultValues: {
      code: '',
    }
  });

  // 👈 RHF Submit Handler
  const handleAddCurrency = (data: AddCurrencyFormValues) => {
    createCurrency({ code: data.code.toUpperCase().trim() }, {
      onSuccess: () => reset(), // 👈 Reset form
      onError: (e) => Alert.alert('Creation Failed', e.message),
    });
  };
  
  const handleSetMain = (code: string) => {
    // ... (This function remains unchanged)
    setMainCurrency({ code }, {
      onError: (e) => Alert.alert('Update Failed', e.message)
    });
  };

  const handleEdit = (code: string) => {
    // ... (This function remains unchanged)
    const currencyToEdit = currencies.find(c => c.code === code);
    if (currencyToEdit) {
      router.push({
        pathname: '/edit-currency',
        params: { item: JSON.stringify(currencyToEdit) }
      });
    }
  };
  
  const handleDelete = (code: string) => {
    // ... (This function remains unchanged)
    const currency = currencies.find(c => c.code === code);
    if (currency?.is_main) {
      Alert.alert('Error', 'Cannot delete your main currency. Please set another currency as main first.');
      return;
    }
    Alert.alert(
      "Delete Currency",
      `Are you sure you want to delete ${code}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteCurrency({ code }, {
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
          title: 'Manage Currencies',
          headerLeft: () => <View />, 
          headerRight: CloseButton, 
        }} 
      />
      
      <ScrollView contentContainerStyle={modalStyles.container}>
        
        <Text style={modalStyles.listTitle}>Existing Currencies</Text>
        {/* ... (List rendering logic is unchanged) ... */}
        {loadingCurrencies ? (
          <ActivityIndicator size="small" color="#e63946" />
        ) : (
          <View>
            {currencies.map(c => (
              <CurrencyRow 
                key={c.code} 
                currency={c} 
                onSetMain={handleSetMain}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
            {currencies.length === 0 && <Text style={modalStyles.emptyText}>No currencies set up yet.</Text>}
          </View>
        )}
        
        <View style={modalStyles.separator} />

        <Text style={modalStyles.addTitle}>Add New Currency</Text>
        
        {/* 👈 Refactored Form */}
        <Controller
          control={control}
          name="code"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput 
              label="Code"
              placeholder="e.g. CAD"
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
          title={isCreating ? 'Adding...' : 'Add'}
          onPress={handleSubmit(handleAddCurrency)} // 👈 RHF Submit
          disabled={isCreating}
        />
      </ScrollView>
    </View>
  );
}