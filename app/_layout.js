import { Stack } from 'expo-router';
import { ExpenseProvider, useExpenses } from '../context/ExpenseContext';

function RootLayoutNav() {
  const { currentTheme } = useExpenses();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="edit"
        options={{
          headerShown: true,
          title: 'Edit Expense',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: currentTheme.card,
          },
          headerTintColor: currentTheme.text,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ExpenseProvider>
      <RootLayoutNav />
    </ExpenseProvider>
  );
}