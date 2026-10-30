import { Stack } from 'expo-router';
import { useExpenseStore, THEMES } from '../store/useExpenseStore';

export default function RootLayout() {
  const theme = useExpenseStore((state) => state.theme);
  const currentTheme = THEMES[theme] || THEMES.light;

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