import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { supabase } from '../src/lib/supabase';
import { colors, spacing, radius, fontSize, fontWeight } from '../src/utils/tokens';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError('');
    const mail = email.trim().toLowerCase();

    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email: mail, password });
      if (signUpError) { setLoading(false); setError(signUpError.message); return; }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: mail, password });
      setLoading(false);
      if (signInError) setError(signInError.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: mail, password });
      setLoading(false);
      if (error) setError(error.message);
    }
    // Si succès, onAuthStateChange dans _layout.tsx redirige automatiquement
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <Text style={styles.logo}>🌱</Text>
        <Text style={styles.title}>Glean</Text>
        <Text style={styles.subtitle}>Ton journal de récoltes</Text>

        <Text style={styles.label}>Adresse email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="toi@exemple.fr"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          textContentType="emailAddress"
          accessibilityLabel="Adresse email"
        />

        <Text style={styles.label}>Mot de passe</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.muted}
            secureTextEntry={!showPassword}
            textContentType={isSignUp ? 'newPassword' : 'password'}
            accessibilityLabel="Mot de passe"
          />
          <Pressable onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn} accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'} accessibilityRole="button">
            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}

        <Pressable
          style={[styles.btn, (!email.trim() || !password.trim() || loading) && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={!email.trim() || !password.trim() || loading}
          accessibilityRole="button"
          accessibilityLabel={isSignUp ? 'Créer un compte' : 'Se connecter'}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnTxt}>{isSignUp ? 'Créer un compte' : 'Se connecter'}</Text>
          }
        </Pressable>

        <Pressable onPress={() => { setIsSignUp(!isSignUp); setError(''); }} accessibilityRole="button">
          <Text style={styles.toggle}>
            {isSignUp ? 'Déjà un compte ? Se connecter' : 'Pas encore de compte ? Créer un compte'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  inner: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: spacing.sm },
  title: { fontSize: 42, fontWeight: fontWeight.extrabold, color: colors.ink, textAlign: 'center', letterSpacing: -1 },
  subtitle: { fontSize: fontSize.lg, color: colors.muted, textAlign: 'center', marginBottom: spacing.xxxl },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.muted, marginBottom: 8 },
  input: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.inputBorder, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.lg, color: colors.ink, marginBottom: spacing.md },
  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.inputBorder, borderRadius: radius.md, marginBottom: spacing.md },
  passwordInput: { flex: 1, padding: spacing.md, fontSize: fontSize.lg, color: colors.ink },
  eyeBtn: { padding: spacing.md },
  eyeIcon: { fontSize: 18 },
  error: { color: colors.destructive, fontSize: fontSize.sm, marginBottom: spacing.sm },
  btn: { backgroundColor: colors.green, borderRadius: radius.xl, padding: 17, alignItems: 'center', marginBottom: spacing.md },
  btnDisabled: { backgroundColor: '#b9bcae' },
  btnTxt: { color: '#fff', fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  toggle: { fontSize: fontSize.sm, color: colors.green, fontWeight: fontWeight.semibold, textAlign: 'center', marginTop: spacing.sm },
});
