import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AuthService } from '@/src/services/AuthService';

interface SettingsItemProps {
  title: string;
  onPress: () => void;
  color?: string;
  showChevron?: boolean;
}

const SettingsItem = ({ title, onPress, color = '#000', showChevron = true }: SettingsItemProps) => (
  <Pressable style={styles.settingsItem} onPress={onPress}>
    <Text style={[styles.settingsText, { color }]}>{title}</Text>
    {showChevron && <Ionicons name="chevron-forward" size={20} color="#999" />}
  </Pressable>
);

export default function ManagementScreen() {
  const router = useRouter();

  const handleManageCategories = () => router.push('/manage-categories');
  const handleManageAccounts = () => router.push('/manage-accounts');
  const handleManageCurrencies = () => router.push('/manage-currencies');

  const handleLogout = async () => {
    const { error } = await AuthService.signOut();
    if (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingsGroup}>
        <SettingsItem title="Manage Categories" onPress={handleManageCategories} />
        <SettingsItem title="Manage Accounts" onPress={handleManageAccounts} />
        <SettingsItem title="Manage Currencies" onPress={handleManageCurrencies} />
        <SettingsItem title="Subscription" onPress={() => {}} />
      </View>

      <View style={styles.logoutContainer}>
        <SettingsItem 
          title="Logout" 
          onPress={handleLogout} 
          color="#e63946" 
          showChevron={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  settingsGroup: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
  },
  settingsText: {
    fontSize: 17,
    fontWeight: '400',
  },
  logoutContainer: {
    marginTop: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});