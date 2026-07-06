import { Pressable, StyleSheet, View } from 'react-native';
import { colors, shadows } from '../../utils/tokens';

interface FABProps {
  onPress: () => void;
}

export default function FAB({ onPress }: FABProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      accessibilityLabel="Nouvelle récolte"
      accessibilityRole="button"
    >
      <View style={styles.icon}>
        {/* Horizontal bar */}
        <View style={[styles.bar, styles.horizontal]} />
        {/* Vertical bar */}
        <View style={[styles.bar, styles.vertical]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 104,
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 30,
    ...shadows.fab,
  },
  pressed: {
    backgroundColor: colors.greenDeep,
    transform: [{ scale: 0.96 }],
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bar: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  horizontal: {
    width: 20,
    height: 2.5,
  },
  vertical: {
    width: 2.5,
    height: 20,
  },
});
