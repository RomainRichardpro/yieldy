import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { db } from '../src/db/client';
import { initDatabase } from '../src/db/init';
import migrations from '../src/db/migrations/migrations';
import { colors } from '../src/utils/tokens';

export default function RootLayout() {
  const { success, error } = useMigrations(db, migrations);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!success) return;
    initDatabase().then(() => setReady(true));
  }, [success]);

  // Migrations failed — should never happen in prod but helps during dev
  if (error) {
    console.error('Migration error:', error);
  }

  // Show a neutral splash while DB is initializing
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator color={colors.green} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
