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
import { useGroups, useCreateGrouping, useDeleteCategory } from '@/hooks/useManagementData'; 

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';
import { CategoryRow } from '@/components/list-items/CategoryRow';


export default function ManageGroupingsModal() {
  const router = useRouter();
  // ✅ UPDATED: Use the new granular hook
  const { data: groupings = [], isLoading: loadingGroups } = useGroups();
  const { mutate: createGrouping, isPending: isCreating } = useCreateGrouping();
  // ✅ NEW: Get the delete mutation (it's the same one for categories and groups)
  const { mutate: deleteGrouping } = useDeleteCategory();

  const [name, setName] = useState('');

  const handleAddGrouping = () => {
    // ... (This function remains unchanged)
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a valid grouping name.');
      return;
    }
    createGrouping(name.trim(), {
      onSuccess: () => setName(''),
      onError: (e) => Alert.alert('Creation Failed', e.message),
    });
  };
  
// ✅ UPDATED: This function now navigates to the edit modal
const handleEdit = (id: string) => {
  const groupToEdit = groupings.find(g => g.id === id);
  if (groupToEdit) {
    router.push({
      pathname: '/edit-category', // Re-uses the category edit screen
      params: { item: JSON.stringify(groupToEdit) }
    });
  }
};

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Grouping",
      "Are you sure? This may also affect sub-categories.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteGrouping({ id }, {
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
              <CategoryRow 
                key={group.id} 
                category={group} 
                onEdit={handleEdit} 
                onDelete={handleDelete} // ✅ Wired up
              />
            ))}
            {groupings.length === 0 && <Text style={modalStyles.emptyText}>No groupings set up yet.</Text>}
          </View>
        )}
        
        <View style={modalStyles.separator} />

        {/* ... (Add New Form remains unchanged) ... */}
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