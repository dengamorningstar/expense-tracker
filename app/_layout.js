import { Stack } from 'expo-router';
import { ExpenseProvider } from '../context/ExpenseContext';

export default function RootLayout() {
  return (
    <ExpenseProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="edit"
          options={{
            headerShown: true,
            title: 'Edit Expense',
            presentation: 'modal',
          }}
        />
      </Stack>
    </ExpenseProvider>
  );
}