import { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getLegumes, getBacs, getSeasonLegumeIds, getActiveSeason, upsertHarvest, deleteHarvest } from '../../db/queries';
import HarvestSheet from './HarvestSheet';
import type { Legume, Bac } from '../../types';

export default function GlobalHarvestSheet() {
  const { harvestOpen } = useAppStore();
  const [legumes, setLegumes] = useState<Legume[]>([]);
  const [bacs, setBacs] = useState<Bac[]>([]);
  const [activeSeason, setActiveSeason] = useState<number | null>(null);
  const [seasonLegumeIds, setSeasonLegumeIds] = useState<string[]>([]);

  async function load() {
    const s = await getActiveSeason();
    if (!s) return;
    setActiveSeason(s.id);
    const [l, b, ids] = await Promise.all([getLegumes(), getBacs(), getSeasonLegumeIds(s.id)]);
    setLegumes(l);
    setBacs(b);
    setSeasonLegumeIds(ids);
  }

  useEffect(() => {
    if (harvestOpen) load();
  }, [harvestOpen]);

  if (!activeSeason) return null;

  const seasonLegumes = legumes.filter(l => seasonLegumeIds.includes(l.id));

  return (
    <HarvestSheet
      seasonLegumes={seasonLegumes}
      bacs={bacs}
      activeSeason={activeSeason}
      onSave={async (h) => { await upsertHarvest(h); }}
      onDelete={async (id) => { await deleteHarvest(id); }}
    />
  );
}
