import React, { ReactNode } from 'react';
import { 
  Pressable, 
  Text, 
  TextInput, 
  View, 
  StyleSheet, 
  TextInputProps,
  ViewStyle
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Picker, PickerProps } from '@react-native-picker/picker';

// --- SHARED COMPONENTS ---

interface PrimaryButtonProps {
    onPress: () => void;
    title: string;
    disabled?: boolean;
    style?: ViewStyle;
}

export const PrimaryButton = ({ onPress, title, disabled = false, style }: PrimaryButtonProps) => (
  <Pressable 
    style={[modalStyles.button, disabled && modalStyles.buttonDisabled, style]} 
    onPress={onPress} 
    disabled={disabled}
  >
    <Text style={modalStyles.buttonText}>{title}</Text>
  </Pressable>
);

// --- 💡 START FIX ---
// We are changing how these props are defined to be more explicit.

// 1. Define the props unique to CustomInput
interface CustomInputOwnProps { 
  label: string; 
  errorText?: string; 
  containerStyle?: ViewStyle;
}
// 2. Create the final type by intersecting our props with TextInputProps
type CustomInputProps = CustomInputOwnProps & TextInputProps;

// 3. Use the new type and rename ...props to ...textInputProps for clarity
export const CustomInput = ({ 
  label, 
  errorText, 
  containerStyle, 
  ...textInputProps 
}: CustomInputProps) => (
  <View style={[modalStyles.inputContainer, containerStyle]}> 
    <Text style={modalStyles.inputLabel}>{label}</Text>
    {/* 4. Pass the remaining ...textInputProps to the TextInput */}
    <TextInput 
      style={[modalStyles.input, errorText && modalStyles.inputError]} 
      {...textInputProps} 
    />
    {errorText && <Text style={modalStyles.errorText}>{errorText}</Text>} 
  </View>
);

// --- 💡 END FIX ---

export const CloseButton = () => {
    const router = useRouter();
    return (
        <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={24} color="#000" />
        </Pressable>
    );
}

// CustomPicker component (unchanged)
interface CustomPickerProps extends PickerProps {
  label: string;
  errorText?: string;
  children: ReactNode;
}
export const CustomPicker = ({ label, errorText, children, ...props }: CustomPickerProps) => (
  <View style={modalStyles.inputContainer}>
    <Text style={modalStyles.inputLabel}>{label}</Text>
    <View style={[modalStyles.pickerWrapper, errorText && modalStyles.inputError]}>
      <Picker
        style={modalStyles.picker}
        {...props}
      >
        {children}
      </Picker>
    </View>
    {errorText && <Text style={modalStyles.errorText}>{errorText}</Text>} 
  </View>
);

// --- SHARED STYLES ---
// (Styles remain unchanged)
export const modalStyles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20 },
  listTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  row: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowText: { fontSize: 16 },
  rowActions: { flexDirection: 'row', alignItems: 'center' },
  separator: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 20 },
  addTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  inputContainer: { marginBottom: 15 },
  inputLabel: { fontSize: 14, color: '#666', marginBottom: 5 },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  inputError: {
    borderColor: '#e63946',
  },
  button: {
    backgroundColor: '#6200EE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: { backgroundColor: '#B0B0B0' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  emptyText: { color: '#999', paddingVertical: 10 },
  pickerWrapper: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  mainTag: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a7a40', 
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  setMainText: {
    color: '#007AFF',
    fontSize: 15,
  },
  errorText: { 
    color: '#e63946', 
    fontSize: 12, 
    marginTop: 5 
  }
});