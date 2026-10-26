import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Switch, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExpenses } from '../../context/ExpenseContext';
import BalanceCard from '../../components/BalanceCard';
import ExpenseForm from '../../components/ExpenseForm';

const CURRENCIES = ['KES', 'USD', 'EUR', 'GBP'];

export default function HomeScreen() {
  const { 
    expenses, 
    addExpense, 
    deleteExpense, 
    theme, 
    currentTheme, 
    toggleTheme, 
    currency, 
    changeCurrency, 
    formatAmount 
  } = useExpenses();

  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Filter expenses safely by title
  const filteredExpenses = (expenses || []).filter((item) =>
    item && item.title && item.title.toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
        <FlatList
          data={filteredExpenses}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 60 }}
          ListHeaderComponent={
            <View>
              {/* Settings Bar */}
              <View style={[styles.settingsBar, { backgroundColor: currentTheme.card }]}>
                
                {/* Updated Theme Toggle with Icons */}
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
              <ExpenseForm onAddExpense={addExpense} />

              <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Expenses</Text>

              {/* Search Input */}
              <TextInput
                style={[
                  styles.searchInput,
                  { 
                    backgroundColor: currentTheme.inputBg, 
                    borderColor: currentTheme.border, 
                    color: currentTheme.text 
                  },
                ]}
                placeholder="Search expenses..."
                placeholderTextColor={currentTheme.subText}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: currentTheme.rowBg }]}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => router.push(`/edit?id=${item.id}`)}
              >
                <View style={styles.rowHeader}>
                  <Text style={[styles.rowTitle, { color: currentTheme.text }]}>{item.title}</Text>
                  <Text style={styles.categoryTag}>{item.category || 'General'}</Text>
                </View>
                <Text style={styles.rowAmount}>- {formatAmount(item.amount)}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteExpense(item.id)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: currentTheme.subText }]}>
              No expenses found.
            </Text>
          }
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
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  searchInput: { 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderRadius: 8, 
    marginBottom: 15, 
    borderWidth: 1, 
    fontSize: 16 
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
  rowTitle: { fontSize: 16, fontWeight: '600' },
  categoryTag: { fontSize: 10, backgroundColor: '#E0E0E0', color: '#555', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  rowAmount: { fontSize: 14, fontWeight: 'bold', color: '#D63031', marginTop: 4 },
  deleteButton: { backgroundColor: '#FF7675', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
  deleteText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 10, marginBottom: 20 },
});