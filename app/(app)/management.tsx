import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAccounts, useCategoriesAndGroups, useCurrencies } from '@/hooks/useManagementData'; 
import { 
  BankAccount, 
  Category, 
  Currency 
} from '@/types/ManagementTypes'; 

// --------------------------------------------------
// --- 1. Define Props Interfaces for Type Safety ---
// --------------------------------------------------

interface SectionActionProps {
  onPress: () => void;
}

// Union type for any entity displayed in the section
type ManagementEntity = BankAccount | Category | Currency;

interface ManagementSectionProps {
  title: string;
  data: ManagementEntity[]; 
  isLoading: boolean;     
  isError: boolean;       
  onActionPress: () => void;
}

// ----------------------------------------------------
// --- 2. Shared Reusable Components with Type Props---
// ----------------------------------------------------

const SectionAction = ({ onPress }: SectionActionProps) => (
  <Pressable onPress={onPress}>
    <Ionicons name="ellipsis-horizontal-circle-outline" size={24} color="#666" />
  </Pressable>
);

const ManagementSection = ({ 
  title, 
  data, 
  isLoading, 
  isError, 
  onActionPress 
}: ManagementSectionProps) => {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <SectionAction onPress={onActionPress} />
      </View>
      
      {/* Loading State */}
      {isLoading && (
        <View style={styles.listArea}>
          <ActivityIndicator size="small" color="#e63946" />
        </View>
      )}

      {/* Error State */}
      {isError && (
        <View style={styles.listArea}>
          <Text style={styles.errorText}>Failed to load {title.toLowerCase()}.</Text>
        </View>
      )}

      {/* Data List (only if not loading/error) */}
      {!isLoading && !isError && (
        <View style={styles.listArea}>
          {data.map((item, index: number) => (
            // Unique key generation logic
            <View key={('id' in item ? item.id : 'code' in item ? item.code : index)} style={styles.listItem}>
              
              <Text style={styles.listItemText}>
                {/* Dynamically display name or code */}
                {('name' in item && item.name) || ('code' in item && item.code)}
                
                {/* Currency specific tag */}
                {('is_main' in item && item.is_main) && (
                    <Text style={styles.currencyTag}> Main</Text>
                )}
                {/* Category/Grouping Tag (if not a top-level group) */}
                {('parent_id' in item && item.parent_id) && (
                    <Text style={styles.categoryTag}> Sub-Category</Text>
                )}
              </Text>

              <View style={styles.listItemDetails}>
                {/* 🎯 FIX: Changed item.currency_code to item.currency */}
                {('starting_balance' in item) && (
                  <Text style={{ fontSize: 16 }}>
                    {/* Assuming currency field is on BankAccount, we use a type check shorthand */}
                    {'currency' in item ? item.currency : ''} {item.starting_balance.toFixed(2)}
                  </Text>
                )}
              </View>
            </View>
          ))}
          {data.length === 0 && <Text style={styles.emptyText}>No items set up.</Text>}
        </View>
      )}
    </View>
  );
};


// ----------------------------
// --- Main Screen Component ---
// ----------------------------

export default function ManagementScreen() {
  // Fetch the data using the decoupled hooks
  const { data: accounts = [], isLoading: loadingAccounts, isError: errorAccounts } = useAccounts();
  const { data: categoriesAndGroups = [], isLoading: loadingCatsAndGroups, isError: errorCatsAndGroups } = useCategoriesAndGroups();
  const { data: currencies = [], isLoading: loadingCurrencies, isError: errorCurrencies } = useCurrencies();
  const router = useRouter(); // 👈 New import

  // 👈 FIX: Explicitly type the 'cat' parameter as 'Category'
  const groups: Category[] = categoriesAndGroups.filter((cat: Category) => cat.parent_id === null);
  const categories: Category[] = categoriesAndGroups.filter((cat: Category) => cat.parent_id !== null);
  
  // Handlers for modal navigation 
  const handleManageAccounts = () => {
    // 👈 Use router to navigate to the new modal file
    router.push('/manage-accounts'); 
  };
  
  const handleManageGroupings = () => {
    router.push('/manage-groupings'); // 👈 NEW
  };
  
  const handleManageCategories = () => {
    router.push('/manage-categories'); // 👈 NEW
  };
  
  const handleManageCurrencies = () => {
    router.push('/manage-currencies'); // 👈 NEW
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <Text style={styles.mainTitle}>Management</Text>

      <ManagementSection 
        title="BANK ACCOUNTS"
        data={accounts as ManagementEntity[]}
        isLoading={loadingAccounts}
        isError={errorAccounts}
        onActionPress={handleManageAccounts}
      />
      
      <ManagementSection 
        title="GROUPINGS"
        // Show only top-level categories (groups)
        data={groups as ManagementEntity[]}
        isLoading={loadingCatsAndGroups} // Use the same loading state for both filtered lists
        isError={errorCatsAndGroups}
        onActionPress={handleManageGroupings}
      />

      <ManagementSection 
        title="CATEGORIES"
        // Show only sub-categories
        data={categories as ManagementEntity[]}
        isLoading={loadingCatsAndGroups}
        isError={errorCatsAndGroups}
        onActionPress={handleManageCategories}
      />
      
      <ManagementSection 
        title="CURRENCIES"
        data={currencies as ManagementEntity[]}
        isLoading={loadingCurrencies}
        isError={errorCurrencies}
        onActionPress={handleManageCurrencies}
      />
      
      <View style={{ height: 100 }} /> 

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333', 
    textTransform: 'uppercase',
  },
  listArea: {
    // Area where the list items are rendered
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },
  listItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyTag: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1a7a40', // Green color
    backgroundColor: '#e6f4ea',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3498db', // Blue color for sub-category
    backgroundColor: '#eaf4fb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  emptyText: {
    color: '#999',
    paddingVertical: 10,
  },
  errorText: {
    color: 'red',
    paddingVertical: 10,
  }
});