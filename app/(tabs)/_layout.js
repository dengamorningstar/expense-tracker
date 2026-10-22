import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useExpenses } from '../../context/ExpenseContext';

export default function TabsLayout() {
  const { currentTheme } = useExpenses();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: currentTheme.card,
        },
        headerTintColor: currentTheme.text,
        tabBarStyle: {
          backgroundColor: currentTheme.card,
          borderTopColor: currentTheme.border,
        },
        tabBarActiveTintColor: currentTheme.accent,
        tabBarInactiveTintColor: currentTheme.subText,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Expenses',
          headerTitle: 'Expense Tracker',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>💳</Text>,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          headerTitle: 'Spending Summary',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📊</Text>,
        }}
      />
    </Tabs>
  );
}