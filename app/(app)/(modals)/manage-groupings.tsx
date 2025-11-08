import React from 'react'; // 👈 REMOVED: useState
import { 
  View, Text, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useGroups, useCreateGrouping, useDeleteCategory } from '@/hooks/useManagementData'; 

// 👈 RHF Imports
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddGroupingSchema, AddGroupingFormValues } from '@/types/FormSchemas';

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/components/ModalCommon';
import { CategoryRow } from '@/components/list-items/CategoryRow';


export default function ManageGroupingsModal() {
  const router = useRouter();
  const { data: groupings = [], isLoading: loadingGroups } = useGroups();
  const { mutate: createGrouping, isPending: isCreating } = useCreateGrouping();
  const { mutate: deleteGrouping } = useDeleteCategory();

  // 👈 REMOVED: useState for name

  // 👈 RHF Setup
  const { control, handleSubmit, reset, formState: { errors } } = useForm<AddGroupingFormValues>({
    resolver: zodResolver(AddGroupingSchema),
    defaultValues: {
      name: '',
    }
  });

  // 👈 RHF Submit Handler
  const handleAddGrouping = (data: AddGroupingFormValues) => {
    createGrouping(data.name.trim(), {
      onSuccess: () => reset(), // 👈 Reset form
      onError: (e) => Alert.alert('Creation Failed', e.message),
    });
  };
  
  const handleEdit = (id: string) => {
    // ... (This function remains unchanged)
    const groupToEdit = groupings.find(g => g.id === id);
    if (groupToEdit) {
      router.push({
        pathname: '/edit-category', 
        params: { item: JSON.stringify(groupToEdit) }
      });
    }
  };

  const handleDelete = (id: string) => {
    // ... (This function remains unchanged)
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
        {/* ... (List rendering logic is unchanged) ... */}
        {loadingGroups ? (
          <ActivityIndicator size="small" color="#e63946" />
        ) : (
          <View>
            {groupings.map(group => (
              <CategoryRow 
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
        
        {/* 👈 Refactored Form */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput 
              label="Name"
              placeholder="e.g. Housing"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              errorText={errors.name?.message}
            />
          )}
        />
        <PrimaryButton 
          title={isCreating ? 'Adding...' : 'Add'}
          onPress={handleSubmit(handleAddGrouping)} // 👈 RHF Submit
          disabled={isCreating}
        />
      </ScrollView>
    </View>
  );
}