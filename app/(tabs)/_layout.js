import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseStore, THEMES } from '../../store/useExpenseStore';

export default function TabsLayout() {
  const theme = useExpenseStore((state) => state.theme);
  const currentTheme = THEMES[theme] || THEMES.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}