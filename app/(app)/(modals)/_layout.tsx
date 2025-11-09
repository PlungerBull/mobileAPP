import { Stack, useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CloseButton } from '@/src/components/ModalCommon';

// Custom back button component to match your modal's style
const CustomBackButton = () => {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.back()} hitSlop={10}>
      <Ionicons name="chevron-back" size={28} color="#000" />
    </Pressable>
  );
};

export default function ModalsLayout() {
  return (
    <Stack>
      {/* This is now the single source of truth for modal headers.
        We've copied the header settings from your component files here.
      */}
      <Stack.Screen 
        name="manage-accounts" 
        options={{ 
          presentation: 'modal',
          headerShown: true, // Show the header
          title: 'Manage Accounts', // Set the title
          headerLeft: CustomBackButton, // Add the back button
          headerRight: () => <View />,
        }} 
      />
       <Stack.Screen
        name="manage-categories"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Manage Categories',
          headerLeft: CustomBackButton,
          headerRight: () => <View />,
        }}
      />
       <Stack.Screen 
        name="manage-currencies" 
        options={{ 
          presentation: 'modal', 
          headerShown: true,
          title: 'Manage Currencies',
          headerLeft: CustomBackButton,
          headerRight: () => <View />,
        }} 
      />
       <Stack.Screen 
        name="add-transaction" 
        options={{ 
          presentation: 'modal', 
          headerShown: true, // Use custom header
          title: 'Add Transaction',
          headerLeft: () => <View />, // No back button
          headerRight: CloseButton, // Use the 'X' button
        }} 
      />
    </Stack>
  );
}