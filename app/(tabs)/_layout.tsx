import { Tabs } from 'expo-router';
import TabBar from '../../src/components/ui/TabBar';
import GlobalHarvestSheet from '../../src/components/sheets/GlobalHarvestSheet';

export default function TabsLayout() {
  return (
    <>
      <Tabs tabBar={props => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
        <Tabs.Screen name="journal" options={{ title: 'Journal' }} />
        <Tabs.Screen name="recap" options={{ title: 'Récap' }} />
        <Tabs.Screen name="renta" options={{ title: 'Rentabilité' }} />
        <Tabs.Screen name="reglages" options={{ title: 'Réglages' }} />
      </Tabs>
      <GlobalHarvestSheet />
    </>
  );
}
