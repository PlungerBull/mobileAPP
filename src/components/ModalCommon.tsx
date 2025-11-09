import React, { ReactNode } from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
  Text as RNText,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker, PickerProps } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import {
  Button,
  TextInput,
  ActivityIndicator,
  Text,
  TextInputProps,
  ButtonProps as PaperButtonProps,
} from 'react-native-paper'; 

// --- SHARED COMPONENTS ---

// --- 1. PrimaryButton ---
interface PrimaryButtonOwnProps {
    title: string;
    isLoading?: boolean;
    onPress?: () => void;
    disabled?: boolean;
    style?: any;
}

export const PrimaryButton = ({
  title,
  isLoading = false,
  style,
  onPress,
  disabled,
}: PrimaryButtonOwnProps) => (
  <Button
    mode="contained"
    onPress={onPress}
    disabled={isLoading || disabled}
    loading={isLoading}
    style={[modalStyles.button, style]}
  >
    {title}
  </Button>
);

// --- 2. CustomInput ---
interface CustomInputOwnProps {
  label: string;
  errorText?: string;
  containerStyle?: ViewStyle;
  onBlur?: () => void;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  style?: any;
}

export const CustomInput = ({
  label,
  errorText,
  containerStyle,
  style,
  ...inputProps
}: CustomInputOwnProps) => (
  <View style={containerStyle}>
    <TextInput
      label={label}
      error={!!errorText}
      mode="outlined"
      style={[modalStyles.input, style]}
      {...inputProps}
    />
    {errorText && <Text style={modalStyles.errorText}>{errorText}</Text>}
  </View>
);


// --- 3. CloseButton ---
export const CloseButton = () => {
    const router = useRouter();
    return (
        <Ionicons
          name='close'
          size={28}
          color='#000'
          onPress={() => router.back()}
          style={{ padding: 8 }}
        />
    );
}

// --- 4. CustomPicker ---
interface CustomPickerProps extends PickerProps {
  label: string;
  errorText?: string;
  children: ReactNode;
}
export const CustomPicker = ({ label, errorText, children, ...props }: CustomPickerProps) => (
  <View style={modalStyles.input}>
    <RNText style={modalStyles.inputLabel}>{label}</RNText>
    <View style={[modalStyles.pickerWrapper, errorText && modalStyles.pickerError]}>
      <Picker
        style={modalStyles.picker}
        {...props}
      >
        {children}
      </Picker>
    </View>
    {errorText && <RNText style={[modalStyles.errorText, { color: '#d32f2f' }]}>{errorText}</RNText>}
  </View>
);


// --- 5. SHARED STYLES (Unchanged) ---
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
  separator: { height: 1, backgroundColor: '#f0f0ff', marginVertical: 20 },
  addTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  emptyText: { color: '#999', paddingVertical: 10 },
  
  pickerWrapper: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
  },
  pickerError: {
    borderColor: '#e63946',
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

  button: {
    marginTop: 10,
  },
  input: {
    marginBottom: 15,
  },
  inputLabel: {
    marginBottom: 5, 
  },
  loadingIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    marginTop: 5,
  }
});