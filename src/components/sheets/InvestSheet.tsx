import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Sheet from '../ui/Sheet';
import { useAppStore } from '../../store/useAppStore';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/tokens';
import type { Invest, InvestType } from '../../types';

interface Props {
  seasonLabel: string;
  onSave: (invest: Invest) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  activeSeason: number;
}

export default function InvestSheet({ seasonLabel, onSave, onDelete, activeSeason }: Props) {
  const { investOpen, investEditId, investForm, closeInvest, setInvestForm } = useAppStore();

  const canSave = investForm.libelle.trim().length > 0 && Number(investForm.montant) > 0;

  async function handleSave() {
    if (!canSave) return;
    await onSave({
      id: investEditId ?? `inv_${Date.now()}`,
      type: investForm.type as InvestType,
      libelle: investForm.libelle.trim(),
      montant: Number(investForm.montant),
      season_id: investForm.type === 'recurrent' ? activeSeason : null,
    });
    closeInvest();
  }

  async function handleDelete() {
    if (!investEditId || !onDelete) return;
    await onDelete(investEditId);
    closeInvest();
  }

  return (
    <Sheet visible={investOpen} onClose={closeInvest}>
      <View style={styles.header}>
        <Text style={styles.title}>{investEditId ? 'Modifier le coût' : 'Nouveau coût'}</Text>
        <Pressable onPress={closeInvest} style={styles.closeBtn} accessibilityLabel="Fermer" accessibilityRole="button">
          <Text style={styles.closeTxt}>✕</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Type de coût</Text>
      <View style={styles.typeRow}>
        {(['initial', 'recurrent'] as InvestType[]).map(t => (
          <Pressable
            key={t}
            onPress={() => setInvestForm({ type: t })}
            style={[styles.typeBtn, investForm.type === t && styles.typeBtnActive]}
            accessibilityRole="radio"
            accessibilityLabel={t === 'initial' ? 'Initial, une seule fois' : 'Récurrent'}
            accessibilityState={{ checked: investForm.type === t }}
          >
            <Text style={[styles.typeTxt, investForm.type === t && styles.typeTxtActive]}>
              {t === 'initial' ? 'Initial (une fois)' : 'Récurrent'}
            </Text>
          </Pressable>
        ))}
      </View>
      {investForm.type === 'recurrent' && (
        <Text style={styles.hint}>Rattaché à la {seasonLabel}</Text>
      )}

      <Text style={styles.label}>Libellé</Text>
      <TextInput
        style={styles.input}
        value={investForm.libelle}
        onChangeText={v => setInvestForm({ libelle: v })}
        placeholder="ex : Construction des bacs"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Libellé du coût"
      />

      <Text style={styles.label}>Montant (€)</Text>
      <TextInput
        style={styles.input}
        value={investForm.montant}
        onChangeText={v => setInvestForm({ montant: v })}
        placeholder="0"
        placeholderTextColor={colors.muted}
        keyboardType="decimal-pad"
        accessibilityLabel="Montant en euros"
      />

      <Pressable onPress={handleSave} style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} accessibilityRole="button" accessibilityLabel="Enregistrer le coût" accessibilityState={{ disabled: !canSave }}>
        <Text style={styles.saveTxt}>Enregistrer</Text>
      </Pressable>

      {investEditId && onDelete && (
        <Pressable onPress={handleDelete} style={styles.deleteBtn} accessibilityRole="button" accessibilityLabel="Supprimer ce coût">
          <Text style={styles.deleteTxt}>Supprimer ce coût</Text>
        </Pressable>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { fontSize: fontSize.h2, fontWeight: fontWeight.bold, color: colors.ink, letterSpacing: -0.5 },
  closeBtn: { backgroundColor: colors.chip, width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  closeTxt: { color: colors.muted, fontSize: 16 },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.muted, marginBottom: 6, marginTop: spacing.md },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.ink },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: { flex: 1, borderWidth: 1.5, borderColor: colors.inputBorder, backgroundColor: colors.card, padding: 12, borderRadius: radius.md, alignItems: 'center' },
  typeBtnActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  typeTxt: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.ink },
  typeTxtActive: { color: colors.green },
  hint: { fontSize: fontSize.sm, color: colors.muted, marginTop: 8 },
  saveBtn: { backgroundColor: colors.green, borderRadius: radius.xl, padding: 17, alignItems: 'center', marginTop: spacing.xl },
  saveBtnDisabled: { backgroundColor: '#b9bcae' },
  saveTxt: { color: '#fff', fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  deleteBtn: { alignItems: 'center', padding: spacing.md, marginTop: 6 },
  deleteTxt: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.destructive },
});
