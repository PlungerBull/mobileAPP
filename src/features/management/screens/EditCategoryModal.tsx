import React from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useUpdateCategory, useGroups } from '@/src/hooks/useManagementData';
import { CategoryRow as Category } from '@/src/types/supabase';
import { Picker } from '@react-native-picker/picker';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EditCategorySchema, EditCategoryFormValues } from '@/src/types/FormSchemas';

import { PrimaryButton, CustomInput, CloseButton, CustomPicker, modalStyles } from '@/src/components/ModalCommon';

export default function EditCategoryModal() {
  const router = useRouter();
  const { item } = useLocalSearchParams();
  const category = JSON.parse(item as string) as Category;

  const { data: groups = [] } = useGroups();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  const { control, handleSubmit, formState: { errors } } = useForm<EditCategoryFormValues>({
    resolver: zodResolver(EditCategorySchema),
    defaultValues: {
      name: category.name,
      parentId: category.parent_id || 'None',
    }
  });

  const handleUpdateCategory = (data: EditCategoryFormValues) => {
    updateCategory(
      { 
        id: category.id,
        updates: { 
          name: data.name.trim(),
          parent_id: data.parentId === 'None' ? null : data.parentId
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
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomInput 
              label="Name"
              placeholder="e.g. Groceries"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              errorText={errors.name?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="parentId"
          render={({ field: { onChange, value } }) => (
            <CustomPicker
              label="Grouping"
              selectedValue={value} 
              onValueChange={onChange}
              errorText={errors.parentId?.message}
            >
              <Picker.Item label="None (Top-Level Group)" value="None" /> 
              {groups.map(group => (
                <Picker.Item key={group.id} label={group.name} value={group.id} />
              ))}
            </CustomPicker>
          )}
        />

        <PrimaryButton 
          title={isUpdating ? 'Saving...' : 'Save Changes'}
          onPress={handleSubmit(handleUpdateCategory)}
          disabled={isUpdating}
        />
      </ScrollView>
    </View>
  );
}