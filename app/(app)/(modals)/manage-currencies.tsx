import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useCurrencies, useCreateCurrency } from '@/hooks/useManagementData'; 

// ✅ Imports from the new component folder
import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';
import { CurrencyRow } from '@/components/list-items/CurrencyRow';

// --- Main Modal Component ---
export default function ManageCurrenciesModal() {
  const router = useRouter();
  const { data: currencies = [], isLoading: loadingCurrencies } = useCurrencies();
  const { mutate: createCurrency, isPending: isCreating } = useCreateCurrency();

  const [code, setCode] = useState('');

  const handleAddCurrency = () => {
    if (code.trim().length !== 3) {
      Alert.alert('Error', 'Please enter a 3-letter currency code (e.g., CAD).');
      return;
    }
    
    createCurrency({ code: code.toUpperCase().trim() }, {
      onSuccess: () => setCode(''),
      onError: (e) => Alert.alert('Creation Failed', e.message),
    });
  };
  
  // Placeholder Handlers for List Items
  const handleSetMain = (code: string) => console.log('Set Main', code);
  const handleEdit = (code: string) => console.log('Edit', code);
  const handleDelete = (code: string) => console.log('Delete', code);

  return (
    <View style={modalStyles.safeArea}>
      <Stack.Screen 
        options={{ 
          title: 'Manage Currencies',
          headerLeft: () => <View />, 
          headerRight: CloseButton, // ✅ Reusable component
        }} 
      />
      
      <ScrollView contentContainerStyle={modalStyles.container}>
        
        <Text style={modalStyles.listTitle}>Existing Currencies</Text>
        {loadingCurrencies ? (
          <ActivityIndicator size="small" color="#e63946" />
        ) : (
          <View>
            {currencies.map(c => (
              <CurrencyRow // ✅ Reusable component
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
        <CustomInput // ✅ Reusable component
          label="Code"
          placeholder="e.g. CAD"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          maxLength={3}
        />

        <PrimaryButton // ✅ Reusable component
          title={isCreating ? 'Adding...' : 'Add'}
          onPress={handleAddCurrency}
          disabled={isCreating}
        />
      </ScrollView>
    </View>
  );
}
// 🚫 All previous styles and local components are REMOVED.