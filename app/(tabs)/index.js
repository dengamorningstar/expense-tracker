import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Switch, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseStore, THEMES } from '../../store/useExpenseStore';
import BalanceCard from '../../components/BalanceCard';
import ExpenseForm from '../../components/ExpenseForm';

const CURRENCIES = ['KES', 'USD', 'EUR', 'GBP'];
const FILTER_CATEGORIES = ['All', 'Food', 'Transport', 'Bills', 'Shopping', 'Other'];

// Helper to safely extract string title
const extractTitle = (item) => {
  if (!item) return 'Expense';
  if (typeof item.title === 'object' && item.title !== null) {
    return item.title.title || 'Expense';
  }
  return String(item.title || 'Expense');
};

// Helper to safely extract numeric amount
const extractAmount = (item) => {
  if (!item) return 0;
  if (typeof item.title === 'object' && item.title !== null && item.title.amount) {
    return Number(item.title.amount);
  }
  return Number(item.amount || 0);
};

// Format timestamps into clean relative labels ("Today", "Yesterday", "Oct 27")
const formatRecentDate = (rawDate) => {
  if (!rawDate) return '';
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  if (d.toDateString() === now.toDateString()) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function HomeScreen() {
  // Zustand Store Selectors
  const expenses = useExpenseStore((state) => state.expenses);
  const addExpense = useExpenseStore((state) => state.addExpense);
  const deleteExpense = useExpenseStore((state) => state.deleteExpense);
  const theme = useExpenseStore((state) => state.theme);
  const toggleTheme = useExpenseStore((state) => state.toggleTheme);
  const currency = useExpenseStore((state) => state.currency);
  const changeCurrency = useExpenseStore((state) => state.changeCurrency);
  const formatAmount = useExpenseStore((state) => state.formatAmount);
  
  // Safe Theme Access
  const currentTheme = THEMES[theme] || THEMES.light;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const router = useRouter();

  // 1. Sort expenses so newest items appear at the very top
  const sortedExpenses = useMemo(() => {
    return [...(expenses || [])].sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });
  }, [expenses]);

  // 2. Filter sorted expenses by search query AND selected category
  const filteredExpenses = useMemo(() => {
    return sortedExpenses.filter((item) => {
      if (!item) return false;

      // Extract and normalize category
      const displayCategory = (!item.category || item.category === 'General') ? 'Other' : item.category;
      const matchesCategory = selectedCategory === 'All' || displayCategory === selectedCategory;

      // Extract and normalize title search
      const titleString = extractTitle(item).toLowerCase();
      const query = String(searchQuery || '').toLowerCase();
      const matchesSearch = titleString.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [sortedExpenses, searchQuery, selectedCategory]);

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 90 }}
          ListHeaderComponent={
            <View>
              {/* Settings Bar */}
              <View style={[styles.settingsBar, { backgroundColor: currentTheme.card }]}>
                <View style={styles.themeToggle}>
                  <Ionicons 
                    name={theme === 'dark' ? 'moon' : 'sunny'} 
                    size={18} 
                    color={currentTheme.text} 
                  />
                  <Text style={[styles.settingLabel, { color: currentTheme.text }]}>
                    {theme === 'dark' ? 'Dark' : 'Light'}
                  </Text>
                  <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
                </View>

                <View style={styles.currencyContainer}>
                  {CURRENCIES.map((cur) => (
                    <TouchableOpacity
                      key={cur}
                      style={[
                        styles.currencyBadge,
                        currency === cur && { backgroundColor: currentTheme.accent },
                      ]}
                      onPress={() => changeCurrency(cur)}
                    >
                      <Text style={[styles.currencyText, currency === cur && { color: '#FFF' }]}>
                        {cur}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <BalanceCard />

              {/* Section Header */}
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Recent Transactions</Text>
                <Text style={[styles.itemCountText, { color: currentTheme.subText }]}>
                  {filteredExpenses.length} {filteredExpenses.length === 1 ? 'item' : 'items'}
                </Text>
              </View>

              {/* Search Box */}
              <TextInput
                style={[
                  styles.searchInput,
                  { 
                    backgroundColor: currentTheme.inputBg, 
                    borderColor: currentTheme.border, 
                    color: currentTheme.text 
                  },
                ]}
                placeholder="Search transactions..."
                placeholderTextColor={currentTheme.subText}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />

              {/* Horizontal Category Filter Pills */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.filterScrollContainer}
              >
                {FILTER_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.filterPill,
                        { backgroundColor: isSelected ? currentTheme.accent : currentTheme.card },
                        isSelected && styles.activePillShadow,
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.filterPillText,
                          { color: isSelected ? '#FFFFFF' : currentTheme.text },
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          }
          renderItem={({ item }) => {
            const displayTitle = extractTitle(item);
            const displayAmount = extractAmount(item);
            const displayCategory = (!item.category || item.category === 'General') ? 'Other' : item.category;
            const displayDate = formatRecentDate(item.date);

            return (
              <View style={[styles.row, { backgroundColor: currentTheme.rowBg }]}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => router.push(`/edit?id=${item.id}`)}
                >
                  <View style={styles.rowHeader}>
                    <Text style={[styles.rowTitle, { color: currentTheme.text }]}>{displayTitle}</Text>
                    <Text style={styles.categoryTag}>{displayCategory}</Text>
                  </View>
                  <View style={styles.rowSubHeader}>
                    <Text style={styles.rowAmount}>{formatAmount(displayAmount)}</Text>
                    {displayDate ? (
                      <Text style={[styles.dateSubtitle, { color: currentTheme.subText }]}>
                        • {displayDate}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteExpense(item.id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: currentTheme.subText }]}>
              No transactions found.
            </Text>
          }
        />

        {/* Floating Action Button (FAB) */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: currentTheme.accent }]}
          onPress={() => setIsFormOpen(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Modal Form Sheet */}
        <ExpenseForm
          visible={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onAddExpense={addExpense}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  settingsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  themeToggle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingLabel: { fontSize: 13, fontWeight: 'bold' },
  currencyContainer: { flexDirection: 'row', gap: 4 },
  currencyBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, backgroundColor: '#E0E0E0' },
  currencyText: { fontSize: 11, fontWeight: 'bold', color: '#333' },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  itemCountText: { fontSize: 13, fontWeight: '600' },
  searchInput: { 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderRadius: 8, 
    marginBottom: 12, 
    borderWidth: 1, 
    fontSize: 16 
  },
  filterScrollContainer: { flexDirection: 'row', gap: 8, paddingBottom: 15 },
  filterPill: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillText: { fontSize: 13, fontWeight: '600' },
  activePillShadow: {
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 10 
  },
  rowHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowSubHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  rowTitle: { fontSize: 16, fontWeight: '600' },
  categoryTag: { fontSize: 10, backgroundColor: '#E0E0E0', color: '#555', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  rowAmount: { fontSize: 14, fontWeight: 'bold', color: '#D63031' },
  dateSubtitle: { fontSize: 12, fontWeight: '500' },
  deleteButton: { backgroundColor: '#FF7675', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  deleteText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 20, marginBottom: 20 },
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
});