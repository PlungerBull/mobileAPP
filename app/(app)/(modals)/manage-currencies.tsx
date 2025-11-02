import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  Alert, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Currency } from '@/types/ManagementTypes';
import { useCurrencies, useCreateCurrency } from '@/hooks/useManagementData'; 

// --- Reusable Components (copied from other modals) ---
const PrimaryButton = ({ onPress, title, disabled = false }: { onPress: () => void, title: string, disabled?: boolean }) => (
  <Pressable style={[modalStyles.button, disabled && modalStyles.buttonDisabled]} onPress={onPress} disabled={disabled}>
    <Text style={modalStyles.buttonText}>{title}</Text>
  </Pressable>
);

const CustomInput = (props: TextInput['props'] & { label: string }) => (
  <View style={modalStyles.inputContainer}>
    <Text style={modalStyles.inputLabel}>{props.label}</Text>
    <TextInput style={modalStyles.input} {...props} />
  </View>
);

// --- Component to show an individual existing Currency row ---
const CurrencyRow = ({ currency }: { currency: Currency }) => (
  <View style={modalStyles.row}>
    <View>
      <Text style={modalStyles.rowText}>{currency.code}</Text>
      {currency.is_main && <Text style={modalStyles.mainTag}>Main</Text>}
    </View>
    <View style={modalStyles.rowActions}>
      {!currency.is_main && (
          <TouchableOpacity onPress={() => console.log('Set Main', currency.code)} style={{ paddingHorizontal: 10 }}>
            <Text style={modalStyles.setMainText}>Set as Main</Text>
          </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => console.log('Edit', currency.code)} style={{ paddingHorizontal: 10 }}>
        <Ionicons name="create-outline" size={20} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('Delete', currency.code)}>
        <Ionicons name="trash-outline" size={20} color="#e63946" />
      </TouchableOpacity>
    </View>
  </View>
);

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
  
  const CloseButton = () => (
    <Pressable onPress={() => router.back()}>
      <Ionicons name="close" size={24} color="#000" />
    </Pressable>
  );

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
              <CurrencyRow key={c.code} currency={c} />
            ))}
            {currencies.length === 0 && <Text style={modalStyles.emptyText}>No currencies set up yet.</Text>}
          </View>
        )}
        
        <View style={modalStyles.separator} />

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

// Reusing styles defined in manage-accounts.tsx, renamed to modalStyles
const modalStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  listTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  row: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowText: { fontSize: 16 },
  rowActions: { flexDirection: 'row', alignItems: 'center' },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 20 },
  addTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  inputContainer: { marginBottom: 15 },
  inputLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: { backgroundColor: '#B0B0B0' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyText: { color: '#999', paddingVertical: 10 },
  mainTag: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a7a40', 
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  setMainText: {
    color: '#007AFF', // Standard iOS blue link color
    fontSize: 15,
  }
});