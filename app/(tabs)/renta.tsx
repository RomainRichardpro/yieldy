import { View, Text } from 'react-native';
import { colors, fontSize, fontWeight } from '../../src/utils/tokens';

export default function Screen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: fontSize.xl, fontWeight: fontWeight.bold, color: colors.muted }}>À venir</Text>
    </View>
  );
}
