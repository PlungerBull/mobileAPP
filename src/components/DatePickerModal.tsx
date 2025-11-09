import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  title?: string;
}

export const DatePickerModal = ({
  visible,
  onClose,
  selectedDate,
  onDateChange,
  title = 'Select Date',
}: DatePickerModalProps) => {
  const [tempDate, setTempDate] = useState(selectedDate);

  const handleConfirm = () => {
    onDateChange(tempDate);
    onClose();
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      // On Android, the picker auto-closes
      if (event.type === 'set' && date) {
        onDateChange(date);
      }
      onClose();
    } else {
      // On iOS, update temp date
      if (date) {
        setTempDate(date);
      }
    }
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

          {/* Date Picker */}
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              textColor="#000"
            />
          </View>

          {/* Confirm Button (iOS only) */}
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          )}
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
  pickerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  confirmButton: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: '#f39c12',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});