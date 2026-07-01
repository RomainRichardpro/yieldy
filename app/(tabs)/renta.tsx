import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { colors, spacing, radius, fontSize, fontWeight } from '../../src/utils/tokens';
import { fmt, fmt0, valeurRecolte } from '../../src/utils/format';
import { getLegumes, getHarvests, getInvest, getActiveSeason, upsertInvest, deleteInvest } from '../../src/db/queries';
import { useAppStore } from '../../src/store/useAppStore';
import LineChart from '../../src/components/charts/LineChart';
import InvestSheet from '../../src/components/sheets/InvestSheet';
import EmptyState from '../../src/components/ui/EmptyState';
import type { Legume, Harvest, Invest } from '../../src/types';

export default function RentaScreen() {
  const [legumes, setLegumes] = useState<Legume[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [invest, setInvest] = useState<Invest[]>([]);
  const [activeSeason, setActiveSeason] = useState<number | null>(null);
  const { openInvest } = useAppStore();
  const { width } = useWindowDimensions();
  const chartWidth = width - spacing.xl * 2 - 36;

  async function load() {
    const s = await getActiveSeason();
    if (!s) return;
    setActiveSeason(s.id);
    const [l, h, inv] = await Promise.all([getLegumes(), getHarvests(s.id), getInvest()]);
    setLegumes(l); setHarvests(h); setInvest(inv);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  if (!activeSeason) return null;

  const legMap = Object.fromEntries(legumes.map(l => [l.id, l]));

  const initiaux = invest.filter(i => i.type === 'initial');
  const recurrents = invest.filter(i => i.type === 'recurrent' && i.season_id === activeSeason);
  const coutInitial = initiaux.reduce((s, i) => s + i.montant, 0);
  const coutRecurrent = recurrents.reduce((s, i) => s + i.montant, 0);
  const coutTotal = coutInitial + coutRecurrent;

  // Cumulative harvest value sorted by date
  const sorted = [...harvests].sort((a, b) => a.date.localeCompare(b.date));
  let cumSum = 0;
  const points = sorted.map((h, i) => {
    const l = legMap[h.legume_id];
    cumSum += l ? valeurRecolte(h, l) : 0;
    return { x: i, y: cumSum };
  });
  const cum = cumSum;
  const rentable = coutTotal > 0 && cum >= coutTotal;
  const reste = Math.max(0, coutTotal - cum);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.h1}>Rentabilité</Text>
          {coutTotal > 0 && (
            <View style={[styles.badge, rentable ? styles.badgeGreen : styles.badgeOrange]}>
              <Text style={[styles.badgeTxt, rentable ? styles.badgeTxtGreen : styles.badgeTxtOrange]}>
                {rentable ? '✅ Rentable' : '⏳ En cours'}
              </Text>
            </View>
          )}
        </View>

        {coutTotal === 0 && harvests.length === 0 ? (
          <>
            <EmptyState title="Pas encore de données" subtitle="Ajoute des investissements et enregistre des récoltes pour voir ta rentabilité" />
            <Pressable onPress={() => openInvest()} style={styles.addBtn}>
              <Text style={styles.addBtnTxt}>+ Ajouter un investissement</Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Line chart card */}
            {points.length > 1 && coutTotal > 0 && (
              <View style={styles.chartCard}>
                <Text style={styles.cardTitle}>Progression vers la rentabilité</Text>
                <Text style={styles.cardSub}>Valeur cumulée des récoltes vs investissement total</Text>
                <View style={styles.chartWrap}>
                  <LineChart points={points} target={coutTotal} width={chartWidth} height={180} />
                </View>
              </View>
            )}

            {/* Cards row */}
            <View style={styles.cardsRow}>
              <View style={[styles.miniCard, styles.miniCardGreen]}>
                <Text style={styles.miniCardLabel}>Récolté</Text>
                <Text style={styles.miniCardValue}>{fmt(cum)}</Text>
                <Text style={styles.miniCardSub}>{harvests.length} récolte{harvests.length !== 1 ? 's' : ''}</Text>
              </View>
              <View style={styles.miniCard}>
                <Text style={styles.miniCardLabel}>{rentable ? 'Bénéfice net' : 'Reste à amortir'}</Text>
                <Text style={[styles.miniCardValue, rentable ? { color: colors.green } : { color: colors.accent }]}>
                  {rentable ? `+${fmt0(cum - coutTotal)}` : fmt0(reste)}
                </Text>
                <Text style={styles.miniCardSub}>sur {fmt0(coutTotal)} investi</Text>
              </View>
            </View>

            {/* Investissements initiaux */}
            <View style={styles.sectionHeader}>
              <Text style={styles.h2}>Investissements initiaux</Text>
              <Pressable onPress={() => openInvest('initial')} style={styles.addSmall}>
                <Text style={styles.addSmallTxt}>+ Ajouter</Text>
              </Pressable>
            </View>

            {initiaux.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionTxt}>Aucun investissement initial (matériel, sol, graines…)</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {initiaux.map(i => (
                  <Pressable
                    key={i.id}
                    onPress={() => openInvest('initial', i.id, { libelle: i.libelle, montant: String(i.montant) })}
                    style={styles.investRow}
                  >
                    <View style={styles.investIcon}><Text style={{ fontSize: 18 }}>🌱</Text></View>
                    <Text style={styles.investLabel}>{i.libelle}</Text>
                    <Text style={styles.investMontant}>{fmt(i.montant)}</Text>
                  </Pressable>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total initial</Text>
                  <Text style={styles.totalVal}>{fmt(coutInitial)}</Text>
                </View>
              </View>
            )}

            {/* Coûts récurrents */}
            <View style={[styles.sectionHeader, { marginTop: 22 }]}>
              <Text style={styles.h2}>Coûts récurrents</Text>
              <Pressable onPress={() => openInvest('recurrent')} style={styles.addSmall}>
                <Text style={styles.addSmallTxt}>+ Ajouter</Text>
              </Pressable>
            </View>

            {recurrents.length === 0 ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptySectionTxt}>Aucun coût récurrent cette saison (eau, semences, engrais…)</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {recurrents.map(i => (
                  <Pressable
                    key={i.id}
                    onPress={() => openInvest('recurrent', i.id, { libelle: i.libelle, montant: String(i.montant) })}
                    style={styles.investRow}
                  >
                    <View style={styles.investIcon}><Text style={{ fontSize: 18 }}>💧</Text></View>
                    <Text style={styles.investLabel}>{i.libelle}</Text>
                    <Text style={styles.investMontant}>{fmt(i.montant)}</Text>
                  </Pressable>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total récurrent</Text>
                  <Text style={styles.totalVal}>{fmt(coutRecurrent)}</Text>
                </View>
              </View>
            )}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <InvestSheet seasonLabel={`Saison ${activeSeason}`}
        activeSeason={activeSeason}
        onSave={async (inv) => { await upsertInvest(inv); await load(); }}
        onDelete={async (id) => { await deleteInvest(id); await load(); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.xl, paddingTop: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 18 },
  h1: { fontSize: fontSize.h1, fontWeight: fontWeight.bold, color: colors.ink, letterSpacing: -0.5 },
  h2: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.ink },
  badge: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 14 },
  badgeGreen: { backgroundColor: colors.greenSoft },
  badgeOrange: { backgroundColor: colors.accentSoft },
  badgeTxt: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  badgeTxtGreen: { color: colors.green },
  badgeTxtOrange: { color: colors.accent },
  chartCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 18, paddingBottom: 14 },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.ink },
  cardSub: { fontSize: 12.5, color: colors.muted, fontWeight: fontWeight.medium, marginTop: 2 },
  chartWrap: { marginTop: 16, alignItems: 'center' },
  cardsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  miniCard: { flex: 1, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: 16 },
  miniCardGreen: { backgroundColor: colors.greenSoft, borderColor: colors.green },
  miniCardLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
  miniCardValue: { fontSize: fontSize.h2, fontWeight: fontWeight.extrabold, color: colors.ink, marginTop: 4, letterSpacing: -0.3 },
  miniCardSub: { fontSize: fontSize.xs, color: colors.muted, fontWeight: fontWeight.medium, marginTop: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 10 },
  addSmall: { backgroundColor: colors.greenSoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  addSmallTxt: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.green },
  list: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 20 },
  investRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: 1, borderBottomColor: colors.line },
  investIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.chip, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  investLabel: { flex: 1, fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.ink },
  investMontant: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.ink },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  totalLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.4 },
  totalVal: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.ink },
  emptySection: { backgroundColor: colors.chip, borderRadius: 16, padding: 14 },
  emptySectionTxt: { fontSize: 13, color: colors.muted, fontWeight: fontWeight.medium, textAlign: 'center' },
  addBtn: { marginTop: 18, borderWidth: 1.5, borderColor: colors.green, borderStyle: 'dashed', backgroundColor: colors.greenSoft, borderRadius: 18, padding: 15, alignItems: 'center' },
  addBtnTxt: { fontSize: 14.5, fontWeight: fontWeight.bold, color: colors.green },
});
