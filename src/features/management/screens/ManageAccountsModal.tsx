import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from '@/src/hooks/useManagementData';
import { AccountRow } from '@/src/types/supabase';

interface AccountItemProps {
  account: AccountRow;
  onDelete: (id: string) => void;
  onEdit: (id: string, newName: string) => void;
}

const AccountItem = ({ account, onDelete, onEdit }: AccountItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(account.name);

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== account.name) {
      onEdit(account.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      `Are you sure you want to delete "${account.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(account.id),
        },
      ]
    );
  };

  return (
    <View style={styles.accountItem}>
      <View style={styles.accountInfo}>
        {isEditing ? (
          <TextInput
            style={styles.editInput}
            value={editValue}
            onChangeText={setEditValue}
            onBlur={handleSave}
            onSubmitEditing={handleSave}
            autoFocus
            returnKeyType="done"
          />
        ) : (
          <Pressable onPress={() => setIsEditing(true)} style={styles.accountTextContainer}>
            <Text style={styles.accountText}>{account.name}</Text>
            <Text style={styles.accountBalance}>
              {account.currency} {account.starting_balance.toFixed(2)}
            </Text>
          </Pressable>
        )}
      </View>
      <Pressable onPress={handleDelete} hitSlop={10}>
        <Ionicons name="trash-outline" size={22} color="#999" />
      </Pressable>
    </View>
  );
};

export default function ManageAccountsModal() {
  const router = useRouter();
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountBalance, setNewAccountBalance] = useState('0');
  const [newAccountCurrency, setNewAccountCurrency] = useState('USD');
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: accounts = [], isLoading } = useAccounts();
  const { mutate: createAccount, isPending: isCreating } = useCreateAccount();
  const { mutate: deleteAccount } = useDeleteAccount();
  const { mutate: updateAccount } = useUpdateAccount();

  const handleAdd = () => {
    if (!newAccountName.trim()) {
      Alert.alert('Error', 'Account name is required');
      return;
    }

    const balance = parseFloat(newAccountBalance);
    if (isNaN(balance)) {
      Alert.alert('Error', 'Invalid balance amount');
      return;
    }

    createAccount(
      {
        name: newAccountName.trim(),
        initialBalance: balance,
        currencyCode: newAccountCurrency.toUpperCase().trim(),
      },
      {
        onSuccess: () => {
          setNewAccountName('');
          setNewAccountBalance('0');
          setNewAccountCurrency('USD');
          setShowAddForm(false);
        },
        onError: (e) => Alert.alert('Error', e.message),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteAccount(
      { id },
      {
        onError: (e) => Alert.alert('Error', e.message),
      }
    );
  };

  const handleEdit = (id: string, newName: string) => {
    const account = accounts.find((a) => a.id === id);
    if (!account) return;

    updateAccount(
      {
        id,
        updates: {
          name: newName,
          starting_balance: account.starting_balance,
          currency: account.currency,
        },
      },
      {
        onError: (e) => Alert.alert('Error', e.message),
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Manage Accounts',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={28} color="#000" />
            </Pressable>
          ),
          headerRight: () => <View />,
        }}
      />

      {/* Accounts List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#f39c12" style={styles.loader} />
        ) : accounts.length === 0 ? (
          <Text style={styles.emptyText}>No accounts yet</Text>
        ) : (
          accounts.map((account) => (
            <AccountItem
              key={account.id}
              account={account}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </ScrollView>

      {/* Add New Account */}
      <View style={styles.addContainer}>
        {!showAddForm ? (
          <Pressable
            style={styles.showFormButton}
            onPress={() => setShowAddForm(true)}
          >
            <Text style={styles.showFormButtonText}>+ Add New Account</Text>
          </Pressable>
        ) : (
          <View style={styles.addForm}>
            <TextInput
              style={styles.addInput}
              placeholder="Account name"
              value={newAccountName}
              onChangeText={setNewAccountName}
              autoCapitalize="words"
            />
            <View style={styles.addRow}>
              <TextInput
                style={[styles.addInput, styles.smallInput]}
                placeholder="Balance"
                value={newAccountBalance}
                onChangeText={setNewAccountBalance}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.addInput, styles.smallInput]}
                placeholder="Currency"
                value={newAccountCurrency}
                onChangeText={setNewAccountCurrency}
                autoCapitalize="characters"
                maxLength={3}
              />
            </View>
            <View style={styles.buttonRow}>
              <Pressable
                style={styles.cancelAddButton}
                onPress={() => {
                  setShowAddForm(false);
                  setNewAccountName('');
                  setNewAccountBalance('0');
                  setNewAccountCurrency('USD');
                }}
              >
                <Text style={styles.cancelAddText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.addButton, isCreating && styles.addButtonDisabled]}
                onPress={handleAdd}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.addButtonText}>Add</Text>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 10,
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  accountInfo: {
    flex: 1,
  },
  accountTextContainer: {
    flex: 1,
  },
  accountText: {
    fontSize: 17,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  accountBalance: {
    fontSize: 14,
    color: '#666',
  },
  editInput: {
    flex: 1,
    fontSize: 17,
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
  loader: {
    marginTop: 40,
  },
  addContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  showFormButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  showFormButtonText: {
    fontSize: 16,
    color: '#f39c12',
    fontWeight: '600',
  },
  addForm: {
    gap: 10,
  },
  addInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  addRow: {
    flexDirection: 'row',
    gap: 10,
  },
  smallInput: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelAddButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelAddText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#f39c12',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});