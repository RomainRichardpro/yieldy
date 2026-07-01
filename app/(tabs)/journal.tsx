import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { colors, spacing, radius, fontSize, fontWeight } from '../../src/utils/tokens';
import { fmt, initial, valeurRecolte, qtyLabel, relDate } from '../../src/utils/format';
import { getLegumes, getBacs, getHarvests, getActiveSeason, getSeasonLegumeIds, upsertHarvest, deleteHarvest } from '../../src/db/queries';
import { useAppStore } from '../../src/store/useAppStore';
import HarvestSheet from '../../src/components/sheets/HarvestSheet';
import EmptyState from '../../src/components/ui/EmptyState';
import type { Legume, Bac, Harvest } from '../../src/types';

export default function JournalScreen() {
  const [legumes, setLegumes] = useState<Legume[]>([]);
  const [bacs, setBacs] = useState<Bac[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [activeSeason, setActiveSeason] = useState<number | null>(null);
  const [seasonLegumeIds, setSeasonLegumeIds] = useState<string[]>([]);
  const [filterLegumeId, setFilterLegumeId] = useState<string | null>(null);
  const { openHarvest } = useAppStore();

  async function load() {
    const s = await getActiveSeason();
    if (!s) return;
    setActiveSeason(s.id);
    const [l, b, h, ids] = await Promise.all([
      getLegumes(), getBacs(), getHarvests(s.id), getSeasonLegumeIds(s.id)
    ]);
    setLegumes(l); setBacs(b); setHarvests(h); setSeasonLegumeIds(ids);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  if (!activeSeason) return null;

  const legMap = Object.fromEntries(legumes.map(l => [l.id, l]));
  const bacMap = Object.fromEntries(bacs.map(b => [b.id, b]));
  const seasonLegumes = legumes.filter(l => seasonLegumeIds.includes(l.id));

  const filtered = filterLegumeId ? harvests.filter(h => h.legume_id === filterLegumeId) : harvests;

  // Group by date label
  const groups: { label: string; items: Harvest[] }[] = [];
  for (const h of filtered) {
    const label = relDate(h.date);
    const last = groups[groups.length - 1];
    if (last && last.label === label) { last.items.push(h); }
    else { groups.push({ label, items: [h] }); }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.h1}>Journal</Text>
          <Text style={styles.count}>{harvests.length} récolte{harvests.length !== 1 ? 's' : ''}</Text>
        </View>

        {/* Filter chips */}
        {seasonLegumes.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={styles.chipRow}>
            <Pressable
              onPress={() => setFilterLegumeId(null)}
              style={[styles.chip, !filterLegumeId && styles.chipActive]}
              accessibilityRole="radio"
              accessibilityLabel="Tous les légumes"
              accessibilityState={{ checked: !filterLegumeId }}
            >
              <Text style={[styles.chipTxt, !filterLegumeId && styles.chipTxtActive]}>Tous</Text>
            </Pressable>
            {seasonLegumes.map(l => (
              <Pressable
                key={l.id}
                onPress={() => setFilterLegumeId(filterLegumeId === l.id ? null : l.id)}
                style={[styles.chip, filterLegumeId === l.id && styles.chipActive, filterLegumeId === l.id && { borderColor: l.color }]}
                accessibilityRole="radio"
                accessibilityLabel={l.nom}
                accessibilityState={{ checked: filterLegumeId === l.id }}
              >
                <View style={[styles.chipDot, { backgroundColor: l.color }]} />
                <Text style={[styles.chipTxt, filterLegumeId === l.id && styles.chipTxtActive]}>{l.nom}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <EmptyState
            title="Aucune récolte"
            subtitle={filterLegumeId ? 'Aucune récolte pour ce légume' : 'Appuie sur + pour enregistrer ta première récolte'}
          />
        )}

        {/* Grouped list */}
        {groups.map(group => (
          <View key={group.label} style={styles.group}>
            <Text style={styles.groupLabel}>{group.label}</Text>
            <View style={styles.groupItems}>
              {group.items.map(h => {
                const l = legMap[h.legume_id];
                const b = bacMap[h.bac_id ?? ''];
                if (!l) return null;
                return (
                  <Pressable
                    key={h.id}
                    onPress={() => openHarvest(h.id, { date: h.date, legume_id: h.legume_id, qty: h.qty, poids: h.poids ? String(h.poids) : '', longueur: h.longueur ? String(h.longueur) : '', variete: h.variete ?? '', bac_id: h.bac_id ?? null, notes: h.notes ?? '' })}
                    style={styles.harvestRow}
                    accessibilityRole="button"
                    accessibilityLabel={`Modifier la récolte de ${legMap[h.legume_id]?.nom ?? 'légume'}`}
                  >
                    <View style={[styles.badge, { backgroundColor: l.color }]}>
                      <Text style={styles.badgeTxt}>{initial(l.nom)}</Text>
                    </View>
                    <View style={styles.harvestMeta}>
                      <Text style={styles.harvestNom}>{l.nom}{h.variete ? <Text style={styles.harvestVariete}> · {h.variete}</Text> : null}</Text>
                      <Text style={styles.harvestSub}>{qtyLabel(h, l)}{b ? ` · ${b.nom}` : ''}</Text>
                    </View>
                    <View style={styles.harvestRight}>
                      <Text style={styles.harvestValeur}>{fmt(valeurRecolte(h, l))}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

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
  h1: { fontSize: fontSize.h1, fontWeight: fontWeight.bold, color: colors.ink, letterSpacing: -0.5 },
  count: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, color: colors.muted },
  chipScroll: { marginTop: 14, marginHorizontal: -spacing.xl },
  chipRow: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.xl, paddingBottom: 2 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.chip, borderWidth: 1.5, borderColor: colors.inputBorder },
  chipActive: { backgroundColor: colors.greenSoft, borderColor: colors.green },
  chipDot: { width: 8, height: 8, borderRadius: 4 },
  chipTxt: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, color: colors.muted },
  chipTxtActive: { color: colors.green },
  group: { marginTop: 22 },
  groupLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, color: colors.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  groupItems: { gap: 8 },
  harvestRow: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 18, padding: 13, paddingHorizontal: 14 },
  badge: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  badgeTxt: { color: '#fff', fontWeight: fontWeight.bold, fontSize: fontSize.xl },
  harvestMeta: { flex: 1, minWidth: 0 },
  harvestNom: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.ink },
  harvestVariete: { fontWeight: fontWeight.medium, color: colors.muted },
  harvestSub: { fontSize: 12.5, color: colors.muted, fontWeight: fontWeight.medium, marginTop: 2 },
  harvestRight: { alignItems: 'flex-end' },
  harvestValeur: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: colors.green },
});
