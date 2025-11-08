import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native'; // ✅ Added Pressable
import { useRouter } from 'expo-router'; // ✅ Added useRouter
import { Ionicons } from '@expo/vector-icons'; // ✅ Added Ionicons

export default function TransactionsScreen() {
  const router = useRouter(); // ✅ Get the router

  // ✅ Handler to open the new modal
  const handleAddTransaction = () => {
    router.push('/add-transaction');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transactions Ledger</Text>
      <Text>This is where the full list of transactions will go.</Text>

      {/* ✅ NEW: Floating Action Button (FAB) */}
      <Pressable style={styles.fab} onPress={handleAddTransaction}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  // ✅ NEW: Styles for the FAB
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e63946', // Your app's theme color
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});