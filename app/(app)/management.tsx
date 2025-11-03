import React, { useMemo } from 'react'; // 👈 ADDED: useMemo hook
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAccounts, useCategoriesAndGroups, useCurrencies } from '@/hooks/useManagementData'; 
import { 
  AccountRow as BankAccount, // 👈 FIX: Use canonical type aliases from supabase
  CategoryRow as Category, 
  CurrencyRow as Currency 
} from '@/types/supabase'; 

// --------------------------------------------------
// --- 1. Define Props Interfaces for Type Safety ---
// --------------------------------------------------

interface SectionActionProps {
  onPress: () => void;
}

// Union type for any entity displayed in the section, using canonical types
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

  // New helper function to safely determine the item's key
  const getItemKey = (item: ManagementEntity, index: number): string => {
    if ('id' in item) {
      return item.id;
    }
    // Only check for 'code' if it's not a BankAccount or Category
    // This safely narrows the type down to Currency (which only has 'code')
    if ('code' in (item as Currency)) { 
      return (item as Currency).code;
    }
    return String(index);
  };
  
  // New helper function to safely determine the item's display name
  const getItemName = (item: ManagementEntity): string => {
      if ('name' in item) {
        return item.name;
      }
      if ('code' in (item as Currency)) {
        return (item as Currency).code;
      }
      return '';
  };
  

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
            
            // ✅ FIXED: Use the helper function to safely calculate the key
            <View key={getItemKey(item, index)} style={styles.listItem}> 
              
              <Text style={styles.listItemText}>
                {/* ✅ FIXED: Use the helper function to safely get the name */}
                {getItemName(item)}
                
                {/* Currency specific tag - Uses proper type narrowing and checks */}
                {('is_main' in item && 'code' in item && item.is_main) && (
                    <Text style={styles.currencyTag}> Main</Text>
                )}
                {/* Category/Grouping Tag (if not a top-level group) */}
                {('parent_id' in item && item.parent_id) && (
                    <Text style={styles.categoryTag}> Sub-Category</Text>
                )}
              </Text>

              <View style={styles.listItemDetails}>
                {/* Display balance and currency for accounts only */}
                {('starting_balance' in item) && (
                  <Text style={{ fontSize: 16 }}>
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
  const router = useRouter(); 

  // ✅ PERFORMANCE OPTIMIZATION: Use useMemo to cache filtered lists.
  const groups: Category[] = useMemo(
    () => categoriesAndGroups.filter((cat: Category) => cat.parent_id === null),
    [categoriesAndGroups]
  );
  
  const categories: Category[] = useMemo(
    () => categoriesAndGroups.filter((cat: Category) => cat.parent_id !== null),
    [categoriesAndGroups]
  );
  
  // Handlers for modal navigation 
  const handleManageAccounts = () => {
    router.push('/manage-accounts'); 
  };
  
  const handleManageGroupings = () => {
    router.push('/manage-groupings'); 
  };
  
  const handleManageCategories = () => {
    router.push('/manage-categories'); 
  };
  
  const handleManageCurrencies = () => {
    router.push('/manage-currencies'); 
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