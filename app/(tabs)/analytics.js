import React, { useMemo, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseStore, THEMES } from '../../store/useExpenseStore';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Other'];
const TIMEFRAMES = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

const CATEGORY_COLORS = {
  Food: '#6C5CE7',
  Transport: '#00CEC9',
  Bills: '#00B894',
  Shopping: '#E17055',
  Other: '#FDCB6E',
};

const safeParseDate = (dateVal) => {
  if (!dateVal) return new Date();
  if (dateVal instanceof Date && !isNaN(dateVal.getTime())) return dateVal;

  if (typeof dateVal === 'number' || (!isNaN(Number(dateVal)) && !String(dateVal).includes('-') && !String(dateVal).includes('/'))) {
    const d = new Date(Number(dateVal));
    if (!isNaN(d.getTime())) return d;
  }

  const str = String(dateVal).trim();
  const native = new Date(str);
  if (!isNaN(native.getTime())) return native;

  const parts = str.split(/[-/.\sT]/).filter(Boolean);
  if (parts.length >= 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);

    if (!isNaN(p0) && !isNaN(p1) && !isNaN(p2)) {
      if (p0 > 1000) return new Date(p0, p1 - 1, p2);
      if (p2 > 1000) return new Date(p2, p1 - 1, p0);
    }
  }

  return new Date();
};

const formatDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function AnalyticsScreen() {
  // --- ZUSTAND STORE SELECTORS ---
  const expenses = useExpenseStore((state) => state.expenses);
  const theme = useExpenseStore((state) => state.theme);
  const formatAmount = useExpenseStore((state) => state.formatAmount);
  const monthlyBudget = useExpenseStore((state) => state.monthlyBudget);
  const updateMonthlyBudget = useExpenseStore((state) => state.updateMonthlyBudget);
  const currentTheme = THEMES[theme] || THEMES.light;

  const [timeframe, setTimeframe] = useState('Monthly');
  const [selectedBar, setSelectedBar] = useState('All');
  const [offset, setOffset] = useState(0);

  // Budget modal states
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [budgetValue, setBudgetValue] = useState('');

  const parsedExpenses = useMemo(() => {
    return (expenses || []).map((e) => ({
      ...e,
      validDate: safeParseDate(e.date),
      amountNum: Number(e.amount || 0),
    }));
  }, [expenses]);

  const referenceDate = useMemo(() => {
    const now = new Date();
    if (timeframe === 'Daily') {
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset * 7);
    }
    if (timeframe === 'Weekly' || timeframe === 'Monthly') {
      return new Date(now.getFullYear(), now.getMonth() + offset, 1);
    }
    if (timeframe === 'Yearly') {
      return new Date(now.getFullYear() + offset, 0, 1);
    }
    return now;
  }, [timeframe, offset]);

  const navigationLabel = useMemo(() => {
    if (timeframe === 'Daily') {
      const end = new Date(referenceDate);
      const start = new Date(referenceDate);
      start.setDate(end.getDate() - 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (timeframe === 'Weekly' || timeframe === 'Monthly') {
      return referenceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return String(referenceDate.getFullYear());
  }, [timeframe, referenceDate]);

  const timeframeData = useMemo(() => {
    let labels = [];
    let dataMap = {};
    let activeScopeExpenses = [];
    let prevScopeExpenses = [];

    if (timeframe === 'Daily') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate() - i);
        const label = d.toLocaleDateString('default', { weekday: 'short' });
        const key = formatDateKey(d);
        labels.push({ label, key });
        dataMap[key] = 0;
      }

      const prevStart = new Date(referenceDate);
      prevStart.setDate(prevStart.getDate() - 13);
      const prevEnd = new Date(referenceDate);
      prevEnd.setDate(prevEnd.getDate() - 7);

      parsedExpenses.forEach((e) => {
        const key = formatDateKey(e.validDate);
        if (dataMap[key] !== undefined) {
          dataMap[key] += e.amountNum;
          activeScopeExpenses.push({ ...e, _barKey: key });
        } else {
          const eDate = new Date(e.validDate.getFullYear(), e.validDate.getMonth(), e.validDate.getDate()).getTime();
          const pStart = new Date(prevStart.getFullYear(), prevStart.getMonth(), prevStart.getDate()).getTime();
          const pEnd = new Date(prevEnd.getFullYear(), prevEnd.getMonth(), prevEnd.getDate()).getTime();
          if (eDate >= pStart && eDate <= pEnd) {
            prevScopeExpenses.push(e);
          }
        }
      });
    } else if (timeframe === 'Weekly') {
      labels = [
        { label: 'Week 1', key: 'W1' },
        { label: 'Week 2', key: 'W2' },
        { label: 'Week 3', key: 'W3' },
        { label: 'Week 4', key: 'W4' },
        { label: 'Week 5', key: 'W5' },
      ];
      labels.forEach((l) => (dataMap[l.key] = 0));

      parsedExpenses.forEach((e) => {
        if (
          e.validDate.getMonth() === referenceDate.getMonth() &&
          e.validDate.getFullYear() === referenceDate.getFullYear()
        ) {
          const firstDayOfMonth = new Date(e.validDate.getFullYear(), e.validDate.getMonth(), 1).getDay();
          const date = e.validDate.getDate();
          const weekIndex = Math.ceil((date + firstDayOfMonth) / 7) - 1;
          const safeWeekIndex = Math.min(weekIndex, 4);
          
          const key = `W${safeWeekIndex + 1}`;
          dataMap[key] += e.amountNum;
          activeScopeExpenses.push({ ...e, _barKey: key });
        } else if (
          e.validDate.getMonth() === (referenceDate.getMonth() === 0 ? 11 : referenceDate.getMonth() - 1) &&
          e.validDate.getFullYear() === (referenceDate.getMonth() === 0 ? referenceDate.getFullYear() - 1 : referenceDate.getFullYear())
        ) {
          prevScopeExpenses.push(e);
        }
      });
    } else if (timeframe === 'Monthly') {
      const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      labels = MONTHS.map((m) => ({ label: m, key: m }));
      labels.forEach((l) => (dataMap[l.key] = 0));

      parsedExpenses.forEach((e) => {
        if (e.validDate.getFullYear() === referenceDate.getFullYear()) {
          const key = MONTHS[e.validDate.getMonth()];
          dataMap[key] += e.amountNum;
          activeScopeExpenses.push({ ...e, _barKey: key });
        } else if (e.validDate.getFullYear() === referenceDate.getFullYear() - 1) {
          prevScopeExpenses.push(e);
        }
      });
    } else if (timeframe === 'Yearly') {
      const currentYear = referenceDate.getFullYear();
      const yearsSet = new Set(parsedExpenses.map((e) => e.validDate.getFullYear()));
      yearsSet.add(currentYear);
      yearsSet.add(currentYear - 1);
      yearsSet.add(currentYear - 2);
      
      const sortedYears = Array.from(yearsSet).filter((y) => !isNaN(y)).sort((a, b) => a - b);

      labels = sortedYears.map((y) => ({ label: String(y), key: String(y) }));
      labels.forEach((l) => (dataMap[l.key] = 0));

      parsedExpenses.forEach((e) => {
        const key = String(e.validDate.getFullYear());
        if (dataMap[key] !== undefined) {
          dataMap[key] += e.amountNum;
          activeScopeExpenses.push({ ...e, _barKey: key });
        }
      });
    }

    const chartBars = labels.map((l) => ({
      label: l.label,
      key: l.key,
      total: isNaN(dataMap[l.key]) ? 0 : dataMap[l.key],
    }));

    return { chartBars, activeScopeExpenses, prevScopeExpenses };
  }, [parsedExpenses, timeframe, referenceDate]);

  const maxBarTotal = useMemo(() => {
    const totals = timeframeData.chartBars.map((d) => d.total);
    const max = Math.max(...totals, 0);
    return max > 0 ? max : 1;
  }, [timeframeData]);

  const activeCategoryExpenses = useMemo(() => {
    if (selectedBar === 'All') return timeframeData.activeScopeExpenses;
    return timeframeData.activeScopeExpenses.filter((e) => e._barKey === selectedBar);
  }, [timeframeData, selectedBar]);

  const activeTotalSpent = useMemo(() => {
    return activeCategoryExpenses.reduce((sum, item) => sum + item.amountNum, 0);
  }, [activeCategoryExpenses]);

  const popPercentage = useMemo(() => {
    const prevTotal = timeframeData.prevScopeExpenses.reduce((sum, item) => sum + item.amountNum, 0);
    if (prevTotal === 0) return null;
    return ((activeTotalSpent - prevTotal) / prevTotal) * 100;
  }, [activeTotalSpent, timeframeData]);

  const budgetUsagePercent = useMemo(() => {
    if (!monthlyBudget || monthlyBudget <= 0) return 0;
    return Math.min((activeTotalSpent / monthlyBudget) * 100, 100);
  }, [activeTotalSpent, monthlyBudget]);

  const isOverBudget = monthlyBudget > 0 && activeTotalSpent > monthlyBudget;

  const handleSaveBudget = () => {
    const num = parseFloat(budgetValue);
    if (isNaN(num) || num < 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid numeric budget.');
      return;
    }
    updateMonthlyBudget(num);
    setIsBudgetModalOpen(false);
  };

  const kpis = useMemo(() => {
    let daysCount = 7;
    if (timeframe === 'Monthly') daysCount = 30;
    if (timeframe === 'Yearly') daysCount = 365;

    const dailyAvg = activeTotalSpent / daysCount;

    const catMap = {};
    CATEGORIES.forEach((c) => (catMap[c] = 0));
    let highestSingle = null;

    activeCategoryExpenses.forEach((item) => {
      let cat = item.category;
      if (!cat || cat === 'General' || !CATEGORIES.includes(cat)) cat = 'Other';
      catMap[cat] += item.amountNum;

      if (!highestSingle || item.amountNum > highestSingle.amountNum) {
        highestSingle = item;
      }
    });

    let topCat = '-';
    let maxCatVal = 0;
    Object.keys(catMap).forEach((cat) => {
      if (catMap[cat] > maxCatVal) {
        maxCatVal = catMap[cat];
        topCat = cat;
      }
    });

    return {
      categoryTotals: catMap,
      dailyAvg,
      topCat,
      highestSingleAmount: highestSingle ? highestSingle.amountNum : 0,
    };
  }, [activeTotalSpent, activeCategoryExpenses, timeframe]);

  const getBudgetBarColor = () => {
    if (isOverBudget) return '#D63031'; // Red
    if (budgetUsagePercent >= 80) return '#E17055'; // Orange Warning
    return '#00B894'; // Green
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: currentTheme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Timeframe Toggle */}
      <View style={[styles.toggleContainer, { backgroundColor: currentTheme.card }]}>
        {TIMEFRAMES.map((tf) => (
          <TouchableOpacity
            key={tf}
            style={[styles.toggleButton, timeframe === tf && { backgroundColor: currentTheme.accent }]}
            onPress={() => {
              setTimeframe(tf);
              setSelectedBar('All');
              setOffset(0);
            }}
          >
            <Text style={[styles.toggleText, timeframe === tf ? { color: '#FFF' } : { color: currentTheme.text }]}>
              {tf}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Period Navigator */}
      <View style={[styles.navigatorRow, { backgroundColor: currentTheme.card }]}>
        <TouchableOpacity style={styles.navArrow} onPress={() => setOffset((prev) => prev - 1)}>
          <Ionicons name="chevron-back" size={20} color={currentTheme.text} />
        </TouchableOpacity>

        <Text style={[styles.navLabel, { color: currentTheme.text }]}>{navigationLabel}</Text>

        <TouchableOpacity style={styles.navArrow} onPress={() => setOffset((prev) => prev + 1)}>
          <Ionicons name="chevron-forward" size={20} color={currentTheme.text} />
        </TouchableOpacity>
      </View>

      {/* Summary Header Card */}
      <View style={[styles.summaryCard, { backgroundColor: currentTheme.accent }]}>
        <Text style={styles.summaryTitle}>
          {selectedBar !== 'All' ? `Spent in ${selectedBar}` : 'Total Spending'}
        </Text>
        <Text style={styles.summaryAmount}>{formatAmount(activeTotalSpent)}</Text>

        {popPercentage !== null && (
          <View style={[styles.popBadge, { backgroundColor: popPercentage > 0 ? '#FF7675' : '#00B894' }]}>
            <Ionicons name={popPercentage > 0 ? 'arrow-up' : 'arrow-down'} size={12} color="#FFF" />
            <Text style={styles.popBadgeText}>
              {Math.abs(popPercentage).toFixed(1)}% vs previous period
            </Text>
          </View>
        )}
      </View>

      {/* BUDGET CAP PROGRESS CARD */}
      <View style={[styles.budgetCard, { backgroundColor: currentTheme.card }]}>
        <View style={styles.budgetHeader}>
          <View>
            <Text style={[styles.budgetTitle, { color: currentTheme.text }]}>Monthly Budget Cap</Text>
            <Text style={[styles.budgetSubtitle, { color: currentTheme.subText }]}>
              {monthlyBudget > 0
                ? `${formatAmount(activeTotalSpent)} of ${formatAmount(monthlyBudget)} used`
                : 'No monthly cap set'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.editBudgetBtn, { backgroundColor: currentTheme.inputBg }]}
            onPress={() => {
              setBudgetValue(monthlyBudget > 0 ? String(monthlyBudget) : '');
              setIsBudgetModalOpen(true);
            }}
          >
            <Ionicons name="pencil" size={14} color={currentTheme.text} />
            <Text style={[styles.editBudgetBtnText, { color: currentTheme.text }]}>
              {monthlyBudget > 0 ? 'Edit' : 'Set Limit'}
            </Text>
          </TouchableOpacity>
        </View>

        {monthlyBudget > 0 && (
          <>
            <View style={styles.budgetProgressBg}>
              <View
                style={[
                  styles.budgetProgressFill,
                  {
                    width: `${budgetUsagePercent}%`,
                    backgroundColor: getBudgetBarColor(),
                  },
                ]}
              />
            </View>

            {isOverBudget ? (
              <View style={styles.warningBanner}>
                <Ionicons name="warning" size={16} color="#D63031" />
                <Text style={styles.warningText}>
                  Over budget by {formatAmount(activeTotalSpent - monthlyBudget)}!
                </Text>
              </View>
            ) : (
              <Text style={[styles.remainingText, { color: currentTheme.subText }]}>
                {formatAmount(monthlyBudget - activeTotalSpent)} remaining
              </Text>
            )}
          </>
        )}
      </View>

      {/* KPI Cards Grid */}
      <View style={styles.kpiGrid}>
        <View style={[styles.kpiCard, { backgroundColor: currentTheme.card }]}>
          <Text style={[styles.kpiLabel, { color: currentTheme.subText }]}>Daily Avg</Text>
          <Text style={[styles.kpiValue, { color: currentTheme.text }]}>
            {formatAmount(kpis.dailyAvg)}
          </Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: currentTheme.card }]}>
          <Text style={[styles.kpiLabel, { color: currentTheme.subText }]}>Top Category</Text>
          <Text style={[styles.kpiValue, { color: currentTheme.text }]} numberOfLines={1}>
            {kpis.topCat}
          </Text>
        </View>

        <View style={[styles.kpiCard, { backgroundColor: currentTheme.card }]}>
          <Text style={[styles.kpiLabel, { color: currentTheme.subText }]}>Max Expense</Text>
          <Text style={[styles.kpiValue, { color: currentTheme.text }]} numberOfLines={1}>
            {kpis.highestSingleAmount > 0 ? formatAmount(kpis.highestSingleAmount) : '-'}
          </Text>
        </View>
      </View>

      {/* CHART 1: Dynamic Bar Chart */}
      <View style={[styles.chartCard, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.chartTitle, { color: currentTheme.text }]}>{timeframe} Overview</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.barChartContainer}>
          {timeframeData.chartBars.map((item) => {
            const heightPercent = maxBarTotal > 0 && item.total > 0
              ? Math.max(Math.min((item.total / maxBarTotal) * 100, 100), 2)
              : 2;
            const isSelected = selectedBar === item.key;
            const showAmount = item.total > 0;

            return (
              <TouchableOpacity
                key={item.key}
                style={styles.barGroup}
                onPress={() => setSelectedBar(isSelected ? 'All' : item.key)}
              >
                <Text 
                  style={[
                    styles.barValueText, 
                    { color: isSelected ? currentTheme.text : currentTheme.subText, fontWeight: isSelected ? 'bold' : 'normal' }
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {showAmount ? formatAmount(item.total) : ''}
                </Text>

                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor: isSelected ? '#00B894' : currentTheme.accent,
                      },
                    ]}
                  />
                </View>

                <Text style={[styles.barLabel, { color: currentTheme.text, fontWeight: isSelected ? 'bold' : 'normal' }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {selectedBar !== 'All' && (
          <TouchableOpacity style={styles.resetFilterButton} onPress={() => setSelectedBar('All')}>
            <Text style={styles.resetFilterText}>Show All {timeframe}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CHART 2: Category Breakdown */}
      <View style={[styles.chartCard, { backgroundColor: currentTheme.card }]}>
        <Text style={[styles.chartTitle, { color: currentTheme.text }]}>Category Distribution</Text>

        {CATEGORIES.map((cat) => {
          const amount = kpis.categoryTotals[cat] || 0;
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
                <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
              </View>
            </View>
          );
        })}
      </View>

      {/* EDIT BUDGET MODAL */}
      <Modal visible={isBudgetModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: currentTheme.card }]}>
            <Text style={[styles.modalTitle, { color: currentTheme.text }]}>Set Monthly Budget Cap</Text>

            <TextInput
              style={[
                styles.modalInput,
                { 
                  backgroundColor: currentTheme.inputBg, 
                  borderColor: currentTheme.border, 
                  color: currentTheme.text 
                },
              ]}
              placeholder="Enter Target Budget Amount"
              placeholderTextColor={currentTheme.subText}
              keyboardType="numeric"
              value={budgetValue}
              onChangeText={setBudgetValue}
              autoFocus
            />

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#E0E0E0' }]}
                onPress={() => setIsBudgetModalOpen(false)}
              >
                <Text style={{ color: '#333', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: currentTheme.accent }]}
                onPress={handleSaveBudget}
              >
                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 4, borderRadius: 10, marginBottom: 12 },
  toggleButton: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  toggleText: { fontSize: 13, fontWeight: '600' },

  navigatorRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    borderRadius: 10, 
    marginBottom: 15 
  },
  navArrow: { padding: 4 },
  navLabel: { fontSize: 14, fontWeight: 'bold' },

  summaryCard: { padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15 },
  summaryTitle: { color: '#FFF', fontSize: 14, opacity: 0.85 },
  summaryAmount: { color: '#FFF', fontSize: 32, fontWeight: 'bold', marginTop: 4 },

  popBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    paddingVertical: 4, 
    paddingHorizontal: 10, 
    borderRadius: 12, 
    marginTop: 10 
  },
  popBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  budgetCard: { padding: 16, borderRadius: 12, marginBottom: 15 },
  budgetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  budgetTitle: { fontSize: 15, fontWeight: 'bold' },
  budgetSubtitle: { fontSize: 12, marginTop: 2 },
  editBudgetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  editBudgetBtnText: { fontSize: 12, fontWeight: '600' },
  budgetProgressBg: { height: 10, backgroundColor: '#E0E0E0', borderRadius: 5, overflow: 'hidden', marginVertical: 8 },
  budgetProgressFill: { height: '100%', borderRadius: 5 },
  remainingText: { fontSize: 12, fontWeight: '500', textAlign: 'right' },
  warningBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  warningText: { color: '#D63031', fontSize: 12, fontWeight: 'bold' },

  kpiGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 20 },
  kpiCard: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center' },
  kpiLabel: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
  kpiValue: { fontSize: 13, fontWeight: 'bold' },

  chartCard: { padding: 18, borderRadius: 12, marginBottom: 20 },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 15 },

  barChartContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 160, paddingTop: 20, paddingBottom: 5, paddingRight: 10 },
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { width: '100%', padding: 20, borderRadius: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalInput: { borderWidth: 1, padding: 12, borderRadius: 10, fontSize: 16, marginBottom: 20 },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
});