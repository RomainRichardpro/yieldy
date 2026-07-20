import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../src/lib/supabase';
import { useFocusEffect } from 'expo-router';
import { colors, spacing, radius, fontSize, fontWeight } from '../../src/utils/tokens';
import { initial, fmt } from '../../src/utils/format';
import { getLegumes, getBacs, getSeasons, getActiveSeason, createSeason, setActiveSeason as dbSetActiveSeason, upsertLegume, deleteLegume, upsertBac, deleteBac, getSeasonLegumeIds, toggleSeasonLegume } from '../../src/lib/queries';
import { useAppStore } from '../../src/store/useAppStore';
import LegumeSheet from '../../src/components/sheets/LegumeSheet';
import BacSheet from '../../src/components/sheets/BacSheet';
import EmptyState from '../../src/components/ui/EmptyState';
import type { Legume, Bac, Season } from '../../src/types';

export default function ReglagesScreen() {
  const [legumes, setLegumes] = useState<Legume[]>([]);
  const [bacs, setBacs] = useState<Bac[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [activeSeason, setActiveSeason] = useState<number | null>(null);
  const [seasonLegumeIds, setSeasonLegumeIds] = useState<string[]>([]);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const { openLegume, openBac } = useAppStore();
  const router = useRouter();

  async function handleDeleteAccount() {
    Alert.alert(
      'Supprimer mon compte',
      'Toutes tes données (récoltes, légumes, bacs, saisons) seront définitivement supprimées. Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeletingAccount(true);
            try {
              await supabase.rpc('delete_user');
              await supabase.auth.signOut();
            } catch (e) {
              setDeletingAccount(false);
              Alert.alert('Erreur', 'Impossible de supprimer le compte. Réessaie plus tard.');
            }
          },
        },
      ]
    );
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  async function load() {
    const [l, b, s, a] = await Promise.all([getLegumes(), getBacs(), getSeasons(), getActiveSeason()]);
    setLegumes(l);
    setBacs(b);
    setSeasons(s);
    const sid = a?.id ?? null;
    setActiveSeason(sid);
    if (sid) setSeasonLegumeIds(await getSeasonLegumeIds(sid));
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  async function handleAddSeason() {
    const years = seasons.map(s => s.id);
    const next = Math.max(...years, new Date().getFullYear()) + 1;
    await createSeason(next);
    await load();
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1} accessibilityRole="header">Réglages</Text>

        <Text style={styles.sectionCap} accessibilityRole="header">Saison active</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {seasons.map(s => (
            <Pressable key={s.id} onPress={async () => { await dbSetActiveSeason(s.id); await load(); }} style={[styles.seasonChip, activeSeason === s.id && styles.seasonChipActive]} accessibilityRole="radio" accessibilityLabel={s.label} accessibilityState={{ checked: activeSeason === s.id }}>
              <Text style={[styles.seasonChipTxt, activeSeason === s.id && styles.seasonChipTxtActive]}>{s.label}</Text>
            </Pressable>
          ))}
          <Pressable onPress={handleAddSeason} style={styles.addSeasonChip} accessibilityRole="button" accessibilityLabel="Nouvelle saison">
            <Text style={styles.addSeasonTxt}>+ Nouvelle</Text>
          </Pressable>
        </ScrollView>
        <Text style={styles.hint}>La saison active filtre tout : légumes du potager, coûts récurrents, récoltes et stats.</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.h2} accessibilityRole="header">Légumes</Text>
          <Pressable onPress={() => openLegume()} style={({ focused }) => [styles.addBtn, focused && { borderColor: colors.green, borderWidth: 2 }]} accessibilityRole="button" accessibilityLabel="Ajouter un légume"><Text style={styles.addBtnTxt}>+</Text></Pressable>
        </View>
        <Text style={styles.hint}>Active ceux de ton potager {activeSeason ? `Saison ${activeSeason}` : ''}</Text>

        {legumes.length === 0
          ? <EmptyState title="Aucun légume" subtitle="Ajoute tes légumes avec le bouton +" />
          : <View style={styles.list} accessibilityRole="list">
              {legumes.map(l => {
                const on = seasonLegumeIds.includes(l.id);
                return (
                  <View key={l.id} style={[styles.legumeRow, on && styles.legumeRowActive]}>
                    <Pressable onPress={() => openLegume(l.id, { nom: l.nom, prix: String(l.prix), unite: l.unite, source: l.source ?? '', color: l.color, colorTouched: true })} style={styles.legumeInfo} accessibilityRole="button" accessibilityLabel={`Modifier ${l.nom}`}>
                      <View style={[styles.badge, { backgroundColor: l.color, opacity: on ? 1 : 0.5 }]}><Text style={styles.badgeTxt}>{initial(l.nom)}</Text></View>
                      <View style={[styles.legumeMeta, { opacity: on ? 1 : 0.5 }]}>
                        <Text style={styles.legumeNom}>{l.nom}</Text>
                        <Text style={styles.legumeSub}>{fmt(l.prix)} / {l.unite}{l.source ? ` · ${l.source}` : ''}</Text>
                      </View>
                    </Pressable>
                    <Switch value={on} onValueChange={async () => { if (!activeSeason) return; await toggleSeasonLegume(activeSeason, l.id); setSeasonLegumeIds(await getSeasonLegumeIds(activeSeason)); }} trackColor={{ false: colors.line, true: colors.green }} thumbColor="#fff" accessibilityLabel={`${l.nom} dans le potager`} accessibilityRole="switch" />
                  </View>
                );
              })}
            </View>
        }

        <View style={styles.sectionHeader}>
          <Text style={styles.h2} accessibilityRole="header">Bacs & zones</Text>
          <Pressable onPress={() => openBac(undefined, undefined, bacs.length)} style={({ focused }) => [styles.addBtn, focused && { borderColor: colors.green, borderWidth: 2 }]} accessibilityRole="button" accessibilityLabel="Ajouter un bac"><Text style={styles.addBtnTxt}>+</Text></Pressable>
        </View>

        {bacs.length === 0
          ? <EmptyState title="Aucun bac" subtitle="Ajoute tes zones de culture avec le bouton +" />
          : <View style={styles.list} accessibilityRole="list">
              {bacs.map(b => {
                const contenuNoms = b.contenu.map(id => legumes.find(l => l.id === id)?.nom).filter(Boolean);
                return (
                  <Pressable key={b.id} onPress={() => openBac(b.id, { nom: b.nom, larg: String(b.larg), long: String(b.long), contenu: b.contenu })} style={styles.bacRow} accessibilityRole="button" accessibilityLabel={`Modifier le bac ${b.nom}`}>
                    <View style={styles.bacIcon}><Text style={{ fontSize: 18 }}>🪴</Text></View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.legumeNom}>{b.nom}</Text>
                      <Text style={styles.legumeSub}>{b.larg > 0 ? `${b.larg}×${b.long} cm` : 'Dimensions non définies'}</Text>
                      {contenuNoms.length > 0 && <Text style={styles.bacContenu}>🌱 {contenuNoms.join(', ')}</Text>}
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                );
              })}
            </View>
        }
        <Text style={[styles.sectionCap, { marginTop: spacing.xxl }]}>Compte</Text>
        <Pressable onPress={handleSignOut} style={styles.accountBtn} accessibilityRole="button" accessibilityLabel="Se déconnecter">
          <Text style={styles.accountBtnTxt}>Se déconnecter</Text>
        </Pressable>
        <Pressable onPress={handleDeleteAccount} style={[styles.accountBtn, styles.deleteBtn]} accessibilityRole="button" accessibilityLabel="Supprimer mon compte" disabled={deletingAccount}>
          <Text style={styles.deleteBtnTxt}>{deletingAccount ? 'Suppression…' : 'Supprimer mon compte'}</Text>
        </Pressable>
        <Text style={styles.deleteHint}>Supprime définitivement ton compte et toutes tes données.</Text>

        <View style={{ height: 40 }} />
      </ScrollView>

      <LegumeSheet onSave={async (leg) => { await upsertLegume(leg); await load(); }} onDelete={async (id) => { await deleteLegume(id); await load(); }} />
      <BacSheet seasonLegumes={legumes.filter(l => seasonLegumeIds.includes(l.id))} onSave={async (bac) => { await upsertBac(bac); await load(); }} onDelete={async (id) => { await deleteBac(id); await load(); }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.xl, paddingTop: 60 },
  h1: { fontSize: fontSize.h1, fontWeight: fontWeight.bold, color: colors.ink, letterSpacing: -0.5, marginBottom: spacing.xl },
  h2: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.ink },
  sectionCap: { fontSize: fontSize.base, fontWeight: fontWeight.bold, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xxl, marginBottom: 4 },
  chipRow: { gap: 8, paddingVertical: 2 },
  seasonChip: { borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.card, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 15 },
  seasonChipActive: { borderColor: colors.green, backgroundColor: colors.greenSoft },
  seasonChipTxt: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.ink },
  seasonChipTxtActive: { color: colors.green },
  addSeasonChip: { borderWidth: 1.5, borderColor: colors.green, borderStyle: 'dashed', backgroundColor: colors.greenSoft, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 15 },
  addSeasonTxt: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.green },
  hint: { fontSize: fontSize.sm, color: colors.muted, marginTop: 8, marginBottom: 12, lineHeight: 18 },
  addBtn: { backgroundColor: colors.greenSoft, width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.inputBorder },
  addBtnTxt: { color: colors.green, fontSize: 22, lineHeight: 28, fontWeight: fontWeight.bold },
  list: { gap: 10 },
  legumeRow: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.lg, padding: spacing.md },
  legumeRowActive: { borderColor: colors.green },
  legumeInfo: { flexDirection: 'row', alignItems: 'center', gap: 13, flex: 1 },
  badge: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  badgeTxt: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.base },
  legumeMeta: { flex: 1 },
  legumeNom: { fontSize: 14.5, fontWeight: fontWeight.bold, color: colors.ink },
  legumeSub: { fontSize: fontSize.xs, color: colors.muted, fontWeight: fontWeight.medium, marginTop: 2 },
  bacRow: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.lg, padding: 14 },
  bacIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  bacContenu: { fontSize: fontSize.xs, color: colors.green, fontWeight: fontWeight.semibold, marginTop: 3 },
  chevron: { fontSize: 20, color: colors.muted },
  accountBtn: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: radius.lg, padding: spacing.base, alignItems: 'center', marginBottom: 10 },
  accountBtnTxt: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.ink },
  deleteBtn: { borderColor: colors.destructive, backgroundColor: '#fff5f5' },
  deleteBtnTxt: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.destructive },
  deleteHint: { fontSize: fontSize.xs, color: colors.muted, textAlign: 'center', marginTop: 2 },
});
