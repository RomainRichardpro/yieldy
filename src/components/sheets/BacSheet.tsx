import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Sheet from '../ui/Sheet';
import { useAppStore } from '../../store/useAppStore';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/tokens';
import { initial } from '../../utils/format';
import type { Bac, Legume } from '../../types';

interface Props {
  seasonLegumes: Legume[];
  onSave: (bac: Bac) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export default function BacSheet({ seasonLegumes, onSave, onDelete }: Props) {
  const { bacOpen, bacEditId, bacForm, closeBac, setBacForm, toggleBacContenu } = useAppStore();

  const canSave = bacForm.nom.trim().length > 0;

  async function handleSave() {
    if (!canSave) return;
    await onSave({
      id: bacEditId ?? `bac_${Date.now()}`,
      nom: bacForm.nom.trim(),
      larg: Number(bacForm.larg) || 0,
      long: Number(bacForm.long) || 0,
      contenu: bacForm.contenu,
    });
    closeBac();
  }

  async function handleDelete() {
    if (!bacEditId || !onDelete) return;
    await onDelete(bacEditId);
    closeBac();
  }

  return (
    <Sheet visible={bacOpen} onClose={closeBac} scrollable>
      <View style={styles.header}>
        <Text style={styles.title}>{bacEditId ? 'Modifier le bac' : 'Nouveau bac'}</Text>
        <Pressable onPress={closeBac} style={styles.closeBtn} accessibilityLabel="Fermer" accessibilityRole="button">
          <Text style={styles.closeTxt}>✕</Text>
        </Pressable>
      </View>

      <Text style={styles.label}>Nom du bac</Text>
      <TextInput
        style={styles.input}
        value={bacForm.nom}
        onChangeText={v => setBacForm({ nom: v })}
        placeholder="ex : Bac surélevé sud"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Nom du bac"
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Largeur (cm)</Text>
          <TextInput
            style={styles.input}
            value={bacForm.larg}
            onChangeText={v => setBacForm({ larg: v })}
            placeholder="—"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            accessibilityLabel="Largeur en centimètres"
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Longueur (cm)</Text>
          <TextInput
            style={styles.input}
            value={bacForm.long}
            onChangeText={v => setBacForm({ long: v })}
            placeholder="—"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
            accessibilityLabel="Longueur en centimètres"
          />
        </View>
      </View>

      {seasonLegumes.length > 0 && (
        <>
          <Text style={styles.label}>Ce qu'il y a dedans</Text>
          <View style={styles.chips}>
            {seasonLegumes.map(l => {
              const on = bacForm.contenu.includes(l.id);
              return (
                <Pressable
                  key={l.id}
                  onPress={() => toggleBacContenu(l.id)}
                  style={[styles.chip, on && styles.chipActive]}
                  accessibilityRole="checkbox"
                  accessibilityLabel={l.nom}
                  accessibilityState={{ checked: on }}
                >
                  <View style={[styles.dot, { backgroundColor: l.color }]}>
                    <Text style={styles.dotTxt}>{initial(l.nom)}</Text>
                  </View>
                  <Text style={[styles.chipTxt, on && styles.chipTxtActive]}>{l.nom}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <Pressable onPress={handleSave} style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} accessibilityRole="button" accessibilityLabel="Enregistrer le bac" accessibilityState={{ disabled: !canSave }}>
        <Text style={styles.saveTxt}>Enregistrer</Text>
      </Pressable>

      {bacEditId && onDelete && (
        <Pressable onPress={handleDelete} style={styles.deleteBtn} accessibilityRole="button" accessibilityLabel="Supprimer ce bac">
          <Text style={styles.deleteTxt}>Supprimer ce bac</Text>
        </Pressable>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  title: { fontSize: fontSize.h2, fontWeight: fontWeight.bold, color: colors.ink, letterSpacing: -0.5 },
  closeBtn: { backgroundColor: colors.chip, width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.inputBorder },
  closeTxt: { color: colors.muted, fontSize: 16 },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.muted, marginBottom: 6, marginTop: spacing.md },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.ink },
  row: { flexDirection: 'row', gap: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.inputBorder, backgroundColor: colors.card, paddingRight: 13, paddingLeft: 9, paddingVertical: 8, borderRadius: 14 },
  chipActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  dot: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  dotTxt: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
  chipTxt: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.ink },
  chipTxtActive: { color: colors.green },
  saveBtn: { backgroundColor: colors.green, borderRadius: radius.xl, padding: 17, alignItems: 'center', marginTop: spacing.xl },
  saveBtnDisabled: { backgroundColor: '#b9bcae' },
  saveTxt: { color: '#fff', fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  deleteBtn: { alignItems: 'center', padding: spacing.md, marginTop: 6 },
  deleteTxt: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.destructive },
});
