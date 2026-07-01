import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal' }} />
      <Tabs.Screen name="recap" options={{ title: 'Récap' }} />
      <Tabs.Screen name="renta" options={{ title: 'Rentab.' }} />
      <Tabs.Screen name="reglages" options={{ title: 'Réglages' }} />
    </Tabs>
  );
}
