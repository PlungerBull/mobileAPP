import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from '@/src/hooks/useManagementData';
import { CategoryRow } from '@/src/types/supabase';

interface CategoryItemProps {
  category: CategoryRow;
  onDelete: (id: string) => void;
  onEdit: (id: string, newName: string) => void;
}

const CategoryItem = ({ category, onDelete, onEdit }: CategoryItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(category.name);

  const handleSave = () => {
    if (editValue.trim() && editValue.trim() !== category.name) {
      onEdit(category.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(category.id),
        },
      ]
    );
  };

  return (
    <View style={styles.categoryItem}>
      {isEditing ? (
        <TextInput
          style={styles.editInput}
          value={editValue}
          onChangeText={setEditValue}
          onBlur={handleSave}
          onSubmitEditing={handleSave}
          autoFocus
          returnKeyType="done"
        />
      ) : (
        <Pressable onPress={() => setIsEditing(true)} style={styles.categoryTextContainer}>
          <Text style={styles.categoryText}>{category.name}</Text>
        </Pressable>
      )}
      <Pressable onPress={handleDelete} hitSlop={10}>
        <Ionicons name="trash-outline" size={22} color="#999" />
      </Pressable>
    </View>
  );
};

export default function ManageCategoriesModal() {
  const router = useRouter();
  const [newCategoryName, setNewCategoryName] = useState('');

  const { data: categories = [], isLoading } = useCategories();
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: deleteCategory } = useDeleteCategory();
  const { mutate: updateCategory } = useUpdateCategory();

  const handleAdd = () => {
    if (!newCategoryName.trim()) return;

    createCategory(
      { name: newCategoryName.trim(), parentId: null },
      {
        onSuccess: () => setNewCategoryName(''),
        onError: (e) => Alert.alert('Error', e.message),
      }
    );
  };

  const handleDelete = (id: string) => {
    deleteCategory(
      { id },
      {
        onError: (e) => Alert.alert('Error', e.message),
      }
    );
  };

  const handleEdit = (id: string, newName: string) => {
    updateCategory(
      {
        id,
        updates: { name: newName, parent_id: null },
      },
      {
        onError: (e) => Alert.alert('Error', e.message),
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Categories List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#f39c12" style={styles.loader} />
        ) : categories.length === 0 ? (
          <Text style={styles.emptyText}>
            No categories yet
          </Text>
        ) : (
          categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))
        )}
      </ScrollView>

      {/* Add New Category */}
      <View style={styles.addContainer}>
        <TextInput
          style={styles.addInput}
          placeholder="New category name"
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <Pressable
          style={[styles.addButton, isCreating && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={isCreating || !newCategoryName.trim()}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Add</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 2,
    borderColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  cancelButton: {
    marginLeft: 10,
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryText: {
    fontSize: 17,
    color: '#1a1a1a',
  },
  editInput: {
    flex: 1,
    fontSize: 17,
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginTop: 40,
  },
  loader: {
    marginTop: 40,
  },
  addContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  addInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#f39c12',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});