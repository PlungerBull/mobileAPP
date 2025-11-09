import React, { ReactNode } from 'react';
import { 
  StyleSheet, 
  View, 
  ViewStyle, 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker, PickerProps } from '@react-native-picker/picker';
import { 
  Button, 
  Input, 
  Icon, 
  Spinner,
  Text,
  InputProps,   // 👈 We will base our CustomInput on this
  ButtonProps 
} from '@ui-kitten/components'; 

// --- SHARED COMPONENTS ---

// Helper component for the Button's loading spinner
const LoadingIndicator = (props: any): React.ReactElement => (
  <View {...props} style={[props.style, modalStyles.loadingIndicator]}>
    <Spinner size='small' status='control' />
  </View>
);

// --- 1. PrimaryButton (Corrected) ---
// Uses UI Kitten's ButtonProps for perfect type compatibility.
interface PrimaryButtonOwnProps {
    title: string;
    isLoading?: boolean;
}
type PrimaryButtonProps = PrimaryButtonOwnProps & ButtonProps;

export const PrimaryButton = ({ 
  title, 
  isLoading = false, 
  style, 
  ...buttonProps 
}: PrimaryButtonProps) => (
  <Button
    style={[modalStyles.button, style]}
    disabled={isLoading || buttonProps.disabled}
    accessoryLeft={isLoading ? LoadingIndicator : undefined}
    {...buttonProps}
  >
    {title}
  </Button>
);

// --- 2. CustomInput (Final Corrected Version) ---
// This version is compatible with both UI Kitten and React Hook Form.

// 1. Get all props from UI Kitten's Input, but OMIT 'onBlur'
//    because its type conflicts with React Hook Form.
type CustomInputUIProps = Omit<InputProps, 'onBlur'>;

interface CustomInputOwnProps { 
  label: string; 
  errorText?: string; 
  containerStyle?: ViewStyle;
  
  // 2. Explicitly add 'onBlur' with the type React Hook Form provides
  onBlur?: () => void; 
}

// 3. Our final props are the (modified) UI Kitten props + our own
type CustomInputProps = CustomInputOwnProps & CustomInputUIProps;

export const CustomInput = ({ 
  label, 
  errorText, 
  containerStyle,
  style, // This 'style' is TextStyle from InputProps
  ...inputProps // All other compatible props
}: CustomInputProps) => (
  <View style={containerStyle}>
    <Input
      style={[modalStyles.input, style]} 
      label={label}
      caption={errorText}
      status={errorText ? 'danger' : 'basic'}
      {...inputProps} // Pass all other props (value, onChangeText, autoCapitalize, etc.)
    />
  </View>
);


// --- 3. CloseButton (Unchanged) ---
const CloseIcon = (props: any) => (
  <Icon {...props} name='close-outline' />
);

export const CloseButton = () => {
    const router = useRouter();
    return (
        <Button
          appearance='ghost'
          status='basic'
          accessoryLeft={CloseIcon}
          onPress={() => router.back()}
        />
    );
}

// --- 4. CustomPicker (Unchanged) ---
interface CustomPickerProps extends PickerProps {
  label: string;
  errorText?: string;
  children: ReactNode;
}
export const CustomPicker = ({ label, errorText, children, ...props }: CustomPickerProps) => (
  <View style={modalStyles.input}>
    <Text category='label' style={modalStyles.inputLabel}>{label}</Text>
    <View style={[modalStyles.pickerWrapper, errorText && modalStyles.pickerError]}>
      <Picker
        style={modalStyles.picker}
        {...props}
      >
        {children}
      </Picker>
    </View>
    {errorText && <Text category='c1' status='danger' style={modalStyles.errorText}>{errorText}</Text>} 
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