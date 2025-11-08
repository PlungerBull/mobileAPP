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
  useGroups, 
  useCategories, 
  useCreateCategory, 
  useDeleteCategory 
} from '@/hooks/useManagementData'; 
import { Picker } from '@react-native-picker/picker';

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';
import { CategoryRow } from '@/components/list-items/CategoryRow';

export default function ManageCategoriesModal() {
  const router = useRouter();
  // ✅ UPDATED: Use new granular hooks
  const { data: groups = [], isLoading: loadingGroups } = useGroups();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  // ✅ NEW: Get the delete mutation
  const { mutate: deleteCategory } = useDeleteCategory();
  
  // Combine loading states
  const isLoading = loadingGroups || loadingCategories;

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('None');

  const handleAddCategory = () => {
    // ... (This function remains unchanged)
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a valid category name.');
      return;
    }
    const finalParentId = parentId === 'None' ? null : parentId;
    
    createCategory({ name: name.trim(), parentId: finalParentId }, { 
      onSuccess: () => setName(''),
      onError: (e) => Alert.alert('Creation Failed', e.message),
    });
  };
  
// ✅ UPDATED: This function now navigates to the edit modal
const handleEdit = (id: string) => {
  const categoryToEdit = categories.find(c => c.id === id);
  if (categoryToEdit) {
    router.push({
      pathname: '/edit-category',
      params: { item: JSON.stringify(categoryToEdit) }
    });
  }
};

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Category",
      "Are you sure? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteCategory({ id }, {
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
          title: 'Manage Categories',
          headerLeft: () => <View />, 
          headerRight: CloseButton, 
        }} 
      />
      
      <ScrollView contentContainerStyle={modalStyles.container}>
        
        <Text style={modalStyles.listTitle}>Existing Categories</Text>
        {isLoading ? ( // ✅ Use combined loading state
          <ActivityIndicator size="small" color="#e63946" />
        ) : (
          <View>
            {categories.map(cat => (
              <CategoryRow 
                key={cat.id} 
                category={cat} 
                onEdit={handleEdit} 
                onDelete={handleDelete} // ✅ Wired up
              />
            ))}
            {categories.length === 0 && <Text style={modalStyles.emptyText}>No sub-categories set up yet.</Text>}
          </View>
        )}
        
        <View style={modalStyles.separator} />

        <Text style={modalStyles.addTitle}>Add New</Text>
        {/* ... (Add New Form is unchanged, but Picker is populated by `useGroups`) ... */}
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
            <Picker
              selectedValue={parentId as string} 
              onValueChange={(itemValue: string) => 
                setParentId(itemValue)
              }
              style={modalStyles.picker}
            >
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