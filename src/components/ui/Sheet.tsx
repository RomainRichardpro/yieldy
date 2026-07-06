import { useEffect, useRef } from 'react';
import { Modal, View, Animated, PanResponder, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions } from 'react-native';
import { colors, spacing } from '../../utils/tokens';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  scrollable?: boolean;
}

export default function Sheet({ visible, onClose, children, scrollable = false }: SheetProps) {
  const translateY = useRef(new Animated.Value(800)).current;
  const pan = useRef(new Animated.Value(0)).current;
  const { height: screenHeight } = useWindowDimensions();
  const sheetHeight = screenHeight * 0.88;

  useEffect(() => {
    if (visible) {
      pan.setValue(0);
      translateY.setValue(800);
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    }
    // Fermeture : le swipe anime via pan, le backdrop est instantané (animationType="none")
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 2,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) pan.setValue(gs.dy);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > 120 || gs.vy > 0.8) {
          Animated.timing(pan, { toValue: 800, duration: 220, useNativeDriver: true }).start(() => {
            onClose();
          });
        } else {
          Animated.spring(pan, { toValue: 0, useNativeDriver: true, damping: 20, stiffness: 300 }).start();
        }
      },
    })
  ).current;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent accessibilityViewIsModal={true}>
      <View style={styles.container}>
        {/* Backdrop — frère de la sheet, pas parent */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessible={false} />
        <Animated.View style={[styles.sheet, { height: sheetHeight, transform: [{ translateY: Animated.add(translateY, pan) }] }]}>
          {/* Zone de drag physiquement grande — le grabberBar n'est que visuel */}
          <View style={styles.dragZone} {...panResponder.panHandlers}>
            <View style={styles.grabberBar} />
          </View>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            {scrollable ? (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </ScrollView>
            ) : (
              <View style={styles.content}>
                {children}
              </View>
            )}
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(20,28,16,0.42)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.3,
    shadowRadius: 50,
    elevation: 24,
  },
  dragZone: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 10,
    paddingHorizontal: 60,
  },
  grabberBar: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.line,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  scrollContentContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
});
