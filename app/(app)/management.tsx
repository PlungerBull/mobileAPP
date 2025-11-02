import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ManagementScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Management Hub</Text>
      <Text>Bank Accounts, Groupings, etc. will live here.</Text>
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
});