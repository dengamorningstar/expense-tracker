import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useExpenses } from '../../context/ExpenseContext';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Other'];

const CATEGORY_COLORS = {
  Food: '#6C5CE7',
  Transport: '#00CEC9',
  Bills: '#00B894',
  Shopping: '#E17055',
  Other: '#FDCB6E',
};

export default function AnalyticsScreen() {
  const { expenses, totalSpent, currentTheme, formatAmount } = useExpenses();
  const [selectedMonth, setSelectedMonth] = useState('All');

  // 1. Group expenses by Month (e.g., "Oct 2026")
  const monthlyData = useMemo(() => {
    const monthlyMap = {};

    expenses.forEach((expense) => {
      let monthKey = 'Recent';
      if (expense.date) {
        const parsedDate = new Date(expense.date);
        if (!isNaN(parsedDate.getTime())) {
          monthKey = parsedDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        }
      }

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = 0;
      }
      monthlyMap[monthKey] += Number(expense.amount || 0);
    });

    return Object.keys(monthlyMap).map((month) => ({
      month,
      total: monthlyMap[month],
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
    return expenses.filter((e) => {
      const parsedDate = new Date(e.date);
      const key = !isNaN(parsedDate.getTime())
        ? parsedDate.toLocaleString('default', { month: 'short', year: '2-digit' })
        : 'Recent';
      return key === selectedMonth;
    });
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

      {/* CHART 1: Monthly Spending Bar Chart */}
      <View style={[styles.chartCard, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.chartTitle, { color: currentTheme.text }]}>
          Chart 1: Monthly Spending Comparison
        </Text>
        
        {monthlyData.length === 0 ? (
          <Text style={[styles.emptyText, { color: currentTheme.subText }]}>
            No monthly data recorded yet.
          </Text>
        ) : (
          <View style={styles.barChartContainer}>
            {monthlyData.map((item) => {
              const heightPercent = (item.total / maxMonthlyTotal) * 100;
              const isSelected = selectedMonth === item.month;

              return (
                <TouchableOpacity
                  key={item.month}
                  style={styles.barGroup}
                  onPress={() => setSelectedMonth(isSelected ? 'All' : item.month)}
                >
                  <Text style={[styles.barValueText, { color: currentTheme.subText }]}>
                    {formatAmount(item.total)}
                  </Text>
                  
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${Math.max(heightPercent, 8)}%`,
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
          </View>
        )}
        
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
  
  // Bar Chart Styling
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
    paddingTop: 20,
    paddingBottom: 5,
  },
  barGroup: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  barTrack: { height: 110, width: 22, backgroundColor: '#E0E0E0', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6 },
  barValueText: { fontSize: 9, marginBottom: 4 },
  barLabel: { fontSize: 11, marginTop: 6 },
  resetFilterButton: { marginTop: 12, alignSelf: 'center', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#E0E0E0', borderRadius: 12 },
  resetFilterText: { fontSize: 12, color: '#333', fontWeight: 'bold' },

  // Category Distribution Styling
  categoryRow: { marginBottom: 14 },
  categoryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  categoryTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  categoryName: { fontSize: 14, fontWeight: '600' },
  categoryAmount: { fontSize: 13, fontWeight: 'bold' },
  progressBarBackground: { height: 8, backgroundColor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  emptyText: { textAlign: 'center', paddingVertical: 20 },
});