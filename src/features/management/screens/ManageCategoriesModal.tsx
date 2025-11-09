import React from 'react';
import {
  View, Text, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import {
  useCategories, useCreateCategory, useDeleteCategory
} from '@/src/hooks/useManagementData';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddCategorySchema, AddCategoryFormValues } from '@/src/types/FormSchemas';

import { PrimaryButton, CustomInput, CloseButton, modalStyles } from '@/src/components/ModalCommon';
import { CategoryRow } from '@/src/components/list-items/CategoryRow';

export default function ManageCategoriesModal() {
  const router = useRouter();
  const { data: categories = [], isLoading: loadingCategories } = useCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<AddCategoryFormValues>({
    resolver: zodResolver(AddCategorySchema),
    defaultValues: {
      name: '',
    }
  });

  const handleAddCategory = (data: AddCategoryFormValues) => {
    createCategory({ name: data.name.trim(), parentId: null }, {
      onSuccess: () => reset(),
      onError: (e) => Alert.alert('Creation Failed', e.message),
    });
  };
  
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
      "Delete Category", "Are you sure? This cannot be undone.",
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
        {loadingCategories ? (
          <ActivityIndicator size="small" color="#e63946" />
        ) : (
          <View>
            {categories.map(cat => (
              <CategoryRow 
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

        <PrimaryButton 
          title={isCreating ? 'Adding...' : 'Add'}
          onPress={handleSubmit(handleAddCategory)}
          disabled={isCreating}
        />
      </ScrollView>
    </View>
  );
}