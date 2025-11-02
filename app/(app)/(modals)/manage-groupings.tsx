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
import { Category } from '@/types/ManagementTypes';
import { useCategoriesAndGroups, useCreateGrouping } from '@/hooks/useManagementData'; 

// --- Reusable Button and Input Components (copied from Accounts modal) ---
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

// --- Component to show an individual existing Grouping row ---
const GroupingRow = ({ grouping }: { grouping: Category }) => (
  <View style={modalStyles.row}>
    <Text style={modalStyles.rowText}>{grouping.name}</Text>
    <View style={modalStyles.rowActions}>
      <TouchableOpacity onPress={() => console.log('Edit', grouping.id)} style={{ paddingHorizontal: 10 }}>
        <Ionicons name="create-outline" size={20} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('Delete', grouping.id)}>
        <Ionicons name="trash-outline" size={20} color="#e63946" />
      </TouchableOpacity>
    </View>
  </View>
);

// --- Main Modal Component ---
export default function ManageGroupingsModal() {
  const router = useRouter();
  const { data: categoriesAndGroups = [], isLoading: loadingGroups } = useCategoriesAndGroups();
  const { mutate: createGrouping, isPending: isCreating } = useCreateGrouping();

  // Filter out only top-level categories (Groups)
  const groupings = categoriesAndGroups.filter(cat => cat.parent_id === null);

  const [name, setName] = useState('');

  const handleAddGrouping = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a valid grouping name.');
      return;
    }
    
    createGrouping(name.trim(), {
      onSuccess: () => setName(''),
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
          title: 'Manage Groupings',
          headerLeft: () => <View />, 
          headerRight: CloseButton,
        }} 
      />
      
      <ScrollView contentContainerStyle={modalStyles.container}>
        
        <Text style={modalStyles.listTitle}>Existing Groupings</Text>
        {loadingGroups ? (
          <ActivityIndicator size="small" color="#e63946" />
        ) : (
          <View>
            {groupings.map(group => (
              <GroupingRow key={group.id} grouping={group} />
            ))}
            {groupings.length === 0 && <Text style={modalStyles.emptyText}>No groupings set up yet.</Text>}
          </View>
        )}
        
        <View style={modalStyles.separator} />

        <Text style={modalStyles.addTitle}>Add New</Text>
        <CustomInput
          label="Name"
          placeholder="e.g. Housing"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <PrimaryButton 
          title={isCreating ? 'Adding...' : 'Add'}
          onPress={handleAddGrouping}
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
});