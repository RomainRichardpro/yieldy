import { Tabs } from 'expo-router';
import TabBar from '../../src/components/ui/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={props => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="journal" />
      <Tabs.Screen name="recap" />
      <Tabs.Screen name="renta" />
      <Tabs.Screen name="reglages" />
    </Tabs>
  );
}
