import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ReportScreen() { // You can even rename this
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Screen</Text>
      <Text>This is where the financial summary dashboard will go.</Text>
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