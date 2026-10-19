import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useExpenses } from '../../context/ExpenseContext';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'General'];

export default function AnalyticsScreen() {
  const { expenses, totalSpent } = useExpenses();

  // Optimize heavy array aggregation using useMemo
  const categoryTotals = useMemo(() => {
    const totals = {};
    CATEGORIES.forEach((cat) => (totals[cat] = 0));

    expenses.forEach((expense) => {
      const cat = expense.category || 'General';
      totals[cat] = (totals[cat] || 0) + expense.amount;
    });

    return totals;
  }, [expenses]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Total Spent</Text>
        <Text style={styles.summaryAmount}>KES {totalSpent.toFixed(2)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Category Breakdown</Text>

      {CATEGORIES.map((cat) => {
        const amount = categoryTotals[cat] || 0;
        const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;

        return (
          <View key={cat} style={styles.categoryCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryName}>{cat}</Text>
              <Text style={styles.categoryAmount}>
                KES {amount.toFixed(2)} ({percentage.toFixed(0)}%)
              </Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${percentage}%` }]} />
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA', padding: 20 },
  summaryCard: {
    backgroundColor: '#6C5CE7',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 25,
  },
  summaryTitle: { color: '#FFF', fontSize: 16, opacity: 0.8 },
  summaryAmount: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  categoryCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categoryName: { fontSize: 15, fontWeight: '600', color: '#333' },
  categoryAmount: { fontSize: 14, fontWeight: 'bold', color: '#6C5CE7' },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00B894',
    borderRadius: 4,
  },
});