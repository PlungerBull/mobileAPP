import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { modalStyles } from '@/components/ModalCommon';
import { AccountRow as BankAccount } from '@/types/supabase';

interface AccountRowProps {
    account: BankAccount;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

export const AccountRow = ({ account, onEdit, onDelete }: AccountRowProps) => (
    <View style={modalStyles.row}>
        <Text style={modalStyles.rowText}>{account.name} ({account.currency})</Text>
        <View style={modalStyles.rowActions}>
            <TouchableOpacity onPress={() => onEdit(account.id)} style={{ paddingHorizontal: 10 }}>
                <Ionicons name="create-outline" size={20} color="#666" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(account.id)}>
                <Ionicons name="trash-outline" size={20} color="#e63946" />
            </TouchableOpacity>
        </View>
    </View>
);