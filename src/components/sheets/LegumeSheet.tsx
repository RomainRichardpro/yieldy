import { View, Text, TextInput, Pressable, StyleSheet, AccessibilityInfo } from 'react-native';
import Sheet from '../ui/Sheet';
import { useAppStore } from '../../store/useAppStore';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/tokens';
import { initial } from '../../utils/format';
import type { Legume, Unite } from '../../types';

const UNITES: Unite[] = ['pièce', 'kg', '100g', 'botte', 'bouquet'];
const SWATCHES = ['#5a8f3c','#c2403a','#6d4a8f','#d98a2b','#d2596b','#3f8f5a','#e0b53c','#3d7a8f','#9a7b3c','#b5472f'];

interface Props {
  onSave: (legume: Omit<Legume, 'maj'>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function LegumeSheet({ onSave, onDelete }: Props) {
  const { legumeOpen, legumeEditId, legumeForm, closeLegume, setLegumeForm, onLegumeNom } = useAppStore();

  const canSave = legumeForm.nom.trim().length > 0 && Number(legumeForm.prix) > 0;

  async function handleSave() {
    if (!canSave) return;
    await onSave({
      id: legumeEditId ?? `leg_${Date.now()}`,
      nom: legumeForm.nom.trim(),
      prix: Number(legumeForm.prix),
      unite: legumeForm.unite as Unite,
      source: legumeForm.source.trim() || null,
      color: legumeForm.color,
    });
    AccessibilityInfo.announceForAccessibility('Légume enregistré');
    closeLegume();
  }

  async function handleDelete() {
    if (!legumeEditId || !onDelete) return;
    await onDelete(legumeEditId);
    AccessibilityInfo.announceForAccessibility('Légume supprimé');
    closeLegume();
  }

  return (
    <Sheet visible={legumeOpen} onClose={closeLegume} scrollable>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{legumeEditId ? 'Modifier le légume' : 'Nouveau légume'}</Text>
        <Pressable onPress={closeLegume} style={({ focused }) => [styles.closeBtn, focused && { borderColor: colors.green, borderWidth: 2 }]} accessibilityLabel="Fermer" accessibilityRole="button">
          <Text style={styles.closeTxt}>✕</Text>
        </Pressable>
      </View>

      {/* Nom */}
      <Text style={styles.label}>Nom du légume</Text>
      <TextInput
        style={styles.input}
        value={legumeForm.nom}
        onChangeText={onLegumeNom}
        placeholder="ex : Haricot vert"
        placeholderTextColor={colors.muted}
        textContentType="none"
        accessibilityLabel="Nom du légume"
      />

      {/* Prix */}
      <Text style={styles.label}>Prix de référence (€)</Text>
      <TextInput
        style={styles.input}
        value={legumeForm.prix}
        onChangeText={v => setLegumeForm({ prix: v })}
        placeholder="0,00"
        placeholderTextColor={colors.muted}
        keyboardType="decimal-pad"
        textContentType="none"
        accessibilityLabel="Prix de référence en euros"
      />

      {/* Unité */}
      <Text style={styles.label}>Unité</Text>
      <View style={styles.chips}>
        {UNITES.map(u => (
          <Pressable
            key={u}
            onPress={() => setLegumeForm({ unite: u })}
            style={[styles.chip, legumeForm.unite === u && styles.chipActive]}
            accessibilityRole="radio"
            accessibilityLabel={u}
            accessibilityState={{ checked: legumeForm.unite === u }}
          >
            <Text style={[styles.chipTxt, legumeForm.unite === u && styles.chipTxtActive]}>{u}</Text>
          </Pressable>
        ))}
      </View>

      {/* Couleur */}
      <Text style={styles.label}>Couleur</Text>
      <View style={styles.colorRow}>
        <View style={[styles.preview, { backgroundColor: legumeForm.color }]}>
          <Text style={styles.previewTxt}>{initial(legumeForm.nom) || '?'}</Text>
        </View>
        <View style={styles.swatches}>
          {SWATCHES.map(c => (
            <Pressable
              key={c}
              onPress={() => setLegumeForm({ color: c, colorTouched: true })}
              style={[styles.swatch, { backgroundColor: c }, legumeForm.color === c && styles.swatchActive]}
              accessibilityRole="radio"
              accessibilityLabel={`Couleur ${c}`}
              accessibilityState={{ checked: legumeForm.color === c }}
            />
          ))}
        </View>
      </View>

      {/* Source */}
      <Text style={styles.label}>Source du prix</Text>
      <TextInput
        style={styles.input}
        value={legumeForm.source}
        onChangeText={v => setLegumeForm({ source: v })}
        placeholder="ex : Leclerc"
        placeholderTextColor={colors.muted}
        textContentType="organizationName"
        accessibilityLabel="Source du prix"
      />

      {/* Actions */}
      <Pressable onPress={handleSave} style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} accessibilityRole="button" accessibilityLabel="Enregistrer le légume" accessibilityState={{ disabled: !canSave }} accessibilityHint={!canSave ? 'Renseigne le nom et le prix pour valider' : undefined}>
        <Text style={styles.saveTxt}>Enregistrer</Text>
      </Pressable>

      {legumeEditId && onDelete && (
        <Pressable onPress={handleDelete} style={styles.deleteBtn} accessibilityRole="button" accessibilityLabel="Supprimer ce légume">
          <Text style={styles.deleteTxt}>Supprimer ce légume</Text>
        </Pressable>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { fontSize: fontSize.h2, fontWeight: fontWeight.bold, color: colors.ink, letterSpacing: -0.5 },
  closeBtn: { backgroundColor: colors.chip, width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.inputBorder },
  closeTxt: { color: colors.muted, fontSize: 16 },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.muted, marginBottom: 6, marginTop: spacing.md },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1.5, borderColor: colors.inputBorder, backgroundColor: colors.card, paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.md },
  chipActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  chipTxt: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.ink },
  chipTxtActive: { color: colors.green },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  preview: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  previewTxt: { color: '#fff', fontWeight: fontWeight.bold, fontSize: 21 },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, flex: 1 },
  swatch: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: colors.ink },
  saveBtn: { backgroundColor: colors.green, borderRadius: radius.xl, padding: 17, alignItems: 'center', marginTop: spacing.xl },
  saveBtnDisabled: { backgroundColor: '#b9bcae' },
  saveTxt: { color: '#fff', fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  deleteBtn: { alignItems: 'center', padding: spacing.md, marginTop: 6 },
  deleteTxt: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.destructive },
});
