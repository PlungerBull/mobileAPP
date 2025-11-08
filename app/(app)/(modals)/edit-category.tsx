import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateCategory, useGroups } from '@/hooks/useManagementData'; 
import { CategoryRow as Category } from '@/types/supabase';
import { Picker } from '@react-native-picker/picker';

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';

export default function EditCategoryModal() {
  const router = useRouter();
  const { item } = useLocalSearchParams();
  const category = JSON.parse(item as string) as Category;

  const { data: groups = [] } = useGroups(); // Fetch groups for the picker
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const [name, setName] = useState(category.name);
  const [parentId, setParentId] = useState<string>(category.parent_id || 'None');

  const handleUpdateCategory = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a valid name.');
      return;
    }
    
    updateCategory(
      { 
        id: category.id,
        updates: { 
          name: name.trim(),
          parent_id: parentId === 'None' ? null : parentId
        }
      }, 
      {
        onSuccess: () => router.back(),
        onError: (error) => Alert.alert('Update Failed', error.message),
      }
    );
  };
  
  return (
    <View style={modalStyles.safeArea}>
      <Stack.Screen 
        options={{ 
          title: 'Edit Category/Group',
          headerLeft: () => <View />, 
          headerRight: CloseButton,
        }} 
      />
      <ScrollView contentContainerStyle={modalStyles.container}>
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
              selectedValue={parentId} 
              onValueChange={(itemValue: string) => setParentId(itemValue)}
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
          title={isUpdating ? 'Saving...' : 'Save Changes'}
          onPress={handleUpdateCategory}
          disabled={isUpdating}
        />
      </ScrollView>
    </View>
  );
}