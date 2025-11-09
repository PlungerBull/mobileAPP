import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PickerOption {
  label: string;
  value: string;
  isGroup?: boolean;
}

interface BottomSheetPickerProps {
  visible: boolean;
  onClose: () => void;
  options: PickerOption[];
  selectedValue?: string;
  onValueChange: (value: string) => void;
  title: string;
}

export const BottomSheetPicker = ({
  visible,
  onClose,
  options,
  selectedValue,
  onValueChange,
  title,
}: BottomSheetPickerProps) => {
  const handleSelect = (value: string) => {
    onValueChange(value);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.bottomSheet} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Options List */}
          <ScrollView style={styles.optionsList}>
            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  option.isGroup && styles.groupOption,
                  selectedValue === option.value && styles.selectedOption,
                ]}
                onPress={() => handleSelect(option.value)}
              >
                <Text
                  style={[
                    styles.optionText,
                    option.isGroup && styles.groupText,
                    selectedValue === option.value && styles.selectedText,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedValue === option.value && (
                  <Ionicons name="checkmark" size={24} color="#f39c12" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    paddingTop: 150,
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '65%',
    paddingBottom: 20,
    marginTop: 'auto',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  optionsList: {
    maxHeight: '100%',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  groupOption: {
    backgroundColor: '#f8f9fa',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
  },
  groupText: {
    fontWeight: '600',
    color: '#666',
  },
  selectedOption: {
    backgroundColor: '#fef9f0',
  },
  selectedText: {
    color: '#f39c12',
    fontWeight: '600',
  },
});