import { Stack } from 'expo-router';

// This Stack is dedicated to defining how the screens in the (modals) group
// should be presented when navigated to from the main tabs.
export default function ModalsLayout() {
  return (
    <Stack>
      {/* Set the screen options for all screens in this group */}
      <Stack.Screen 
        name="manage-accounts" 
        options={{ 
          headerShown: false, 
          presentation: 'modal', // Use native modal presentation for iOS
        }} 
      />
       <Stack.Screen
        name="manage-categories"
        options={{
          headerShown: true,
          presentation: 'modal',
          title: 'Manage Categories',
        }}
      />
       <Stack.Screen 
        name="manage-currencies" 
        options={{ 
          headerShown: false, 
          presentation: 'modal', 
        }} 
      />
       {/* ✅ NEW: Add the new transaction modal screen */}
       <Stack.Screen 
        name="add-transaction" 
        options={{ 
          headerShown: false, 
          presentation: 'modal', 
        }} 
      />
    </Stack>
  );
}