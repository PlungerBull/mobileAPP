import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useCategoriesAndGroups, useCreateCategory } from '@/hooks/useManagementData'; 
import { Picker } from '@react-native-picker/picker';

// ✅ Imports from the new component folder
import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';
import { CategoryRow } from '@/components/list-items/CategoryRow';
import { CategoryRow as Category } from '@/types/supabase'; // Import canonical type for filtering

// --- Main Modal Component ---
export default function ManageCategoriesModal() {
  const router = useRouter();
  const { data: categoriesAndGroups = [], isLoading: loadingCats } = useCategoriesAndGroups();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();

  // Separate Groups (for picker) and Categories (for list)
  const groups = categoriesAndGroups.filter((cat: Category) => cat.parent_id === null);
  const categories = categoriesAndGroups.filter((cat: Category) => cat.parent_id !== null);

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string>('None');

  const handleAddCategory = () => {
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
  
  // Placeholder Handlers for List Items
  const handleEdit = (id: string) => console.log('Edit', id);
  const handleDelete = (id: string) => console.log('Delete', id);

  return (
    <View style={modalStyles.safeArea}>
      <Stack.Screen 
        options={{ 
          title: 'Manage Categories',
          headerLeft: () => <View />, 
          headerRight: CloseButton, // ✅ Reusable component
        }} 
      />
      
      <ScrollView contentContainerStyle={modalStyles.container}>
        
        <Text style={modalStyles.listTitle}>Existing Categories</Text>
        {loadingCats ? (
          <ActivityIndicator size="small" color="#e63946" />
        ) : (
          <View>
            {categories.map(cat => (
              <CategoryRow // ✅ Reusable component
                key={cat.id} 
                category={cat} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
              />
            ))}
            {categories.length === 0 && <Text style={modalStyles.emptyText}>No sub-categories set up yet.</Text>}
          </View>
        )}
        
        <View style={modalStyles.separator} />

        <Text style={modalStyles.addTitle}>Add New</Text>
        <CustomInput // ✅ Reusable component
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

        <PrimaryButton // ✅ Reusable component
          title={isCreating ? 'Adding...' : 'Add'}
          onPress={handleAddCategory}
          disabled={isCreating}
        />
      </ScrollView>
    </View>
  );
}
// 🚫 All previous styles and local components are REMOVED.