import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
// ✅ UPDATED: Import new hooks
import { 
  useCurrencies, 
  useCreateCurrency,
  useDeleteCurrency,
  useSetMainCurrency
} from '@/hooks/useManagementData'; 

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';
import { CurrencyRow } from '@/components/list-items/CurrencyRow';

export default function ManageCurrenciesModal() {
  const router = useRouter();
  const { data: currencies = [], isLoading: loadingCurrencies } = useCurrencies();
  const { mutate: createCurrency, isPending: isCreating } = useCreateCurrency();
  // ✅ NEW: Get delete and setMain mutations
  const { mutate: deleteCurrency } = useDeleteCurrency();
  const { mutate: setMainCurrency } = useSetMainCurrency();

  const [code, setCode] = useState('');

  const handleAddCurrency = () => {
    // ... (This function remains unchanged)
    if (code.trim().length !== 3) {
      Alert.alert('Error', 'Please enter a 3-letter currency code (e.g., CAD).');
      return;
    }
    createCurrency({ code: code.toUpperCase().trim() }, {
      onSuccess: () => setCode(''),
      onError: (e) => Alert.alert('Creation Failed', e.message),
    });
  };
  
  // ✅ UPDATED: Implement placeholder handlers
  const handleSetMain = (code: string) => {
    setMainCurrency({ code }, {
      onError: (e) => Alert.alert('Update Failed', e.message)
    });
  };
  // ✅ UPDATED: This function now navigates to the edit modal
  const handleEdit = (code: string) => {
    const currencyToEdit = currencies.find(c => c.code === code);
    if (currencyToEdit) {
      router.push({
        pathname: '/edit-currency',
        params: { item: JSON.stringify(currencyToEdit) }
      });
    }
  };
  
  const handleDelete = (code: string) => {
    // Prevent deleting the main currency
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
        {loadingCurrencies ? (
          <ActivityIndicator size="small" color="#e63946" />
        ) : (
          <View>
            {currencies.map(c => (
              <CurrencyRow 
                key={c.code} 
                currency={c} 
                onSetMain={handleSetMain} // ✅ Wired up
                onEdit={handleEdit}
                onDelete={handleDelete}  // ✅ Wired up
              />
            ))}
            {currencies.length === 0 && <Text style={modalStyles.emptyText}>No currencies set up yet.</Text>}
          </View>
        )}
        
        <View style={modalStyles.separator} />

        {/* ... (Add New Form remains unchanged) ... */}
        <Text style={modalStyles.addTitle}>Add New Currency</Text>
        <CustomInput 
          label="Code"
          placeholder="e.g. CAD"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          maxLength={3}
        />
        <PrimaryButton 
          title={isCreating ? 'Adding...' : 'Add'}
          onPress={handleAddCurrency}
          disabled={isCreating}
        />
      </ScrollView>
    </View>
  );
}