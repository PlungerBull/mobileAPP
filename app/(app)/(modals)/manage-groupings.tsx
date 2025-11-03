import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useCategoriesAndGroups, useCreateGrouping } from '@/hooks/useManagementData'; 

// ✅ Imports from the new component folder
import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';
import { CategoryRow } from '@/components/list-items/CategoryRow';


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
  
  // Placeholder Handlers for List Items
  const handleEdit = (id: string) => console.log('Edit', id);
  const handleDelete = (id: string) => console.log('Delete', id);

  return (
    <View style={modalStyles.safeArea}>
      <Stack.Screen 
        options={{ 
          title: 'Manage Groupings',
          headerLeft: () => <View />, 
          headerRight: CloseButton, // ✅ Reusable component
        }} 
      />
      
      <ScrollView contentContainerStyle={modalStyles.container}>
        
        <Text style={modalStyles.listTitle}>Existing Groupings</Text>
        {loadingGroups ? (
          <ActivityIndicator size="small" color="#e63946" />
        ) : (
          <View>
            {groupings.map(group => (
              <CategoryRow // ✅ Reusable component
                key={group.id} 
                category={group} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
              />
            ))}
            {groupings.length === 0 && <Text style={modalStyles.emptyText}>No groupings set up yet.</Text>}
          </View>
        )}
        
        <View style={modalStyles.separator} />

        <Text style={modalStyles.addTitle}>Add New</Text>
        <CustomInput // ✅ Reusable component
          label="Name"
          placeholder="e.g. Housing"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <PrimaryButton // ✅ Reusable component
          title={isCreating ? 'Adding...' : 'Add'}
          onPress={handleAddGrouping}
          disabled={isCreating}
        />
      </ScrollView>
    </View>
  );
}
// 🚫 All previous styles and local components are REMOVED.