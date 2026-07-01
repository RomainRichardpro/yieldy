import { useEffect, useRef } from 'react';
import { Modal, View, Animated, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, radius } from '../../utils/tokens';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  scrollable?: boolean;
}

export default function Sheet({ visible, onClose, children, scrollable = false }: SheetProps) {
  const translateY = useRef(new Animated.Value(800)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: visible ? 0 : 800,
      useNativeDriver: true,
      damping: 20,
      stiffness: 200,
    }).start();
  }, [visible]);

  const Content = scrollable ? ScrollView : View;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <Pressable>
            <View style={styles.grabber} />
          </Pressable>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Pressable>
              <Content
                style={scrollable ? styles.scrollContent : styles.content}
                contentContainerStyle={scrollable ? styles.scrollContentContainer : undefined}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {children}
              </Content>
            </Pressable>
          </KeyboardAvoidingView>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,28,16,0.42)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -20 },
    shadowOpacity: 0.3,
    shadowRadius: 50,
    elevation: 24,
  },
  grabber: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.line,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  scrollContent: {
    maxHeight: '85%',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  scrollContentContainer: {
    paddingBottom: spacing.xxxl,
  },
});
