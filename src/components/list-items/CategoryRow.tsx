import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { modalStyles } from '@/src/components/ModalCommon';
import { CategoryRow as Category } from '@/src/types/supabase';

interface CategoryRowProps {
    category: Category;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export const CategoryRow = ({ category, onEdit, onDelete }: CategoryRowProps) => (
    <View style={modalStyles.row}>
        <Text style={modalStyles.rowText}>{category.name}</Text>
        <View style={modalStyles.rowActions}>
            <TouchableOpacity onPress={() => onEdit(category.id)} style={{ paddingHorizontal: 10 }}>
                <Ionicons name="create-outline" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(category.id)}>
                <Ionicons name="trash-outline" size={20} color="#e63946" />
            </TouchableOpacity>
        </View>
    </View>
);