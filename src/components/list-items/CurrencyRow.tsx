import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { modalStyles } from '@/src/components/ModalCommon';
import { CurrencyRow as Currency } from '@/src/types/supabase';

interface CurrencyRowProps {
    currency: Currency;
    onSetMain: (code: string) => void;
    onEdit: (code: string) => void;
    onDelete: (code: string) => void;
}

export const CurrencyRow = ({ currency, onSetMain, onEdit, onDelete }: CurrencyRowProps) => (
  <View style={modalStyles.row}>
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={modalStyles.rowText}>{currency.code}</Text>
      {currency.is_main && <Text style={modalStyles.mainTag}>Main</Text>}
    </View>
    <View style={modalStyles.rowActions}>
      {!currency.is_main && (
          <TouchableOpacity onPress={() => onSetMain(currency.code)} style={{ paddingHorizontal: 10 }}>
            <Text style={modalStyles.setMainText}>Set as Main</Text>
          </TouchableOpacity>
      )}
      <TouchableOpacity onPress={() => onEdit(currency.code)} style={{ paddingHorizontal: 10 }}>
        <Ionicons name="create-outline" size={20} color="#666" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(currency.code)}>
        <Ionicons name="trash-outline" size={20} color="#e63946" />
      </TouchableOpacity>
    </View>
  </View>
);