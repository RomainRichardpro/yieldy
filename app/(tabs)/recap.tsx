import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { colors, spacing, radius, fontSize, fontWeight } from '../../src/utils/tokens';
import { fmt, fmt0, initial, valeurRecolte } from '../../src/utils/format';
import { getLegumes, getBacs, getHarvests, getActiveSeason } from '../../src/db/queries';
import DonutChart from '../../src/components/charts/DonutChart';
import EmptyState from '../../src/components/ui/EmptyState';
import type { Legume, Bac, Harvest } from '../../src/types';

interface LegumeStat {
  legume: Legume;
  count: number;
  valeur: number;
}

interface BacStat {
  bac: Bac;
  count: number;
  valeur: number;
}

export default function RecapScreen() {
  const [legumes, setLegumes] = useState<Legume[]>([]);
  const [bacs, setBacs] = useState<Bac[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [activeSeason, setActiveSeason] = useState<number | null>(null);

  async function load() {
    const s = await getActiveSeason();
    if (!s) return;
    setActiveSeason(s.id);
    const [l, b, h] = await Promise.all([getLegumes(), getBacs(), getHarvests(s.id)]);
    setLegumes(l); setBacs(b); setHarvests(h);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  if (!activeSeason) return null;

  const legMap = Object.fromEntries(legumes.map(l => [l.id, l]));
  const bacMap = Object.fromEntries(bacs.map(b => [b.id, b]));

  const legStats: Record<string, LegumeStat> = {};
  const bacStats: Record<string, BacStat> = {};

  for (const h of harvests) {
    const l = legMap[h.legume_id];
    if (!l) continue;
    const v = valeurRecolte(h, l);
    if (!legStats[l.id]) legStats[l.id] = { legume: l, count: 0, valeur: 0 };
    legStats[l.id].count += h.qty;
    legStats[l.id].valeur += v;
    if (h.bac_id) {
      const b = bacMap[h.bac_id];
      if (b) {
        if (!bacStats[b.id]) bacStats[b.id] = { bac: b, count: 0, valeur: 0 };
        bacStats[b.id].count++;
        bacStats[b.id].valeur += v;
      }
    }
  }

  const legList = Object.values(legStats).sort((a, b) => b.valeur - a.valeur);
  const bacList = Object.values(bacStats).sort((a, b) => b.valeur - a.valeur);
  const totalValeur = legList.reduce((s, l) => s + l.valeur, 0);

  const donutSlices = legList.slice(0, 6).map(ls => ({ color: ls.legume.color, value: ls.valeur }));
  const top = legList[0];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.h1} accessibilityRole="header">Récap</Text>
          <View style={styles.seasonBadge}>
            <Text style={styles.seasonBadgeTxt}>Saison {activeSeason}</Text>
          </View>
        </View>

        {harvests.length === 0 ? (
          <EmptyState title="Rien à afficher" subtitle="Tes statistiques apparaîtront dès ta première récolte" />
        ) : (
          <>
            {/* Donut card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Répartition des récoltes</Text>
              <Text style={styles.cardTotal}>{fmt(totalValeur)} récoltés au total</Text>
              <View style={styles.donutRow}>
                <View style={styles.donutWrap}>
                  <DonutChart
                    slices={donutSlices}
                    total={totalValeur}
                    size={154}
                    strokeWidth={22}
                    accessibilityLabel={`Graphique donut : ${legList.slice(0, 6).map(ls => `${ls.legume.nom} ${Math.round((ls.valeur / totalValeur) * 100)}%`).join(', ')}`}
                  />
                  <View style={styles.donutCenter}>
                    <Text style={styles.donutCenterNum}>{harvests.length}</Text>
                    <Text style={styles.donutCenterLabel}>récoltes</Text>
                  </View>
                </View>
                <View style={styles.legend}>
                  {legList.slice(0, 6).map(ls => {
                    const pct = totalValeur > 0 ? Math.round((ls.valeur / totalValeur) * 100) : 0;
                    return (
                      <View key={ls.legume.id} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: ls.legume.color }]} />
                        <Text style={styles.legendName} numberOfLines={1}>{ls.legume.nom}</Text>
                        <Text style={styles.legendPct}>{pct}%</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Top légume trophy */}
            {top && (
              <View style={styles.trophyCard} accessible={true} accessibilityLabel={`Légume star : ${top.legume.nom}, ${fmt(top.valeur)}, ${Math.round(top.count)} unités récoltées`}>
                <Text style={styles.trophyEmoji}>🏆</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trophySub}>Légume star de la saison</Text>
                  <Text style={styles.trophyName}>{top.legume.nom}</Text>
                  <Text style={styles.trophyValue}>{fmt(top.valeur)} · {Math.round(top.count)} unités récoltées</Text>
                </View>
              </View>
            )}

            {/* Détail par légume */}
            <Text style={styles.h2} accessibilityRole="header">Détail par légume</Text>
            <View style={styles.card} accessibilityRole="list">
              {legList.map((ls, i) => {
                const pct = totalValeur > 0 ? (ls.valeur / totalValeur) * 100 : 0;
                return (
                  <View key={ls.legume.id} style={[styles.legRow, i < legList.length - 1 && styles.legRowBorder]}
                    accessible={true}
                    accessibilityLabel={`${ls.legume.nom}, ${fmt(ls.valeur)}, ${Math.round(pct)} pourcents du total`}
                  >
                    <View style={[styles.badge, { backgroundColor: ls.legume.color }]}>
                      <Text style={styles.badgeTxt}>{initial(ls.legume.nom)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.legHeader}>
                        <Text style={styles.legName}>{ls.legume.nom}</Text>
                        <Text style={styles.legVal}>{fmt(ls.valeur)}</Text>
                      </View>
                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: ls.legume.color }]} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Performance par bac */}
            {bacList.length > 0 && (
              <>
                <Text style={[styles.h2, { marginTop: 22 }]} accessibilityRole="header">Performance par bac</Text>
                <View style={styles.card} accessibilityRole="list">
                  {bacList.map((bs, i) => (
                    <View key={bs.bac.id} style={[styles.bacRow, i < bacList.length - 1 && styles.legRowBorder]}
                      accessible={true}
                      accessibilityLabel={`${bs.bac.nom}, ${bs.count} récolte${bs.count > 1 ? 's' : ''}, ${fmt(bs.valeur)}`}
                    >
                      <View style={styles.bacIcon}>
                        <Text style={styles.bacIconTxt}>🌿</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.legName}>{bs.bac.nom}</Text>
                        <Text style={styles.bacSub}>{bs.count} récolte{bs.count > 1 ? 's' : ''}</Text>
                      </View>
                      <Text style={styles.legVal}>{fmt(bs.valeur)}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  content: { padding: spacing.xl, paddingTop: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 18 },
  h1: { fontSize: fontSize.h1, fontWeight: fontWeight.bold, color: colors.ink, letterSpacing: -0.5 },
  h2: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: colors.ink, marginTop: 18, marginBottom: 10 },
  seasonBadge: { backgroundColor: colors.greenSoft, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 14 },
  seasonBadgeTxt: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.green },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 18, paddingVertical: 16 },
  cardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.ink },
  cardTotal: { fontSize: 12.5, color: colors.muted, fontWeight: fontWeight.medium, marginTop: 2 },
  donutRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 18 },
  donutWrap: { position: 'relative', width: 154, height: 154, alignItems: 'center', justifyContent: 'center' },
  donutCenter: { position: 'absolute', alignItems: 'center' },
  donutCenterNum: { fontSize: 24, fontWeight: fontWeight.extrabold, color: colors.ink },
  donutCenterLabel: { fontSize: fontSize.xs, color: colors.muted, fontWeight: fontWeight.medium },
  legend: { flex: 1, gap: 9 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot: { width: 9, height: 9, borderRadius: 5, flexShrink: 0 },
  legendName: { flex: 1, fontSize: 12.5, fontWeight: fontWeight.medium, color: colors.ink },
  legendPct: { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.muted },
  trophyCard: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, borderRadius: 22, padding: 18, marginTop: 12 },
  trophyEmoji: { fontSize: 38 },
  trophySub: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
  trophyName: { fontSize: fontSize.xl, fontWeight: fontWeight.extrabold, color: colors.ink, marginTop: 2 },
  trophyValue: { fontSize: 12.5, color: colors.muted, fontWeight: fontWeight.medium, marginTop: 2 },
  legRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  legRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.line },
  badge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  badgeTxt: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.xl },
  legHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  legName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, color: colors.ink },
  legVal: { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.green },
  progressTrack: { height: 7, borderRadius: 5, backgroundColor: colors.chip, overflow: 'hidden' },
  progressFill: { height: '100%', minWidth: 6, borderRadius: 5 },
  bacRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  bacIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  bacIconTxt: { fontSize: 20 },
  bacSub: { fontSize: 12.5, color: colors.muted, fontWeight: fontWeight.medium },
});
