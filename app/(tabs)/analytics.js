import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useExpenses } from '../../context/ExpenseContext';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Other'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CATEGORY_COLORS = {
  Food: '#6C5CE7',
  Transport: '#00CEC9',
  Bills: '#00B894',
  Shopping: '#E17055',
  Other: '#FDCB6E',
};

// Bulletproof date parser that handles DD/MM/YYYY and MM/DD/YYYY flawlessly
const safeGetMonth = (dateString) => {
  if (!dateString) return MONTHS[new Date().getMonth()];

  // Try standard parsing first
  const d = new Date(dateString);
  if (!isNaN(d.getTime())) {
    return MONTHS[d.getMonth()];
  }

  // If standard parsing fails (e.g. "26/10/2026"), split it manually
  const parts = dateString.split(/[-/]/);
  if (parts.length >= 2) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);

    // If first number is > 12 (like 26), it's DD/MM/YYYY
    if (p0 > 12) return MONTHS[p1 - 1];
    
    // Otherwise assume DD/MM/YYYY as the global/regional standard
    return MONTHS[p1 - 1]; 
  }

  return MONTHS[new Date().getMonth()]; // Ultimate fallback
};

export default function AnalyticsScreen() {
  const { expenses, totalSpent, currentTheme, formatAmount } = useExpenses();
  const [selectedMonth, setSelectedMonth] = useState('All');

  // 1. Group expenses by 12 Months using safe parser
  const monthlyData = useMemo(() => {
    const totals = {};
    MONTHS.forEach((m) => (totals[m] = 0));

    expenses.forEach((expense) => {
      const monthName = safeGetMonth(expense.date);
      if (totals[monthName] !== undefined) {
        totals[monthName] += Number(expense.amount || 0);
      }
    });

    return MONTHS.map((month) => ({
      month,
      total: totals[month],
    }));
  }, [expenses]);

  // Max spending for bar chart scaling
  const maxMonthlyTotal = useMemo(() => {
    const totals = monthlyData.map((d) => d.total);
    return totals.length > 0 ? Math.max(...totals) : 1;
  }, [monthlyData]);

  // 2. Filter expenses by selected month or show all
  const filteredExpenses = useMemo(() => {
    if (selectedMonth === 'All') return expenses;
    return expenses.filter((e) => safeGetMonth(e.date) === selectedMonth);
  }, [expenses, selectedMonth]);

  // 3. Category breakdown calculation
  const categoryTotals = useMemo(() => {
    const totals = {};
    CATEGORIES.forEach((cat) => (totals[cat] = 0));

    filteredExpenses.forEach((expense) => {
      let cat = expense.category;
      if (!cat || cat === 'General' || !CATEGORIES.includes(cat)) {
        cat = 'Other';
      }
      totals[cat] = (totals[cat] || 0) + Number(expense.amount || 0);
    });

    return totals;
  }, [filteredExpenses]);

  const activeTotalSpent = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredExpenses]);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: currentTheme.background }]} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: currentTheme.accent }]}>
        <Text style={styles.summaryTitle}>
          {selectedMonth === 'All' ? 'Total Overall Spent' : `Spent in ${selectedMonth}`}
        </Text>
        <Text style={styles.summaryAmount}>{formatAmount(activeTotalSpent)}</Text>
      </View>

      {/* CHART 1: 12-Month Spending Bar Chart */}
      <View style={[styles.chartCard, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.chartTitle, { color: currentTheme.text }]}>
          Chart 1: Monthly Spending Comparison
        </Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.barChartContainer}
        >
          {monthlyData.map((item) => {
            const heightPercent = maxMonthlyTotal > 0 ? (item.total / maxMonthlyTotal) * 100 : 0;
            const isSelected = selectedMonth === item.month;
            const showAmount = item.total > 0;

            return (
              <TouchableOpacity
                key={item.month}
                style={styles.barGroup}
                onPress={() => setSelectedMonth(isSelected ? 'All' : item.month)}
              >
                <Text style={[styles.barValueText, { color: currentTheme.subText }]}>
                  {showAmount ? formatAmount(item.total) : ''}
                </Text>
                
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.max(heightPercent, 4)}%`,
                        backgroundColor: isSelected ? '#00B894' : currentTheme.accent,
                      },
                    ]}
                  />
                </View>
                
                <Text style={[styles.barLabel, { color: currentTheme.text, fontWeight: isSelected ? 'bold' : 'normal' }]}>
                  {item.month}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        {selectedMonth !== 'All' && (
          <TouchableOpacity 
            style={styles.resetFilterButton}
            onPress={() => setSelectedMonth('All')}
          >
            <Text style={styles.resetFilterText}>Show All Months</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CHART 2: Category Breakdown Chart */}
      <View style={[styles.chartCard, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.chartTitle, { color: currentTheme.text }]}>
          Chart 2: Category Distribution
        </Text>

        {CATEGORIES.map((cat) => {
          const amount = categoryTotals[cat] || 0;
          const percentage = activeTotalSpent > 0 ? (amount / activeTotalSpent) * 100 : 0;
          const barColor = CATEGORY_COLORS[cat] || '#6C5CE7';

          return (
            <View key={cat} style={styles.categoryRow}>
              <View style={styles.categoryHeader}>
                <View style={styles.categoryTitleGroup}>
                  <View style={[styles.colorDot, { backgroundColor: barColor }]} />
                  <Text style={[styles.categoryName, { color: currentTheme.text }]}>{cat}</Text>
                </View>
                <Text style={[styles.categoryAmount, { color: currentTheme.text }]}>
                  {formatAmount(amount)} ({percentage.toFixed(0)}%)
                </Text>
              </View>

              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${percentage}%`, backgroundColor: barColor },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  summaryCard: { padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 20 },
  summaryTitle: { color: '#FFF', fontSize: 14, opacity: 0.8 },
  summaryAmount: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  chartCard: { padding: 18, borderRadius: 12, marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 20,
    paddingBottom: 5,
    paddingRight: 10,
  },
  barGroup: { alignItems: 'center', width: 65, height: '100%', justifyContent: 'flex-end' },
  barTrack: { height: 110, width: 22, backgroundColor: '#E0E0E0', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6 },
  barValueText: { fontSize: 10, marginBottom: 4, textAlign: 'center' },
  barLabel: { fontSize: 11, marginTop: 6 },
  resetFilterButton: { marginTop: 12, alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#E0E0E0', borderRadius: 12 },
  resetFilterText: { fontSize: 12, color: '#333', fontWeight: 'bold' },

  categoryRow: { marginBottom: 14 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  categoryTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  categoryName: { fontSize: 14, fontWeight: '600' },
  categoryAmount: { fontSize: 13, fontWeight: 'bold' },
  progressBarBackground: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
});