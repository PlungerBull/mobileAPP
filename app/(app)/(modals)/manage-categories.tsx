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
import { useCategoriesAndGroups, useCreateCategory } from '@/hooks/useManagementData'; 
import { Picker } from '@react-native-picker/picker'; // 👈 You may need to install this library

// --- Reusable Components (copied from Groupings modal) ---
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

// --- Component to show an individual existing Category row ---
const CategoryRow = ({ category }: { category: Category }) => (
  <View style={modalStyles.row}>
    <Text style={modalStyles.rowText}>{category.name}</Text>
    <View style={modalStyles.rowActions}>
      <TouchableOpacity onPress={() => console.log('Edit', category.id)} style={{ paddingHorizontal: 10 }}>
        <Ionicons name="create-outline" size={20} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => console.log('Delete', category.id)}>
        <Ionicons name="trash-outline" size={20} color="#e63946" />
      </TouchableOpacity>
    </View>
  </View>
);

// --- Main Modal Component ---
export default function ManageCategoriesModal() {
  const router = useRouter();
  const { data: categoriesAndGroups = [], isLoading: loadingCats } = useCategoriesAndGroups();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();

  // Separate Groups (for picker) and Categories (for list)
  const groups = categoriesAndGroups.filter(cat => cat.parent_id === null);
  const categories = categoriesAndGroups.filter(cat => cat.parent_id !== null);

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('None'); // Must be type string, 'None' is the default value.

  const handleAddCategory = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a valid category name.');
      return;
    }
    // Get the final parent ID: null if 'None' is selected, otherwise the UUID string
    const finalParentId = parentId === 'None' ? null : parentId;
    
    // Pass the name and the final parentId
    createCategory({ name: name.trim(), parentId: finalParentId }, { // Use finalParentId here
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
          title: 'Manage Categories',
          headerLeft: () => <View />, 
          headerRight: CloseButton,
        }} 
      />
      
      <ScrollView contentContainerStyle={modalStyles.container}>
        
        <Text style={modalStyles.listTitle}>Existing Categories</Text>
        {loadingCats ? (
          <ActivityIndicator size="small" color="#e63946" />
        ) : (
          <View>
            {categories.map(cat => (
              <CategoryRow key={cat.id} category={cat} />
            ))}
            {categories.length === 0 && <Text style={modalStyles.emptyText}>No sub-categories set up yet.</Text>}
          </View>
        )}
        
        <View style={modalStyles.separator} />

        <Text style={modalStyles.addTitle}>Add New</Text>
        <CustomInput
          label="Name"
          placeholder="e.g. Groceries"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <View style={modalStyles.inputContainer}>
          <Text style={modalStyles.inputLabel}>Grouping</Text>
          <View style={modalStyles.pickerWrapper}>
            {/* Standard Picker for Grouping selection */}
            <Picker
              // 👇 FIX 2: We must assert the selectedValue is string, which it is, 
              // because we initialized it to 'None'.
              selectedValue={parentId as string} 
              onValueChange={(itemValue: string) => 
                setParentId(itemValue) // Set the state directly to the string value
              }
              style={modalStyles.picker}
            >
              {/* Ensure the value for the top level is the string 'None' */}
              <Picker.Item label="None (Top-Level Group)" value="None" /> 
              {groups.map(group => (
                <Picker.Item key={group.id} label={group.name} value={group.id} />
              ))}
            </Picker>
          </View>
        </View>

        <PrimaryButton 
          title={isCreating ? 'Adding...' : 'Add'}
          onPress={handleAddCategory}
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
  pickerWrapper: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 48,
    width: '100%',
  },
});