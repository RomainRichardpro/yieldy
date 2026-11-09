import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, AccessibilityInfo } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Sheet from '../ui/Sheet';
import { useAppStore } from '../../store/useAppStore';
import { colors, spacing, radius, fontSize, fontWeight } from '../../utils/tokens';
import { fmt, initial, longDate, valeurRecolte } from '../../utils/format';
import type { Harvest, Legume, Bac } from '../../types';

interface Props {
  seasonLegumes: Legume[];
  bacs: Bac[];
  onSave: (h: Harvest) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  activeSeason: number;
}

export default function HarvestSheet({ seasonLegumes, bacs, onSave, onDelete, activeSeason }: Props) {
  const { harvestOpen, harvestEditId, harvestForm, closeHarvest, setHarvestForm, incQty } = useAppStore();
  const [saveError, setSaveError] = useState('');

  const selLeg = seasonLegumes.find(l => l.id === harvestForm.legume_id);
  const showLong = true;
  const estValeur = selLeg
    ? fmt(valeurRecolte({ id: '', date: '', season_id: activeSeason, qty: harvestForm.qty, poids: harvestForm.poids ? Number(harvestForm.poids) : null, legume_id: selLeg.id }, selLeg))
    : '—';

  const canSave = !!harvestForm.legume_id;

  async function handleSave() {
    if (!canSave) return;
    setSaveError('');
    try {
      await onSave({
        id: harvestEditId ?? `h_${Date.now()}`,
        date: harvestForm.date,
        legume_id: harvestForm.legume_id!,
        qty: harvestForm.qty,
        poids: harvestForm.poids ? Number(harvestForm.poids) : null,
        longueur: harvestForm.longueur ? Number(harvestForm.longueur) : null,
        variete: harvestForm.variete || null,
        bac_id: harvestForm.bac_id || null,
        notes: harvestForm.notes || null,
        season_id: activeSeason,
      });
      AccessibilityInfo.announceForAccessibility('Récolte enregistrée');
      closeHarvest();
    } catch (e: any) {
      setSaveError(e?.message ?? 'Une erreur est survenue lors de l\'enregistrement.');
    }
  }

  async function handleDelete() {
    if (!harvestEditId || !onDelete) return;
    await onDelete(harvestEditId);
    AccessibilityInfo.announceForAccessibility('Récolte supprimée');
    closeHarvest();
  }

  return (
    <Sheet visible={harvestOpen} onClose={closeHarvest} scrollable>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{harvestEditId ? 'Modifier la récolte' : 'Nouvelle récolte'}</Text>
        <Pressable onPress={closeHarvest} style={({ focused }: { focused?: boolean; pressed: boolean }) => [styles.closeBtn, focused && { borderColor: colors.green, borderWidth: 2 }]} accessibilityLabel="Fermer" accessibilityRole="button">
          <Text style={styles.closeTxt}>✕</Text>
        </Pressable>
      </View>

      {/* Date */}
      <View style={styles.dateRow}>
        <Text style={styles.dateLabel}>Date de récolte</Text>
        <DateTimePicker
          value={new Date(harvestForm.date)}
          mode="date"
          display="compact"
          maximumDate={new Date()}
          locale="fr-FR"
          onChange={(_, selected) => {
            if (selected) setHarvestForm({ date: selected.toISOString().split('T')[0] });
          }}
          accessibilityLabel="Date de la récolte"
        />
      </View>

      {/* Légume */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionLabel}>Légume</Text>
      </View>

      {seasonLegumes.length === 0 ? (
        <View style={styles.noLegumes}>
          <Text style={styles.noLegumesTxt}>Aucun légume dans ton potager</Text>
          <Text style={styles.noLegumesLink}>Active tes légumes dans Réglages</Text>
        </View>
      ) : (
        <View style={styles.chips}>
          {seasonLegumes.map(l => {
            const active = harvestForm.legume_id === l.id;
            return (
              <Pressable
                key={l.id}
                onPress={() => setHarvestForm({ legume_id: l.id })}
                style={[styles.legChip, active && styles.legChipActive]}
                accessibilityRole="radio"
                accessibilityLabel={l.nom}
                accessibilityState={{ checked: active }}
              >
                <View style={[styles.legDot, { backgroundColor: l.color }]}>
                  <Text style={styles.legDotTxt}>{initial(l.nom)}</Text>
                </View>
                <Text style={[styles.legTxt, active && styles.legTxtActive]}>{l.nom}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Quantité + valeur */}
      <Text style={styles.sectionLabel}>Quantité</Text>
      <View style={styles.qtyRow}>
        <View style={styles.qtyControl}>
          <Pressable onPress={() => incQty(-1)} style={styles.qtyBtn} accessibilityLabel="Diminuer la quantité" accessibilityRole="button">
            <Text style={styles.qtyBtnTxt}>−</Text>
          </Pressable>
          <Text style={styles.qtyValue} accessibilityLabel={`${harvestForm.qty} unité${harvestForm.qty > 1 ? 's' : ''}`}>{harvestForm.qty}</Text>
          <Pressable onPress={() => incQty(1)} style={[styles.qtyBtn, styles.qtyBtnPlus]} accessibilityLabel="Augmenter la quantité" accessibilityRole="button">
            <Text style={[styles.qtyBtnTxt, { color: '#fff' }]}>+</Text>
          </Pressable>
        </View>
        <View style={styles.valeurBox}>
          <Text style={styles.valeurLabel}>Valeur estimée</Text>
          <Text style={styles.valeurValue}>{estValeur}</Text>
          {selLeg && <Text style={styles.valeurHint}>{fmt(selLeg.prix)} / {selLeg.unite}</Text>}
        </View>
      </View>

      {/* Optionnels */}
      <Text style={styles.optLabel}>Détails optionnels</Text>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Poids (g)</Text>
          <TextInput style={styles.input} value={harvestForm.poids} onChangeText={v => setHarvestForm({ poids: v })} placeholder="—" placeholderTextColor={colors.muted} keyboardType="numeric" textContentType="none" accessibilityLabel="Poids en grammes" />
        </View>
        {showLong && (
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Longueur (cm)</Text>
            <TextInput style={styles.input} value={harvestForm.longueur} onChangeText={v => setHarvestForm({ longueur: v })} placeholder="—" placeholderTextColor={colors.muted} keyboardType="numeric" textContentType="none" accessibilityLabel="Longueur en centimètres" />
          </View>
        )}
      </View>

      <Text style={styles.label}>Variété</Text>
      <TextInput style={styles.input} value={harvestForm.variete} onChangeText={v => setHarvestForm({ variete: v })} placeholder="ex : Coeur de boeuf" placeholderTextColor={colors.muted} textContentType="none" accessibilityLabel="Variété" />

      {bacs.length > 0 && (
        <>
          <Text style={styles.label}>Bac</Text>
          <View style={styles.bacChips}>
            {bacs.map(b => {
              const active = harvestForm.bac_id === b.id;
              return (
                <Pressable key={b.id} onPress={() => setHarvestForm({ bac_id: b.id })} style={[styles.bacChip, active && styles.legChipActive, { flex: 1 }]} accessibilityRole="radio" accessibilityLabel={b.nom} accessibilityState={{ checked: active }}>
                  <Text style={[styles.bacChipTxt, active && styles.legTxtActive]}>{b.nom}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.textarea]} value={harvestForm.notes} onChangeText={v => setHarvestForm({ notes: v })} placeholder="Une remarque sur cette récolte…" placeholderTextColor={colors.muted} multiline numberOfLines={2} textContentType="none" accessibilityLabel="Notes" />

      {saveError ? <Text accessibilityRole="alert" style={styles.errorMsg}>{saveError}</Text> : null}
      <Pressable onPress={handleSave} style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]} accessibilityRole="button" accessibilityLabel={harvestEditId ? 'Enregistrer les modifications' : 'Valider la récolte'} accessibilityState={{ disabled: !canSave }} accessibilityHint={!canSave ? 'Sélectionne un légume pour valider' : undefined}>
        <Text style={styles.saveTxt}>{harvestEditId ? 'Enregistrer les modifications' : 'Valider la récolte'}</Text>
      </Pressable>

      {harvestEditId && onDelete && (
        <Pressable onPress={handleDelete} style={styles.deleteBtn} accessibilityRole="button" accessibilityLabel="Supprimer cette récolte">
          <Text style={styles.deleteTxt}>Supprimer cette récolte</Text>
        </Pressable>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  title: { fontSize: fontSize.h2, fontWeight: fontWeight.bold, color: colors.ink, letterSpacing: -0.5 },
  closeBtn: { backgroundColor: colors.chip, width: 44, height: 44, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.inputBorder },
  closeTxt: { color: colors.muted, fontSize: 16 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 15, padding: spacing.md, marginBottom: spacing.lg },
  dateLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.muted },
  dateValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.ink },
  sectionRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9, marginTop: spacing.sm },
  sectionLabel: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.ink, marginBottom: 9, marginTop: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  legChip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: colors.inputBorder, backgroundColor: colors.card, paddingRight: 13, paddingLeft: 9, paddingVertical: 8, borderRadius: 14 },
  legChipActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  legDot: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  legDotTxt: { color: '#fff', fontSize: fontSize.base, fontWeight: fontWeight.bold },
  legTxt: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.ink },
  legTxtActive: { color: colors.green },
  noLegumes: { borderWidth: 1.5, borderColor: colors.line, borderStyle: 'dashed', borderRadius: 14, padding: 16, alignItems: 'center' },
  noLegumesTxt: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.ink },
  noLegumesLink: { fontSize: fontSize.base, color: colors.green, fontWeight: fontWeight.bold, marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 16, padding: 6 },
  qtyBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.inputBorder },
  qtyBtnPlus: { backgroundColor: colors.green },
  qtyBtnTxt: { fontSize: 24, fontWeight: fontWeight.bold, color: colors.ink, lineHeight: 28 },
  qtyValue: { minWidth: 48, textAlign: 'center', fontSize: 26, fontWeight: fontWeight.extrabold, color: colors.ink },
  valeurBox: { flex: 1, alignItems: 'flex-end' },
  valeurLabel: { fontSize: fontSize.sm, color: colors.muted, fontWeight: fontWeight.semibold },
  valeurValue: { fontSize: 28, fontWeight: fontWeight.extrabold, color: colors.green, letterSpacing: -0.5 },
  valeurHint: { fontSize: fontSize.xs, color: colors.muted },
  optLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10 },
  label: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.muted, marginBottom: 6, marginTop: spacing.base },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.md, padding: spacing.md, fontSize: fontSize.lg, fontWeight: fontWeight.semibold, color: colors.ink },
  textarea: { height: 70, textAlignVertical: 'top' },
  bacChips: { flexDirection: 'row', gap: 8 },
  bacChip: { borderWidth: 1.5, borderColor: colors.inputBorder, backgroundColor: colors.card, padding: 11, borderRadius: radius.md, alignItems: 'center' },
  bacChipTxt: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.ink },
  deleteBtn: { alignItems: 'center', padding: spacing.md, marginTop: spacing.base },
  deleteTxt: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.destructive },
  errorMsg: { fontSize: fontSize.sm, color: colors.accent, fontWeight: fontWeight.semibold, marginTop: spacing.base, paddingHorizontal: 2 },
  saveBtn: { backgroundColor: colors.green, borderRadius: radius.xl, padding: 17, alignItems: 'center', marginTop: spacing.base },
  saveBtnDisabled: { backgroundColor: '#b9bcae' },
  saveTxt: { color: '#fff', fontSize: fontSize.xl, fontWeight: fontWeight.bold },
});
