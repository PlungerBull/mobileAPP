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
  useCurrencies,
  useCreateCurrency,
  useDeleteCurrency,
  useUpdateCurrency,
  useSetMainCurrency,
} from '@/src/hooks/useManagementData';
import { CurrencyRow } from '@/src/types/supabase';

interface CurrencyItemProps {
  currency: CurrencyRow;
  onDelete: (code: string) => void;
  onEdit: (code: string, newCode: string) => void;
  onSetMain: (code: string) => void;
}

const CurrencyItem = ({ currency, onDelete, onEdit, onSetMain }: CurrencyItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(currency.code);

  const handleSave = () => {
    const newCode = editValue.toUpperCase().trim();
    if (newCode && newCode !== currency.code) {
      onEdit(currency.code, newCode);
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (currency.is_main) {
      Alert.alert('Error', 'Cannot delete your main currency. Set another currency as main first.');
      return;
    }

    Alert.alert(
      'Delete Currency',
      `Are you sure you want to delete ${currency.code}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(currency.code),
        },
      ]
    );
  };

  return (
    <View style={styles.currencyItem}>
      <View style={styles.currencyInfo}>
        {isEditing ? (
          <TextInput
            style={styles.editInput}
            value={editValue}
            onChangeText={setEditValue}
            onBlur={handleSave}
            onSubmitEditing={handleSave}
            autoFocus
            autoCapitalize="characters"
            maxLength={3}
            returnKeyType="done"
          />
        ) : (
          <Pressable onPress={() => setIsEditing(true)} style={styles.currencyTextContainer}>
            <View style={styles.currencyNameRow}>
              <Text style={styles.currencyText}>{currency.code}</Text>
              {currency.is_main && <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>Main</Text>
              </View>}
            </View>
            {!currency.is_main && (
              <Pressable onPress={() => onSetMain(currency.code)}>
                <Text style={styles.setMainText}>Set as main</Text>
              </Pressable>
            )}
          </Pressable>
        )}
      </View>
      <Pressable onPress={handleDelete} hitSlop={10}>
        <Ionicons name="trash-outline" size={22} color="#999" />
      </Pressable>
    </View>
  );
};

export default function ManageCurrenciesModal() {
  const router = useRouter();
  const [newCurrencyCode, setNewCurrencyCode] = useState('');

  const { data: currencies = [], isLoading } = useCurrencies();
  const { mutate: createCurrency, isPending: isCreating } = useCreateCurrency();
  const { mutate: deleteCurrency } = useDeleteCurrency();
  const { mutate: updateCurrency } = useUpdateCurrency();
  const { mutate: setMainCurrency } = useSetMainCurrency();

  const handleAdd = () => {
    const code = newCurrencyCode.toUpperCase().trim();
    if (!code) return;

    if (code.length !== 3) {
      Alert.alert('Error', 'Currency code must be exactly 3 letters');
      return;
    }

    createCurrency(
      { code },
      {
        onSuccess: () => setNewCurrencyCode(''),
        onError: (e) => Alert.alert('Error', e.message),
      }
    );
  };

  const handleDelete = (code: string) => {
    deleteCurrency(
      { code },
      {
        onError: (e) => Alert.alert('Error', e.message),
      }
    );
  };

  const handleEdit = (oldCode: string, newCode: string) => {
    updateCurrency(
      {
        code: oldCode,
        updates: { code: newCode },
      },
      {
        onError: (e) => Alert.alert('Error', e.message),
      }
    );
  };

  const handleSetMain = (code: string) => {
    setMainCurrency(
      { code },
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
          title: 'Manage Currencies',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10}>
              <Ionicons name="chevron-back" size={28} color="#000" />
            </Pressable>
          ),
          headerRight: () => <View />,
        }}
      />

      {/* Currencies List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#f39c12" style={styles.loader} />
        ) : currencies.length === 0 ? (
          <Text style={styles.emptyText}>No currencies yet</Text>
        ) : (
          currencies.map((currency) => (
            <CurrencyItem
              key={currency.code}
              currency={currency}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onSetMain={handleSetMain}
            />
          ))
        )}
      </ScrollView>

      {/* Add New Currency */}
      <View style={styles.addContainer}>
        <TextInput
          style={styles.addInput}
          placeholder="New currency code (e.g., EUR)"
          value={newCurrencyCode}
          onChangeText={setNewCurrencyCode}
          autoCapitalize="characters"
          maxLength={3}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <Pressable
          style={[styles.addButton, isCreating && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={isCreating || !newCurrencyCode.trim()}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Add</Text>
          )}
        </Pressable>
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
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  currencyInfo: {
    flex: 1,
  },
  currencyTextContainer: {
    flex: 1,
  },
  currencyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  currencyText: {
    fontSize: 17,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  mainBadge: {
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  mainBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a7a40',
  },
  setMainText: {
    fontSize: 14,
    color: '#007AFF',
  },
  editInput: {
    fontSize: 17,
    color: '#1a1a1a',
    fontWeight: '500',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  addInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
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