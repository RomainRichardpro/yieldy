import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { colors, spacing, radius, fontSize, fontWeight, shadows } from '../../src/utils/tokens';
import { fmt, fmt0, initial, valeurRecolte, qtyLabel, relDate } from '../../src/utils/format';
import { getLegumes, getBacs, getHarvests, getInvest, getActiveSeason } from '../../src/db/queries';
import { useAppStore } from '../../src/store/useAppStore';
import HarvestSheet from '../../src/components/sheets/HarvestSheet';
import { upsertHarvest, deleteHarvest, getSeasonLegumeIds } from '../../src/db/queries';
import EmptyState from '../../src/components/ui/EmptyState';
import type { Legume, Bac, Harvest, Invest } from '../../src/types';

export default function AccueilScreen() {
  const [legumes, setLegumes] = useState<Legume[]>([]);
  const [bacs, setBacs] = useState<Bac[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [invest, setInvest] = useState<Invest[]>([]);
  const [activeSeason, setActiveSeason] = useState<number | null>(null);
  const [seasonLegumeIds, setSeasonLegumeIds] = useState<string[]>([]);
  const { openHarvest } = useAppStore();

  async function load() {
    const s = await getActiveSeason();
    if (!s) return;
    setActiveSeason(s.id);
    const [l, b, h, inv, ids] = await Promise.all([
      getLegumes(), getBacs(), getHarvests(s.id), getInvest(), getSeasonLegumeIds(s.id)
    ]);
    setLegumes(l); setBacs(b); setHarvests(h); setInvest(inv); setSeasonLegumeIds(ids);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  if (!activeSeason) return null;

  const legMap = Object.fromEntries(legumes.map(l => [l.id, l]));
  const bacMap = Object.fromEntries(bacs.map(b => [b.id, b]));

  const cum = harvests.reduce((s, h) => { const l = legMap[h.legume_id]; return s + (l ? valeurRecolte(h, l) : 0); }, 0);
  const coutInitial = invest.filter(i => i.type === 'initial').reduce((s, i) => s + i.montant, 0);
  const coutRecurrent = invest.filter(i => i.type === 'recurrent' && i.season_id === activeSeason).reduce((s, i) => s + i.montant, 0);
  const cout = coutInitial + coutRecurrent;
  const progress = cout > 0 ? Math.min(100, (cum / cout) * 100) : 0;
  const reste = Math.max(0, cout - cum);
  const rentable = cum >= cout && cout > 0;

  const recent = harvests.slice(0, 3);
  const seasonLegumes = legumes.filter(l => seasonLegumeIds.includes(l.id));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>Bonjour 🌱</Text>
            <Text style={styles.h1}>Ton potager</Text>
          </View>
          <View style={styles.seasonBadge}>
            <Text style={styles.seasonBadgeTxt}>Saison {activeSeason}</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroBubble1} />
          <View style={styles.heroBubble2} />
          <View style={{ position: 'relative' }}>
            <Text style={styles.heroSub}>Valeur récoltée cette saison</Text>
            <Text style={styles.heroValue}>{fmt(cum)}</Text>
            <Text style={styles.heroCaption}>≈ autant d'économisé au supermarché bio</Text>
            <View style={styles.heroStats}>
              <View>
                <Text style={styles.heroStatNum}>{harvests.length}</Text>
                <Text style={styles.heroStatLabel}>récoltes</Text>
              </View>
              <View style={styles.heroDivider} />
              <View>
                <Text style={styles.heroStatNum}>{Math.round(progress)}%</Text>
                <Text style={styles.heroStatLabel}>amorti</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Rentabilité progress */}
        {cout > 0 && (
          <View style={styles.rentaCard}>
            <View style={styles.rentaHeader}>
              <Text style={styles.rentaTitle}>Rentabilité du potager</Text>
              <View style={styles.rentaBadge}>
                <Text style={styles.rentaBadgeTxt}>{rentable ? '✅ Rentable' : '⏳ En bonne voie'}</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.round(progress)}%` }]} />
            </View>
            <View style={styles.rentaFooter}>
              <Text style={styles.rentaMuted}>{fmt(cum)} récoltés</Text>
              <Text style={styles.rentaMuted}>Objectif {fmt0(cout)}</Text>
            </View>
            {!rentable && reste > 0 && (
              <Text style={styles.rentaReste}>Plus que <Text style={{ color: colors.ink, fontWeight: fontWeight.bold }}>{fmt0(reste)}</Text> avant de rembourser ton investissement.</Text>
            )}
          </View>
        )}

        {/* Dernières récoltes */}
        <View style={styles.sectionHeader}>
          <Text style={styles.h2}>Dernières récoltes</Text>
        </View>

        {recent.length === 0 ? (
          <EmptyState title="Aucune récolte" subtitle="Appuie sur + pour enregistrer ta première récolte" />
        ) : (
          <View style={styles.list}>
            {recent.map(h => {
              const l = legMap[h.legume_id];
              const b = bacMap[h.bac_id ?? ''];
              if (!l) return null;
              return (
                <Pressable key={h.id} onPress={() => openHarvest(h.id, { date: h.date, legume_id: h.legume_id, qty: h.qty, poids: h.poids ? String(h.poids) : '', longueur: h.longueur ? String(h.longueur) : '', variete: h.variete ?? '', bac_id: h.bac_id ?? null, notes: h.notes ?? '' })} style={styles.harvestRow}>
                  <View style={[styles.badge, { backgroundColor: l.color }]}>
                    <Text style={styles.badgeTxt}>{initial(l.nom)}</Text>
                  </View>
                  <View style={styles.harvestMeta}>
                    <Text style={styles.harvestNom}>{l.nom}</Text>
                    <Text style={styles.harvestSub}>{qtyLabel(h, l)}{b ? ` · ${b.nom}` : ''} · {relDate(h.date)}</Text>
                  </View>
                  <Text style={styles.harvestValeur}>{fmt(valeurRecolte(h, l))}</Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Add button */}
        <Pressable onPress={() => openHarvest()} style={styles.addBtn}>
          <Text style={styles.addBtnTxt}>+ Enregistrer une récolte</Text>
        </Pressable>

        <View style={{ height: 120 }} />
      </ScrollView>

      <HarvestSheet
        seasonLegumes={seasonLegumes}
        bacs={bacs}
        activeSeason={activeSeason}
        onSave={async (h) => { await upsertHarvest(h); await load(); }}
        onDelete={async (id) => { await deleteHarvest(id); await load(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.xl, paddingTop: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  greeting: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.muted, letterSpacing: 0.2 },
  h1: { fontSize: fontSize.h1, fontWeight: fontWeight.bold, color: colors.ink, letterSpacing: -0.5, marginTop: 2 },
  h2: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.ink },
  seasonBadge: { backgroundColor: colors.greenSoft, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 14 },
  seasonBadgeTxt: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.green },
  hero: { marginTop: 18, backgroundColor: colors.green, borderRadius: 26, padding: 24, paddingBottom: 22, overflow: 'hidden', position: 'relative' },
  heroBubble1: { position: 'absolute', right: -34, top: -34, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.08)' },
  heroBubble2: { position: 'absolute', right: 24, bottom: -50, width: 110, height: 110, borderRadius: 55, backgroundColor: 'rgba(255,255,255,0.06)' },
  heroSub: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: 'rgba(255,255,255,0.85)' },
  heroValue: { fontSize: fontSize.hero, fontWeight: fontWeight.extrabold, color: '#fff', lineHeight: 56, marginTop: 4, letterSpacing: -1 },
  heroCaption: { fontSize: 13.5, fontWeight: fontWeight.medium, color: 'rgba(255,255,255,0.9)', marginTop: 6 },
  heroStats: { flexDirection: 'row', gap: 18, marginTop: 18 },
  heroStatNum: { fontSize: 21, fontWeight: fontWeight.bold, color: '#fff' },
  heroStatLabel: { fontSize: fontSize.xs, color: 'rgba(255,255,255,0.82)', fontWeight: fontWeight.medium },
  heroDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.22)' },
  rentaCard: { marginTop: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 18, paddingBottom: 16 },
  rentaHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rentaTitle: { fontSize: 14.5, fontWeight: fontWeight.bold, color: colors.ink },
  rentaBadge: { backgroundColor: colors.accentSoft, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 20 },
  rentaBadgeTxt: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.accent },
  progressTrack: { height: 11, borderRadius: 8, backgroundColor: colors.chip, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: '100%', minWidth: 8, backgroundColor: colors.green, borderRadius: 8 },
  rentaFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  rentaMuted: { fontSize: 12.5, color: colors.muted, fontWeight: fontWeight.medium },
  rentaReste: { fontSize: 12.5, color: colors.muted, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 26, marginBottom: 10 },
  list: { gap: 10 },
  harvestRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 13, paddingHorizontal: 15 },
  badge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  badgeTxt: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.xl },
  harvestMeta: { flex: 1, minWidth: 0 },
  harvestNom: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.ink },
  harvestSub: { fontSize: 12.5, color: colors.muted, fontWeight: fontWeight.medium, marginTop: 2 },
  harvestValeur: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.green },
  addBtn: { marginTop: 16, borderWidth: 1.5, borderColor: colors.green, borderStyle: 'dashed', backgroundColor: colors.greenSoft, borderRadius: 18, padding: 15, alignItems: 'center' },
  addBtnTxt: { fontSize: 14.5, fontWeight: fontWeight.bold, color: colors.green },
});
