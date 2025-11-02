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
import { BankAccount } from '@/types/ManagementTypes';
import { useAccounts, useCreateAccount } from '@/hooks/useManagementData';

// --- Reusable Button and Input Components (Conceptual) ---

const PrimaryButton = ({ onPress, title, disabled = false }: { onPress: () => void, title: string, disabled?: boolean }) => (
  <Pressable style={[styles.button, disabled && styles.buttonDisabled]} onPress={onPress} disabled={disabled}>
    <Text style={styles.buttonText}>{title}</Text>
  </Pressable>
);

const CustomInput = (props: TextInput['props'] & { label: string }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{props.label}</Text>
    <TextInput style={styles.input} {...props} />
  </View>
);

// --- Component to show an individual existing account row ---
const AccountRow = ({ account }: { account: BankAccount }) => (
  <View style={styles.accountRow}>
    {/* Displaying account name and its currency code (from 'currency' field in DB) */}
    <Text style={styles.accountText}>{account.name} ({account.currency})</Text>
    <View style={styles.accountActions}>
      <TouchableOpacity onPress={() => console.log('Edit', account.id)} style={{ paddingHorizontal: 10 }}>
        <Ionicons name="create-outline" size={20} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('Delete', account.id)}>
        <Ionicons name="trash-outline" size={20} color="#e63946" />
      </TouchableOpacity>
    </View>
  </View>
);

// --- Main Modal Component ---
export default function ManageAccountsModal() {
  const router = useRouter();
  const { data: accounts = [], isLoading: loadingAccounts } = useAccounts();
  const { mutate: createAccount, isPending: isCreating } = useCreateAccount();

  const [name, setName] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [currency, setCurrency] = useState('USD'); 

  const handleAddAccount = () => {
    // Validation enforces that Name, Balance, and Currency are present.
    if (!name.trim() || isNaN(parseFloat(initialBalance)) || !currency.trim()) {
      Alert.alert('Error', 'Please enter a valid name, numerical balance, and currency.');
      return;
    }
    
    // Call the mutation hook, which interacts with the repository
    createAccount(
      // Passing only the required three fields to the hook
      { 
        name: name.trim(), 
        initialBalance: parseFloat(initialBalance), 
        currencyCode: currency.trim(),
      }, 
      {
        onSuccess: () => {
          setName('');
          setInitialBalance('0');
        },
        onError: (error) => {
          Alert.alert('Creation Failed', error.message);
        },
      }
    );
  };
  
  // Custom header to close the modal
  const CloseButton = () => (
    <Pressable onPress={() => router.back()}>
      <Ionicons name="close" size={24} color="#000" />
    </Pressable>
  );

  return (
    <View style={styles.safeArea}>
      <Stack.Screen 
        options={{ 
          title: 'Manage Accounts',
          headerLeft: () => <View />, 
          headerRight: CloseButton,
        }} 
      />
      
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Existing Accounts List */}
        <Text style={styles.listTitle}>Existing Accounts</Text>
        {loadingAccounts ? (
          <ActivityIndicator size="small" color="#e63946" />
        ) : (
          <View>
            {accounts.map(account => (
              <AccountRow key={account.id} account={account} />
            ))}
            {accounts.length === 0 && <Text style={styles.emptyText}>No accounts added yet.</Text>}
          </View>
        )}
        
        <View style={styles.separator} />

        {/* Add New Form */}
        <Text style={styles.addTitle}>Add New Account</Text>
        <CustomInput
          label="Name"
          placeholder="e.g. Savings Account"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        
        <CustomInput
          label="Initial Balance"
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
          title={isCreating ? 'Adding...' : 'Add'}
          onPress={handleAddAccount}
          disabled={isCreating}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  accountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  accountText: {
    fontSize: 16,
  },
  accountActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 20,
  },
  addTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
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
    backgroundColor: '#6200EE', // A distinct purple for action
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#B0B0B0',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyText: {
    color: '#999',
    paddingVertical: 10,
  },
});